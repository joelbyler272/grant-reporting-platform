import { NextResponse } from "next/server"
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server"

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

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const auth = await getAuthenticatedUser(supabase)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: members, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at")
    .eq("org_id", auth.orgId)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    members: members ?? [],
    current_user_id: auth.userId,
    current_user_role: auth.role,
  })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const auth = await getAuthenticatedUser(supabase)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Only admins can invite team members" }, { status: 403 })
  }

  const body = await request.json()
  const { email, full_name, role } = body

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }
  if (!full_name?.trim()) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 })
  }
  const validRoles = ["admin", "editor", "reviewer"]
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json({ error: "Role must be admin, editor, or reviewer" }, { status: 400 })
  }

  // Check if user already exists in this org
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .eq("org_id", auth.orgId)
    .maybeSingle()

  if (existingUser) {
    return NextResponse.json({ error: "This user is already a member of your organization" }, { status: 409 })
  }

  // Create auth user via service role client
  const adminClient = createServiceRoleClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { full_name: full_name.trim(), org_name: "Invited" },
  })

  if (authError) {
    // If user already exists in auth but not in this org, we can still add them
    if (authError.message?.includes("already been registered")) {
      return NextResponse.json(
        { error: "A user with this email already exists. They may need to be added through a different flow." },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }

  // The handle_new_user trigger will fire and create a new org + user row.
  // We need to update the users row to point to the correct org and role.
  const { error: updateError } = await adminClient
    .from("users")
    .update({
      org_id: auth.orgId,
      role,
      full_name: full_name.trim(),
    })
    .eq("id", authData.user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Clean up the auto-created org from the trigger (if it was created)
  // We can safely ignore errors here since the org might not exist
  // or might have other users
  const { data: autoOrg } = await adminClient
    .from("organizations")
    .select("id")
    .eq("name", "Invited")
    .single()

  if (autoOrg) {
    // Only delete if no other users belong to it
    const { data: orgUsers } = await adminClient
      .from("users")
      .select("id")
      .eq("org_id", autoOrg.id)

    if (!orgUsers || orgUsers.length === 0) {
      await adminClient.from("organizations").delete().eq("id", autoOrg.id)
    }
  }

  // Fetch the final user record
  const { data: newMember } = await adminClient
    .from("users")
    .select("id, email, full_name, role, created_at")
    .eq("id", authData.user.id)
    .single()

  return NextResponse.json(newMember, { status: 201 })
}
