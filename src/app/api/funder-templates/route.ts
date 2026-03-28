import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const funderId = request.nextUrl.searchParams.get("funder_id")
  if (!funderId) {
    return NextResponse.json(
      { error: "funder_id is required" },
      { status: 400 }
    )
  }

  const { data: template, error } = await supabase
    .from("funder_templates")
    .select("*, template_sections(*)")
    .eq("funder_id", funderId)
    .single()

  if (error) {
    // No template found is not an error
    if (error.code === "PGRST116") {
      return NextResponse.json({ template: null, sections: [] })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    template,
    sections: (template?.template_sections ?? []).sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order
    ),
  })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 })
  }

  const body = await request.json()
  const { funder_id, sections } = body

  if (!funder_id) {
    return NextResponse.json(
      { error: "funder_id is required" },
      { status: 400 }
    )
  }

  // Upsert the template
  const { data: existing } = await supabase
    .from("funder_templates")
    .select("id")
    .eq("funder_id", funder_id)
    .eq("org_id", profile.org_id)
    .single()

  let templateId: string

  if (existing) {
    templateId = existing.id
    await supabase
      .from("funder_templates")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", templateId)
  } else {
    const { data: newTemplate, error: createError } = await supabase
      .from("funder_templates")
      .insert({
        funder_id,
        org_id: profile.org_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
    templateId = newTemplate.id
  }

  // Delete existing sections and re-insert
  await supabase
    .from("template_sections")
    .delete()
    .eq("funder_template_id", templateId)

  if (sections && sections.length > 0) {
    const sectionRows = sections.map(
      (
        s: {
          name: string
          instructions: string
          word_limit: number | null
          required_fields: string[]
          emphasis_tags: string[]
        },
        idx: number
      ) => ({
        funder_template_id: templateId,
        name: s.name,
        instructions: s.instructions || "",
        word_limit: s.word_limit || null,
        required_fields: s.required_fields || [],
        emphasis_tags: s.emphasis_tags || [],
        order: idx,
      })
    )

    const { error: sectionsError } = await supabase
      .from("template_sections")
      .insert(sectionRows)

    if (sectionsError) {
      return NextResponse.json(
        { error: sectionsError.message },
        { status: 500 }
      )
    }
  }

  // Return the updated template with sections
  const { data: result } = await supabase
    .from("funder_templates")
    .select("*, template_sections(*)")
    .eq("id", templateId)
    .single()

  return NextResponse.json(result)
}
