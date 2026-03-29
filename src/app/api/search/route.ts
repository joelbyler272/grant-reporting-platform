import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getOrgId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()
  return profile?.org_id ?? null
}

interface SearchResult {
  id: string
  name: string
  type: string
  url: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({
      programs: [],
      funders: [],
      grants: [],
      reports: [],
    })
  }

  const supabase = await createServerSupabaseClient()
  const orgId = await getOrgId(supabase)
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pattern = `%${query}%`

  // Run all searches in parallel
  const [programsRes, fundersRes, grantsRes, reportsRes] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, description")
      .eq("org_id", orgId)
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("funders")
      .select("id, name")
      .ilike("name", pattern)
      .limit(5),
    supabase
      .from("grants")
      .select("id, name")
      .eq("org_id", orgId)
      .ilike("name", pattern)
      .limit(5),
    supabase
      .from("reports")
      .select("id, title")
      .eq("org_id", orgId)
      .ilike("title", pattern)
      .limit(5),
  ])

  const programs: SearchResult[] = (programsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    type: "program",
    url: `/programs/${p.id}`,
  }))

  const funders: SearchResult[] = (fundersRes.data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    type: "funder",
    url: `/funders/${f.id}`,
  }))

  const grants: SearchResult[] = (grantsRes.data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    type: "grant",
    url: `/grants/${g.id}`,
  }))

  const reports: SearchResult[] = (reportsRes.data ?? []).map((r) => ({
    id: r.id,
    name: r.title,
    type: "report",
    url: `/reports/${r.id}`,
  }))

  return NextResponse.json({ programs, funders, grants, reports })
}
