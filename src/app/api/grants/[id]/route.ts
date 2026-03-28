import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getAuthenticatedOrg() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized", status: 401, supabase: null, orgId: null }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return { error: "User profile not found", status: 404, supabase: null, orgId: null }
  }

  return { error: null, status: null, supabase, orgId: profile.org_id }
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

  const { data: grant, error: grantError } = await supabase
    .from("grants")
    .select(`
      *,
      funders:funder_id ( id, name ),
      programs:program_id ( id, name )
    `)
    .eq("id", id)
    .eq("org_id", orgId)
    .single()

  if (grantError || !grant) {
    return Response.json({ error: "Grant not found" }, { status: 404 })
  }

  // Fetch report due dates
  const { data: dueDates } = await supabase
    .from("report_due_dates")
    .select("*")
    .eq("grant_id", id)
    .order("due_date", { ascending: true })

  return Response.json({
    ...grant,
    funder_name: grant.funders?.name ?? null,
    program_name: grant.programs?.name ?? null,
    report_due_dates: dueDates ?? [],
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  // Verify grant belongs to org
  const { data: existing } = await supabase
    .from("grants")
    .select("id")
    .eq("id", id)
    .eq("org_id", orgId)
    .single()

  if (!existing) {
    return Response.json({ error: "Grant not found" }, { status: 404 })
  }

  const body = await request.json()

  const updates: Record<string, unknown> = {}
  const allowedFields = [
    "funder_id",
    "program_id",
    "name",
    "grant_id_external",
    "amount",
    "period_start",
    "period_end",
    "purpose",
    "restrictions",
    "reporting_schedule",
    "status",
  ]

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: grant, error: updateError } = await supabase
    .from("grants")
    .update(updates)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single()

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json(grant)
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

  // Delete report due dates first (foreign key)
  await supabase.from("report_due_dates").delete().eq("grant_id", id)

  const { error: deleteError } = await supabase
    .from("grants")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId)

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
