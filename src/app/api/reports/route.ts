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

export async function GET() {
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select(`
      *,
      grants:grant_id (
        id,
        name,
        funders:funder_id ( id, name ),
        programs:program_id ( id, name )
      )
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  if (reportsError) {
    return Response.json({ error: reportsError.message }, { status: 500 })
  }

  const enrichedReports = (reports ?? []).map((report) => ({
    ...report,
    grant_name: report.grants?.name ?? null,
    funder_name: report.grants?.funders?.name ?? null,
    program_name: report.grants?.programs?.name ?? null,
  }))

  return Response.json(enrichedReports)
}

export async function POST(request: Request) {
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  const body = await request.json()
  const { grant_id, title, due_date_id } = body

  if (!grant_id || !title) {
    return Response.json(
      { error: "grant_id and title are required" },
      { status: 400 }
    )
  }

  // Verify grant belongs to org
  const { data: grant } = await supabase
    .from("grants")
    .select("id")
    .eq("id", grant_id)
    .eq("org_id", orgId)
    .single()

  if (!grant) {
    return Response.json({ error: "Grant not found" }, { status: 404 })
  }

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      org_id: orgId,
      grant_id,
      title,
      due_date_id: due_date_id || null,
      status: "draft",
      version: 1,
    })
    .select()
    .single()

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  return Response.json(report, { status: 201 })
}
