"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewFunderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [type, setType] = useState<string>("")
  const [ein, setEin] = useState("")
  const [website, setWebsite] = useState("")
  const [programOfficerName, setProgramOfficerName] = useState("")
  const [programOfficerEmail, setProgramOfficerEmail] = useState("")
  const [submissionMethod, setSubmissionMethod] = useState<string>("")
  const [portalUrl, setPortalUrl] = useState("")
  const [emphasisAreas, setEmphasisAreas] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const res = await fetch("/api/funders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: type || null,
          ein: ein.trim() || null,
          website: website.trim() || null,
          program_officer_name: programOfficerName.trim() || null,
          program_officer_email: programOfficerEmail.trim() || null,
          submission_method: submissionMethod || null,
          portal_url: portalUrl.trim() || null,
          emphasis_areas: emphasisAreas
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create funder")
        return
      }

      const funder = await res.json()
      router.push(`/funders/${funder.id}`)
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Add Funder"
        actions={
          <Button variant="outline" render={<Link href="/funders" />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Funder Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., The Ford Foundation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="united_way">United Way</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ein">EIN</Label>
                  <Input
                    id="ein"
                    placeholder="XX-XXXXXXX"
                    value={ein}
                    onChange={(e) => setEin(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program-officer-name">
                    Program Officer Name
                  </Label>
                  <Input
                    id="program-officer-name"
                    placeholder="Jane Smith"
                    value={programOfficerName}
                    onChange={(e) => setProgramOfficerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program-officer-email">
                    Program Officer Email
                  </Label>
                  <Input
                    id="program-officer-email"
                    type="email"
                    placeholder="jane@foundation.org"
                    value={programOfficerEmail}
                    onChange={(e) => setProgramOfficerEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Submission Method</Label>
                  <Select
                    value={submissionMethod}
                    onValueChange={(v) => setSubmissionMethod(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="portal">Portal</SelectItem>
                      <SelectItem value="mail">Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portal-url">Portal URL</Label>
                  <Input
                    id="portal-url"
                    type="url"
                    placeholder="https://..."
                    value={portalUrl}
                    onChange={(e) => setPortalUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emphasis-areas">Emphasis Areas</Label>
                <Input
                  id="emphasis-areas"
                  placeholder="education, youth development, health (comma-separated)"
                  value={emphasisAreas}
                  onChange={(e) => setEmphasisAreas(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple areas with commas
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  variant="outline"
                  type="button"
                  render={<Link href="/funders" />}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !name.trim()}>
                  {saving ? "Creating..." : "Create Funder"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
