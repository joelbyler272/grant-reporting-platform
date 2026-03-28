import { createServerSupabaseClient } from "@/lib/supabase/server"

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  // Verify report belongs to org
  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .eq("org_id", orgId)
    .single()

  if (!report) {
    return Response.json({ error: "Report not found" }, { status: 404 })
  }

  const { data: versions, error: versionsError } = await supabase
    .from("report_versions")
    .select("*")
    .eq("report_id", reportId)
    .order("version_number", { ascending: false })

  if (versionsError) {
    return Response.json({ error: versionsError.message }, { status: 500 })
  }

  return Response.json(versions ?? [])
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params
  const { error, status, supabase, orgId, userId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  // Fetch report and verify ownership
  const { data: report } = await supabase
    .from("reports")
    .select("id, content, version")
    .eq("id", reportId)
    .eq("org_id", orgId)
    .single()

  if (!report) {
    return Response.json({ error: "Report not found" }, { status: 404 })
  }

  const newVersionNumber = report.version + 1

  // Create version snapshot of current content
  const { data: version, error: versionError } = await supabase
    .from("report_versions")
    .insert({
      report_id: reportId,
      version_number: newVersionNumber,
      content: report.content,
      created_by: userId,
    })
    .select()
    .single()

  if (versionError) {
    return Response.json({ error: versionError.message }, { status: 500 })
  }

  // Increment version on the report
  const { error: updateError } = await supabase
    .from("reports")
    .update({ version: newVersionNumber })
    .eq("id", reportId)
    .eq("org_id", orgId)

  if (updateError) {
    console.error("Failed to update report version number:", updateError)
  }

  return Response.json(version, { status: 201 })
}
