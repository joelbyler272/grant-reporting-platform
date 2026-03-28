import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params
  const supabase = await createServerSupabaseClient()
  const orgId = await getOrgId(supabase)
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify program belongs to org
  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("org_id", orgId)
    .single()

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("program_data")
    .select("*")
    .eq("program_id", programId)
    .order("period_start", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params
  const supabase = await createServerSupabaseClient()
  const orgId = await getOrgId(supabase)
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify program belongs to org
  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("org_id", orgId)
    .single()

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 })
  }

  const body = await request.json()
  const {
    period_label,
    period_start,
    period_end,
    source,
    outcomes_data,
    metrics_data,
    client_stories,
    challenges,
    financials,
    completeness_score,
    ...rest
  } = body

  if (!period_label || !period_start || !period_end) {
    return NextResponse.json(
      { error: "period_label, period_start, and period_end are required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("program_data")
    .insert({
      program_id: programId,
      period_label,
      period_start,
      period_end,
      source: source || "manual",
      outcomes_data: outcomes_data || null,
      metrics_data: metrics_data || null,
      client_stories: client_stories || null,
      challenges: challenges || null,
      financials: financials || null,
      completeness_score: completeness_score ?? 0,
      ...rest,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
