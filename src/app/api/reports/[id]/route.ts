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
  const { id } = await params
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(`
      *,
      grants:grant_id (
        id,
        name,
        purpose,
        period_start,
        period_end,
        funders:funder_id ( id, name ),
        programs:program_id ( id, name )
      ),
      report_due_dates:due_date_id (
        id,
        due_date,
        period_label,
        period_start,
        period_end,
        status
      )
    `)
    .eq("id", id)
    .eq("org_id", orgId)
    .single()

  if (reportError || !report) {
    return Response.json({ error: "Report not found" }, { status: 404 })
  }

  return Response.json({
    ...report,
    grant_name: report.grants?.name ?? null,
    funder_name: report.grants?.funders?.name ?? null,
    program_name: report.grants?.programs?.name ?? null,
    due_date: report.report_due_dates?.due_date ?? null,
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase, orgId, userId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  // Verify report belongs to org
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("id", id)
    .eq("org_id", orgId)
    .single()

  if (!existing) {
    return Response.json({ error: "Report not found" }, { status: 404 })
  }

  const body = await request.json()

  const updates: Record<string, unknown> = {}
  const allowedFields = [
    "title",
    "content",
    "status",
    "submitted_at",
    "submitted_by",
    "submission_method",
    "submission_notes",
  ]

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: report, error: updateError } = await supabase
    .from("reports")
    .update(updates)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single()

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json(report)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  // Delete related records first (foreign keys)
  await supabase.from("comments").delete().eq("report_id", id)
  await supabase.from("report_versions").delete().eq("report_id", id)

  const { error: deleteError } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId)

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
