import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Look up the user's org_id from the users table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return Response.json(
      { error: "User profile not found" },
      { status: 404 }
    )
  }

  // Fetch the organization
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.org_id)
    .single()

  if (orgError || !organization) {
    return Response.json(
      { error: "Organization not found" },
      { status: 404 }
    )
  }

  return Response.json(organization)
}

export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Look up the user's org_id
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return Response.json(
      { error: "User profile not found" },
      { status: 404 }
    )
  }

  const body = await request.json()

  // Only allow updating specific fields
  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.ein !== undefined) updates.ein = body.ein
  if (body.mission !== undefined) updates.mission = body.mission
  if (body.address !== undefined) updates.address = body.address
  if (body.fiscal_year_start !== undefined)
    updates.fiscal_year_start = body.fiscal_year_start

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: organization, error: updateError } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", profile.org_id)
    .select()
    .single()

  if (updateError) {
    return Response.json(
      { error: updateError.message },
      { status: 500 }
    )
  }

  return Response.json(organization)
}
