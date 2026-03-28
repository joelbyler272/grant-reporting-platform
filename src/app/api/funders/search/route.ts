import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = request.nextUrl.searchParams.get("q") ?? ""
  if (!q.trim()) {
    return NextResponse.json([])
  }

  const { data: funders, error } = await supabase
    .from("funders")
    .select("id, name, type, is_community")
    .eq("is_community", true)
    .ilike("name", `%${q.trim()}%`)
    .order("name")
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get template section counts for matching funders
  const funderIds = (funders ?? []).map((f) => f.id)
  const { data: sections } = funderIds.length > 0
    ? await supabase
        .from("template_sections")
        .select("funder_template_id, funder_templates!inner(funder_id)")
        .in("funder_templates.funder_id", funderIds)
    : { data: [] }

  // Count sections per funder
  const sectionCountMap: Record<string, number> = {}
  for (const s of sections ?? []) {
    const funderId = (s as Record<string, unknown>).funder_templates as unknown as { funder_id: string }
    if (funderId?.funder_id) {
      sectionCountMap[funderId.funder_id] =
        (sectionCountMap[funderId.funder_id] || 0) + 1
    }
  }

  const results = (funders ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    is_community: f.is_community,
    template_section_count: sectionCountMap[f.id] || 0,
  }))

  return NextResponse.json(results)
}
