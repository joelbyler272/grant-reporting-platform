"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Organization } from "@/types"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { TeamManagement } from "@/components/settings/team-management"
import { BillingSettings } from "@/components/settings/billing-settings"

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") ?? "organization"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState("")
  const [ein, setEin] = useState("")
  const [mission, setMission] = useState("")
  const [address, setAddress] = useState("")
  const [fiscalYearStart, setFiscalYearStart] = useState<number | null>(null)

  useEffect(() => {
    async function loadOrganization() {
      try {
        const res = await fetch("/api/organizations")
        if (!res.ok) {
          throw new Error("Failed to load organization")
        }
        const org: Organization = await res.json()
        setName(org.name)
        setEin(org.ein ?? "")
        setMission(org.mission ?? "")
        setAddress(org.address ?? "")
        setFiscalYearStart(org.fiscal_year_start)
      } catch {
        setError("Failed to load organization settings")
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [])

  async function handleSave() {
    setError(null)
    setSuccess(false)

    if (!name.trim()) {
      setError("Organization name is required")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ein: ein.trim() || null,
          mission: mission.trim() || null,
          address: address.trim() || null,
          fiscal_year_start: fiscalYearStart,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to save")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Settings" />

      <div className="flex-1 p-6">
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="organization" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Manage your organization name, EIN, mission statement, and
                  contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <div className="grid max-w-xl gap-5">
                    {error && (
                      <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Settings saved successfully.
                      </div>
                    )}

                    <div className="grid gap-1.5">
                      <Label htmlFor="org-name">
                        Organization name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="org-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your organization name"
                        required
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="org-ein">EIN</Label>
                      <Input
                        id="org-ein"
                        value={ein}
                        onChange={(e) => setEin(e.target.value)}
                        placeholder="XX-XXXXXXX"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="org-mission">Mission statement</Label>
                      <Textarea
                        id="org-mission"
                        value={mission}
                        onChange={(e) => setMission(e.target.value)}
                        placeholder="Describe your organization's mission"
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="org-address">Address</Label>
                      <Textarea
                        id="org-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address, city, state, zip"
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label>Fiscal year start</Label>
                      <Select
                        value={fiscalYearStart ?? undefined}
                        onValueChange={(val) => setFiscalYearStart(Number(val))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-1.5">
                      <Label>Logo</Label>
                      <div className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
                        Logo upload coming soon
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Invite team members and manage roles and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingSettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
