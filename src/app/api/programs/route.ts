import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkLimit } from "@/lib/billing/limits"

async function getOrgId(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()
  return profile?.org_id ?? null
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getOrgId(supabase)
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch programs with a count of active grants
  const { data: programs, error } = await supabase
    .from("programs")
    .select(`
      *,
      grants!grants_program_id_fkey(id, status),
      program_data(completeness_score, created_at)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to include active_grants_count and latest completeness
  const transformed = (programs ?? []).map((program) => {
    const grants = Array.isArray(program.grants) ? program.grants : []
    const activeGrants = grants.filter(
      (g: { status: string }) => g.status === "active"
    )
    const programData = Array.isArray(program.program_data)
      ? program.program_data
      : []
    // Sort by created_at desc to find the latest
    const sorted = programData.sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const latestCompleteness = sorted[0]?.completeness_score ?? null

    const { grants: _g, program_data: _pd, ...rest } = program
    return {
      ...rest,
      active_grants_count: activeGrants.length,
      completeness_score: latestCompleteness,
    }
  })

  return NextResponse.json(transformed)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const orgId = await getOrgId(supabase)
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check plan limits before creating
  const limitCheck = await checkLimit(orgId, "programs")
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: "Free plan limit reached",
        limit: limitCheck.limit,
        current: limitCheck.current,
        upgrade_url: "/settings?tab=billing",
      },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { name, description, population_served, geography } = body

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    )
  }

  const { data: program, error } = await supabase
    .from("programs")
    .insert({
      org_id: orgId,
      name: name.trim(),
      description: description || null,
      population_served: population_served || null,
      geography: geography || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(program, { status: 201 })
}
