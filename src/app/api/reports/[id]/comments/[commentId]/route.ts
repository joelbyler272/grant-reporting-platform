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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id: reportId, commentId } = await params
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

  // Verify comment belongs to this report
  const { data: existing } = await supabase
    .from("comments")
    .select("id")
    .eq("id", commentId)
    .eq("report_id", reportId)
    .single()

  if (!existing) {
    return Response.json({ error: "Comment not found" }, { status: 404 })
  }

  const body = await request.json()

  const updates: Record<string, unknown> = {}
  if (body.body !== undefined) updates.body = body.body
  if (body.resolved !== undefined) updates.resolved = body.resolved

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: comment, error: updateError } = await supabase
    .from("comments")
    .update(updates)
    .eq("id", commentId)
    .eq("report_id", reportId)
    .select(`
      *,
      users:user_id ( id, full_name, email )
    `)
    .single()

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({
    ...comment,
    user_name: comment.users?.full_name ?? comment.users?.email ?? null,
  })
}
