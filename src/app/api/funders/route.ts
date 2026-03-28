import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 })
  }

  // Funders that have grants belonging to the user's org
  const { data: grantFunderIds } = await supabase
    .from("grants")
    .select("funder_id")
    .eq("org_id", profile.org_id)

  const funderIdsFromGrants = (grantFunderIds ?? [])
    .map((g) => g.funder_id)
    .filter(Boolean)

  // Funders the user's org created (via funder_templates)
  const { data: templateFunderIds } = await supabase
    .from("funder_templates")
    .select("funder_id")
    .eq("org_id", profile.org_id)

  const funderIdsFromTemplates = (templateFunderIds ?? [])
    .map((t) => t.funder_id)
    .filter(Boolean)

  // Combine all unique funder IDs
  const allFunderIds = [
    ...new Set([...funderIdsFromGrants, ...funderIdsFromTemplates]),
  ]

  // Query funders: community funders OR funders connected to user's org
  let query = supabase.from("funders").select("*")

  if (allFunderIds.length > 0) {
    query = query.or(`is_community.eq.true,id.in.(${allFunderIds.join(",")})`)
  } else {
    query = query.eq("is_community", true)
  }

  const { data: funders, error } = await query.order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get grant counts per funder for this org
  const { data: grantCounts } = await supabase
    .from("grants")
    .select("funder_id, id")
    .eq("org_id", profile.org_id)

  const grantCountMap: Record<string, number> = {}
  for (const g of grantCounts ?? []) {
    if (g.funder_id) {
      grantCountMap[g.funder_id] = (grantCountMap[g.funder_id] || 0) + 1
    }
  }

  // Check which funders have templates
  const funderIds = (funders ?? []).map((f) => f.id)
  const { data: templates } = funderIds.length > 0
    ? await supabase
        .from("funder_templates")
        .select("funder_id")
        .in("funder_id", funderIds)
    : { data: [] }

  const templateSet = new Set((templates ?? []).map((t) => t.funder_id))

  const enrichedFunders = (funders ?? []).map((f) => ({
    ...f,
    active_grants: grantCountMap[f.id] || 0,
    has_template: templateSet.has(f.id),
  }))

  return NextResponse.json(enrichedFunders)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { data: funder, error } = await supabase
    .from("funders")
    .insert({
      name: body.name.trim(),
      type: body.type || null,
      ein: body.ein || null,
      website: body.website || null,
      program_officer_name: body.program_officer_name || null,
      program_officer_email: body.program_officer_email || null,
      submission_method: body.submission_method || null,
      portal_url: body.portal_url || null,
      emphasis_areas: body.emphasis_areas || [],
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(funder, { status: 201 })
}
