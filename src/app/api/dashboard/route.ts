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

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0]
  const yearStart = `${currentYear}-01-01`
  const today = now.toISOString().split("T")[0]

  // Run all queries in parallel
  const [
    reportsDueRes,
    activeGrantsRes,
    totalFundingRes,
    reportsSubmittedRes,
    upcomingReportsRes,
    recentReportsRes,
    recentProgramDataRes,
    alertDueDatesRes,
    staleProgramDataRes,
  ] = await Promise.all([
    // 1. Reports due this month (report_due_dates where due_date in current month and status != 'submitted')
    supabase
      .from("report_due_dates")
      .select("id, grant_id, grants!inner(org_id)", { count: "exact", head: true })
      .gte("due_date", monthStart)
      .lte("due_date", monthEnd)
      .neq("status", "submitted")
      .eq("grants.org_id", orgId),

    // 2. Active grants count
    supabase
      .from("grants")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "active"),

    // 3. Total funding (sum of active grants)
    supabase
      .from("grants")
      .select("amount")
      .eq("org_id", orgId)
      .eq("status", "active"),

    // 4. Reports submitted YTD
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "submitted")
      .gte("submitted_at", yearStart),

    // 5. Upcoming reports (due dates with status upcoming or overdue)
    supabase
      .from("report_due_dates")
      .select(`
        id,
        grant_id,
        due_date,
        period_label,
        status,
        grants!inner (
          id,
          name,
          org_id,
          funders:funder_id ( name ),
          programs:program_id ( name )
        )
      `)
      .eq("grants.org_id", orgId)
      .in("status", ["upcoming", "overdue"])
      .order("due_date", { ascending: true })
      .limit(10),

    // 6. Recent reports (last 5 created/updated)
    supabase
      .from("reports")
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        submitted_at,
        grants:grant_id ( name )
      `)
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(5),

    // 7. Recent program data (last 5)
    supabase
      .from("program_data")
      .select(`
        id,
        period_label,
        created_at,
        updated_at,
        programs:program_id ( name, org_id )
      `)
      .order("updated_at", { ascending: false })
      .limit(10),

    // 8. Alert: overdue due dates
    supabase
      .from("report_due_dates")
      .select(`
        id,
        due_date,
        status,
        grants!inner (
          name,
          org_id,
          funders:funder_id ( name )
        )
      `)
      .eq("grants.org_id", orgId)
      .in("status", ["upcoming", "overdue"])
      .lte("due_date", new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),

    // 9. Alert: stale program data (updated > 30 days ago)
    supabase
      .from("program_data")
      .select(`
        id,
        updated_at,
        programs:program_id ( name, org_id )
      `)
      .lt("updated_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // --- Compute stats ---
  const reportsDueThisMonth = reportsDueRes.count ?? 0
  const activeGrants = activeGrantsRes.count ?? 0
  const totalFunding = (totalFundingRes.data ?? []).reduce(
    (sum, g) => sum + (g.amount ?? 0),
    0
  )
  const reportsSubmittedYtd = reportsSubmittedRes.count ?? 0

  // --- Compute upcoming reports with days_remaining ---
  const upcomingReports = (upcomingReportsRes.data ?? []).map((rd) => {
    const dueDate = new Date(rd.due_date + "T00:00:00")
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const daysRemaining = Math.round(
      (dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const grant = rd.grants as unknown as {
      id: string
      name: string
      org_id: string
      funders: { name: string } | null
      programs: { name: string } | null
    }

    return {
      id: rd.id,
      grant_id: rd.grant_id,
      due_date: rd.due_date,
      period_label: rd.period_label,
      status: rd.status,
      days_remaining: daysRemaining,
      grant_name: grant?.name ?? null,
      funder_name: grant?.funders?.name ?? null,
      program_name: grant?.programs?.name ?? null,
    }
  })

  // --- Compute recent activity ---
  type ActivityItem = {
    type: "report_generated" | "data_updated" | "report_submitted"
    description: string
    timestamp: string
  }

  const activity: ActivityItem[] = []

  for (const r of recentReportsRes.data ?? []) {
    const grantName = (r.grants as unknown as { name: string } | null)?.name ?? "Unknown grant"
    if (r.status === "submitted" && r.submitted_at) {
      activity.push({
        type: "report_submitted",
        description: `Report "${r.title}" for ${grantName} was submitted`,
        timestamp: r.submitted_at,
      })
    } else {
      activity.push({
        type: "report_generated",
        description: `Report "${r.title}" for ${grantName} was ${r.created_at === r.updated_at ? "created" : "updated"}`,
        timestamp: r.updated_at,
      })
    }
  }

  // Filter program_data to only include items from user's org
  const orgProgramData = (recentProgramDataRes.data ?? []).filter(
    (pd) => (pd.programs as unknown as { name: string; org_id: string } | null)?.org_id === orgId
  )

  for (const pd of orgProgramData.slice(0, 5)) {
    const programName =
      (pd.programs as unknown as { name: string; org_id: string } | null)?.name ?? "Unknown program"
    activity.push({
      type: "data_updated",
      description: `Program data for ${programName} was updated${pd.period_label ? ` (${pd.period_label})` : ""}`,
      timestamp: pd.updated_at,
    })
  }

  // Sort by timestamp desc and take top 10
  activity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const recentActivity = activity.slice(0, 10)

  // --- Compute alerts ---
  type Alert = {
    type: "stale_data" | "overdue_report"
    severity: "warning" | "error"
    message: string
  }

  const alerts: Alert[] = []

  // Overdue reports
  for (const dd of alertDueDatesRes.data ?? []) {
    const grant = dd.grants as unknown as {
      name: string
      org_id: string
      funders: { name: string } | null
    }

    if (dd.status === "overdue" || dd.due_date < today) {
      alerts.push({
        type: "overdue_report",
        severity: "error",
        message: `Report for "${grant?.name}" (${grant?.funders?.name ?? "Unknown funder"}) is overdue (due ${dd.due_date})`,
      })
    }
  }

  // Stale program data when a report is due within 14 days
  const hasDueSoon = (alertDueDatesRes.data ?? []).length > 0
  if (hasDueSoon) {
    const staleOrgData = (staleProgramDataRes.data ?? []).filter(
      (pd) =>
        (pd.programs as unknown as { name: string; org_id: string } | null)?.org_id === orgId
    )

    for (const pd of staleOrgData) {
      const programName =
        (pd.programs as unknown as { name: string; org_id: string } | null)?.name ??
        "Unknown program"
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(pd.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      alerts.push({
        type: "stale_data",
        severity: "warning",
        message: `Program data for "${programName}" hasn't been updated in ${daysSinceUpdate} days and a report is due soon`,
      })
    }
  }

  return Response.json({
    reports_due_this_month: reportsDueThisMonth,
    active_grants: activeGrants,
    total_funding: totalFunding,
    reports_submitted_ytd: reportsSubmittedYtd,
    upcoming_reports: upcomingReports,
    recent_activity: recentActivity,
    alerts,
  })
}
