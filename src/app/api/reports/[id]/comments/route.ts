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

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(`
      *,
      users:user_id ( id, full_name, email )
    `)
    .eq("report_id", reportId)
    .order("created_at", { ascending: true })

  if (commentsError) {
    return Response.json({ error: commentsError.message }, { status: 500 })
  }

  const enrichedComments = (comments ?? []).map((comment) => ({
    ...comment,
    user_name: comment.users?.full_name ?? comment.users?.email ?? null,
  }))

  return Response.json(enrichedComments)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params
  const { error, status, supabase, orgId, userId } = await getAuthenticatedOrg()
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

  const body = await request.json()
  const { section_key, body: commentBody } = body

  if (!commentBody) {
    return Response.json({ error: "body is required" }, { status: 400 })
  }

  const { data: comment, error: insertError } = await supabase
    .from("comments")
    .insert({
      report_id: reportId,
      section_key: section_key || null,
      user_id: userId,
      body: commentBody,
      resolved: false,
    })
    .select(`
      *,
      users:user_id ( id, full_name, email )
    `)
    .single()

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  return Response.json(
    {
      ...comment,
      user_name: comment.users?.full_name ?? comment.users?.email ?? null,
    },
    { status: 201 }
  )
}
