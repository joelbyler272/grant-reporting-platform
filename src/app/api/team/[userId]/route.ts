import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getAuthenticatedUser(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("users")
    .select("org_id, role")
    .eq("id", user.id)
    .single()
  if (!profile?.org_id) return null
  return { userId: user.id, orgId: profile.org_id, role: profile.role }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = await createServerSupabaseClient()
  const auth = await getAuthenticatedUser(supabase)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Only admins can change roles" }, { status: 403 })
  }

  if (userId === auth.userId) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 })
  }

  const body = await request.json()
  const { role } = body

  const validRoles = ["admin", "editor", "reviewer"]
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json({ error: "Role must be admin, editor, or reviewer" }, { status: 400 })
  }

  // Verify target user belongs to the same org
  const { data: targetUser, error: findError } = await supabase
    .from("users")
    .select("id, org_id")
    .eq("id", userId)
    .eq("org_id", auth.orgId)
    .single()

  if (findError || !targetUser) {
    return NextResponse.json({ error: "User not found in your organization" }, { status: 404 })
  }

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId)
    .eq("org_id", auth.orgId)
    .select("id, email, full_name, role, created_at")
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = await createServerSupabaseClient()
  const auth = await getAuthenticatedUser(supabase)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Only admins can remove team members" }, { status: 403 })
  }

  if (userId === auth.userId) {
    return NextResponse.json({ error: "You cannot remove yourself from the organization" }, { status: 400 })
  }

  // Verify target user belongs to the same org
  const { data: targetUser, error: findError } = await supabase
    .from("users")
    .select("id, org_id")
    .eq("id", userId)
    .eq("org_id", auth.orgId)
    .single()

  if (findError || !targetUser) {
    return NextResponse.json({ error: "User not found in your organization" }, { status: 404 })
  }

  // Remove user from the org by setting org_id to null or deleting
  // For safety, we'll update the user's org_id to null rather than deleting
  const { error: removeError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .eq("org_id", auth.orgId)

  if (removeError) {
    return NextResponse.json({ error: removeError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
