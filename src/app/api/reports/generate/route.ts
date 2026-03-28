import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getAnthropicClient } from "@/lib/anthropic/client"
import { buildReportSystemPrompt, buildReportUserPrompt } from "@/lib/anthropic/prompts"
import type { ReportContentSection, TemplateSection } from "@/types"

async function getAuthenticatedOrg() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized", status: 401, supabase: null, orgId: null, userId: null }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return { error: "User profile not found", status: 404, supabase: null, orgId: null, userId: null }
  }

  return { error: null, status: null, supabase, orgId: profile.org_id, userId: user.id }
}

function countWords(text: string | null): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function POST(request: Request) {
  const { error, status, supabase, orgId, userId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  const body = await request.json()
  const { grant_id, period_label } = body

  if (!grant_id) {
    return Response.json({ error: "grant_id is required" }, { status: 400 })
  }

  // 1. Fetch grant with funder and program
  const { data: grant, error: grantError } = await supabase
    .from("grants")
    .select(`
      *,
      funders:funder_id ( * ),
      programs:program_id ( * )
    `)
    .eq("id", grant_id)
    .eq("org_id", orgId)
    .single()

  if (grantError || !grant) {
    return Response.json({ error: "Grant not found" }, { status: 404 })
  }

  // 2. Fetch funder template (org-specific first, then community fallback)
  let template = null
  const { data: orgTemplate } = await supabase
    .from("funder_templates")
    .select("*")
    .eq("funder_id", grant.funder_id)
    .eq("org_id", orgId)
    .single()

  if (orgTemplate) {
    template = orgTemplate
  } else {
    const { data: communityTemplate } = await supabase
      .from("funder_templates")
      .select("*")
      .eq("funder_id", grant.funder_id)
      .is("org_id", null)
      .single()

    template = communityTemplate
  }

  if (!template?.sections || template.sections.length === 0) {
    return Response.json(
      { error: "No report template found for this funder. Please create a template first." },
      { status: 400 }
    )
  }

  const sections: TemplateSection[] = template.sections

  // 3. Fetch latest program_data for the grant's program
  let programData = null
  if (grant.program_id) {
    let query = supabase
      .from("program_data")
      .select("*")
      .eq("program_id", grant.program_id)

    if (period_label) {
      query = query.eq("period_label", period_label)
    }

    const { data: programDataRows } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    programData = programDataRows
  }

  if (!programData) {
    return Response.json(
      { error: "No program data found. Please add program data before generating a report." },
      { status: 400 }
    )
  }

  // 4. Fetch organization info
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single()

  if (!organization) {
    return Response.json({ error: "Organization not found" }, { status: 404 })
  }

  // 5. Build prompts
  const emphasisAreas: string[] = Array.isArray(grant.funders?.emphasis_areas)
    ? grant.funders.emphasis_areas
    : typeof grant.funders?.emphasis_areas === "object" && grant.funders?.emphasis_areas !== null
      ? Object.values(grant.funders.emphasis_areas).filter((v): v is string => typeof v === "string")
      : []

  const systemPrompt = buildReportSystemPrompt()
  const userPrompt = buildReportUserPrompt({
    orgName: organization.name,
    orgMission: organization.mission,
    funderName: grant.funders?.name ?? "Unknown Funder",
    grantName: grant.name,
    grantPurpose: grant.purpose,
    periodLabel: period_label || programData.period_label || "Current Period",
    sections,
    programData,
    emphasisAreas,
  })

  // 6. Call Claude API
  let parsedContent: Record<string, string | null>
  try {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return Response.json(
        { error: "Failed to generate report: no text response from AI" },
        { status: 502 }
      )
    }

    // Strip markdown fences if present
    let rawJson = textBlock.text.trim()
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    parsedContent = JSON.parse(rawJson)
  } catch (err) {
    console.error("Claude API error:", err)
    const message = err instanceof SyntaxError
      ? "Failed to parse AI response. Please try again."
      : "Failed to generate report. Please try again later."
    return Response.json({ error: message }, { status: 502 })
  }

  // 7. Build report content with word counts and completeness flags
  const sectionMap = new Map(sections.map((s) => [s.id, s]))
  const content: Record<string, ReportContentSection> = {}
  const incompleteSections: string[] = []

  for (const section of sections) {
    const generated = parsedContent[section.id] ?? null
    const wordCount = countWords(generated)

    if (generated === null) {
      incompleteSections.push(section.name)
    }

    content[section.id] = {
      content: generated,
      word_count: wordCount,
      word_limit: section.word_limit,
      is_complete: generated !== null,
      ...(generated === null ? { missing_data: "Insufficient data to generate this section" } : {}),
    }
  }

  // 8. Create the report record
  const reportTitle = `${grant.funders?.name ?? "Funder"} - ${period_label || programData.period_label || "Report"}`

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      org_id: orgId,
      grant_id: grant.id,
      title: reportTitle,
      status: "draft",
      content,
      version: 1,
    })
    .select()
    .single()

  if (reportError) {
    console.error("Report insert error:", reportError)
    return Response.json({ error: "Failed to save the generated report." }, { status: 500 })
  }

  // 9. Create a report_version snapshot
  const { error: versionError } = await supabase
    .from("report_versions")
    .insert({
      report_id: report.id,
      version_number: 1,
      content,
      created_by: userId,
    })

  if (versionError) {
    console.error("Report version insert error:", versionError)
    // Non-fatal: report was created, version tracking just failed
  }

  return Response.json(
    {
      ...report,
      incomplete_sections: incompleteSections,
    },
    { status: 201 }
  )
}
