import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getOrgPlan, PLAN_LIMITS } from "@/lib/billing/limits"

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return Response.json({ error: "User profile not found" }, { status: 404 })
  }

  const orgId = profile.org_id

  // Fetch subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .single()

  const plan = await getOrgPlan(orgId)
  const limits = PLAN_LIMITS[plan]

  // Fetch current usage counts
  const [programsResult, fundersResult, teamResult] = await Promise.all([
    supabase
      .from("programs")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
    // Count distinct funders connected to this org via grants
    supabase
      .from("grants")
      .select("funder_id")
      .eq("org_id", orgId),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
  ])

  const uniqueFunderIds = new Set(
    (fundersResult.data ?? []).map((g) => g.funder_id).filter(Boolean)
  )

  return Response.json({
    plan,
    status: subscription?.status ?? "active",
    current_period_end: subscription?.current_period_end ?? null,
    usage: {
      programs: {
        current: programsResult.count ?? 0,
        limit: limits.programs === Infinity ? null : limits.programs,
      },
      funders: {
        current: uniqueFunderIds.size,
        limit: limits.funders === Infinity ? null : limits.funders,
      },
      team_members: {
        current: teamResult.count ?? 0,
        limit: limits.team_members === Infinity ? null : limits.team_members,
      },
    },
  })
}
