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

export async function GET() {
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  // Fetch grants with funder and program names
  const { data: grants, error: grantsError } = await supabase
    .from("grants")
    .select(`
      *,
      funders:funder_id ( id, name ),
      programs:program_id ( id, name )
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  if (grantsError) {
    return Response.json({ error: grantsError.message }, { status: 500 })
  }

  // Fetch next upcoming due date for each grant
  const grantIds = (grants ?? []).map((g) => g.id)

  let dueDatesMap: Record<string, { due_date: string; status: string }> = {}

  if (grantIds.length > 0) {
    const today = new Date().toISOString().split("T")[0]
    const { data: dueDates } = await supabase
      .from("report_due_dates")
      .select("grant_id, due_date, status")
      .in("grant_id", grantIds)
      .gte("due_date", today)
      .order("due_date", { ascending: true })

    if (dueDates) {
      for (const dd of dueDates) {
        // Keep only the earliest per grant
        if (!dueDatesMap[dd.grant_id]) {
          dueDatesMap[dd.grant_id] = { due_date: dd.due_date, status: dd.status }
        }
      }
    }

    // Also check for overdue dates
    const { data: overdueDates } = await supabase
      .from("report_due_dates")
      .select("grant_id, due_date, status")
      .in("grant_id", grantIds)
      .eq("status", "overdue")
      .order("due_date", { ascending: true })

    if (overdueDates) {
      for (const dd of overdueDates) {
        // Overdue takes priority
        if (!dueDatesMap[dd.grant_id] || dueDatesMap[dd.grant_id].status !== "overdue") {
          dueDatesMap[dd.grant_id] = { due_date: dd.due_date, status: dd.status }
        }
      }
    }
  }

  const enrichedGrants = (grants ?? []).map((grant) => ({
    ...grant,
    funder_name: grant.funders?.name ?? null,
    program_name: grant.programs?.name ?? null,
    next_due_date: dueDatesMap[grant.id]?.due_date ?? null,
    next_due_status: dueDatesMap[grant.id]?.status ?? null,
  }))

  return Response.json(enrichedGrants)
}

export async function POST(request: Request) {
  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  const body = await request.json()

  const {
    funder_id,
    program_id,
    name,
    grant_id_external,
    amount,
    period_start,
    period_end,
    purpose,
    restrictions,
    reporting_schedule,
    status: grantStatus,
  } = body

  if (!funder_id || !name) {
    return Response.json(
      { error: "funder_id and name are required" },
      { status: 400 }
    )
  }

  const { data: grant, error: insertError } = await supabase
    .from("grants")
    .insert({
      org_id: orgId,
      funder_id,
      program_id: program_id || null,
      name,
      grant_id_external: grant_id_external || null,
      amount: amount || null,
      period_start: period_start || null,
      period_end: period_end || null,
      purpose: purpose || null,
      restrictions: restrictions || null,
      reporting_schedule: reporting_schedule || null,
      status: grantStatus || "active",
    })
    .select()
    .single()

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  // Create report_due_dates from reporting_schedule if provided
  if (body.report_due_dates && Array.isArray(body.report_due_dates) && body.report_due_dates.length > 0) {
    const dueDateRows = body.report_due_dates.map(
      (dd: { period_label: string; due_date: string; period_start: string; period_end: string }) => ({
        grant_id: grant.id,
        period_label: dd.period_label,
        due_date: dd.due_date,
        period_start: dd.period_start,
        period_end: dd.period_end,
        status: "upcoming",
      })
    )

    const { error: ddError } = await supabase
      .from("report_due_dates")
      .insert(dueDateRows)

    if (ddError) {
      // Grant was created but due dates failed - log but don't fail
      console.error("Failed to create report due dates:", ddError.message)
    }
  }

  return Response.json(grant, { status: 201 })
}
