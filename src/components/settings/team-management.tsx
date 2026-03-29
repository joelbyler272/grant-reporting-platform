"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, MoreHorizontal, Plus, Trash2, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserRole } from "@/types"

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

const ROLE_BADGE_VARIANT: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  editor: "secondary",
  reviewer: "outline",
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteFullName, setInviteFullName] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("editor")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  // Remove confirmation state
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)
  const [removing, setRemoving] = useState(false)

  const isAdmin = currentUserRole === "admin"

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team")
      if (!res.ok) throw new Error("Failed to load team")
      const data = await res.json()
      setMembers(data.members)
      setCurrentUserId(data.current_user_id)
      setCurrentUserRole(data.current_user_role)
    } catch {
      setError("Failed to load team members")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  async function handleInvite() {
    setInviteError(null)
    if (!inviteEmail.trim()) {
      setInviteError("Email is required")
      return
    }
    if (!inviteFullName.trim()) {
      setInviteError("Full name is required")
      return
    }

    setInviting(true)
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          full_name: inviteFullName.trim(),
          role: inviteRole,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to invite member")
      }
      const newMember = await res.json()
      setMembers((prev) => [...prev, newMember])
      setInviteOpen(false)
      setInviteEmail("")
      setInviteFullName("")
      setInviteRole("editor")
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to invite")
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(memberId: string, newRole: UserRole) {
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to update role")
      }
      const updated = await res.json()
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
      setTimeout(() => setError(null), 4000)
    }
  }

  async function handleRemove() {
    if (!removeTarget) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/team/${removeTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to remove member")
      }
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id))
      setRemoveTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member")
      setTimeout(() => setError(null), 4000)
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading team members...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <UserPlus className="size-4" />
                  Invite Member
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your organization. They will receive a
                  temporary password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                {inviteError && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {inviteError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="team@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-name">Full Name</Label>
                  <Input
                    id="invite-name"
                    placeholder="Jane Doe"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole((v ?? "editor") as UserRole)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting && <Loader2 className="size-4 animate-spin" />}
                  {inviting ? "Inviting..." : "Send Invite"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Table */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Joined</div>
          <div className="w-8" />
        </div>
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId
          return (
            <div
              key={member.id}
              className={`grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 border-b px-4 py-3 text-sm last:border-0 ${
                isCurrentUser ? "bg-accent/30" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {member.full_name ?? "Unnamed"}
                </span>
                {isCurrentUser && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
              </div>
              <div className="truncate text-muted-foreground">
                {member.email}
              </div>
              <div>
                <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
                  {member.role}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(member.created_at).toLocaleDateString()}
              </div>
              <div className="w-8">
                {isAdmin && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, "admin")}
                        disabled={member.role === "admin"}
                      >
                        Set as Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, "editor")}
                        disabled={member.role === "editor"}
                      >
                        Set as Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, "reviewer")}
                        disabled={member.role === "reviewer"}
                      >
                        Set as Reviewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setRemoveTarget(member)}
                      >
                        <Trash2 className="size-4" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
        {members.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No team members found.
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{removeTarget?.full_name ?? removeTarget?.email}</strong>{" "}
              from your organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing && <Loader2 className="size-4 animate-spin" />}
              {removing ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
