import { createServiceRoleClient } from "@/lib/supabase/server"

export const PLAN_LIMITS = {
  free: {
    programs: 1,
    funders: 3,
    team_members: 1,
    export: false,
    funder_notes: false,
  },
  pro: {
    programs: Infinity,
    funders: Infinity,
    team_members: 5,
    export: true,
    funder_notes: true,
  },
} as const

export async function getOrgPlan(orgId: string): Promise<"free" | "pro"> {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("org_id", orgId)
    .single()

  return (data?.plan as "free" | "pro") ?? "free"
}

export async function checkLimit(
  orgId: string,
  resource: "programs" | "funders" | "team_members"
): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
  const supabase = createServiceRoleClient()
  const plan = await getOrgPlan(orgId)
  const limits = PLAN_LIMITS[plan]
  const resourceLimit = limits[resource]

  let current = 0

  if (resource === "programs") {
    const { count } = await supabase
      .from("programs")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
    current = count ?? 0
  } else if (resource === "funders") {
    // Count distinct funders connected to this org via grants
    const { data: grantFunders } = await supabase
      .from("grants")
      .select("funder_id")
      .eq("org_id", orgId)
    const uniqueFunderIds = new Set(
      (grantFunders ?? []).map((g) => g.funder_id).filter(Boolean)
    )
    current = uniqueFunderIds.size
  } else if (resource === "team_members") {
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
    current = count ?? 0
  }

  return {
    allowed: current < resourceLimit,
    current,
    limit: resourceLimit === Infinity ? -1 : resourceLimit,
    plan,
  }
}
