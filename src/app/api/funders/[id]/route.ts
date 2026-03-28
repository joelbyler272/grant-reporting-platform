import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: funder, error } = await supabase
    .from("funders")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !funder) {
    return NextResponse.json({ error: "Funder not found" }, { status: 404 })
  }

  // Get template sections if available
  const { data: template } = await supabase
    .from("funder_templates")
    .select("*, template_sections(*)")
    .eq("funder_id", id)
    .single()

  // Get grants for this funder within user's org
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  const { data: grants } = profile?.org_id
    ? await supabase
        .from("grants")
        .select("*")
        .eq("funder_id", id)
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false })
    : { data: [] }

  // Get funder notes
  const { data: notes } = await supabase
    .from("funder_notes")
    .select("*")
    .eq("funder_id", id)
    .order("created_at", { ascending: false })

  return NextResponse.json({
    ...funder,
    template: template ?? null,
    template_sections: template?.template_sections ?? [],
    grants: grants ?? [],
    notes: notes ?? [],
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  const { data: funder, error } = await supabase
    .from("funders")
    .update({
      name: body.name,
      type: body.type || null,
      ein: body.ein || null,
      website: body.website || null,
      program_officer_name: body.program_officer_name || null,
      program_officer_email: body.program_officer_email || null,
      submission_method: body.submission_method || null,
      portal_url: body.portal_url || null,
      emphasis_areas: body.emphasis_areas || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(funder)
}
