"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Mail, Globe, Send } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TemplateBuilder } from "@/components/funders/template-builder"

interface FunderDetail {
  id: string
  name: string
  type: string | null
  ein: string | null
  website: string | null
  program_officer_name: string | null
  program_officer_email: string | null
  submission_method: string | null
  portal_url: string | null
  emphasis_areas: string[]
  is_community: boolean
  template_sections: TemplateSection[]
  grants: Grant[]
  notes: FunderNote[]
}

interface TemplateSection {
  id: string
  name: string
  instructions: string
  word_limit: number | null
  required_fields: string[]
  emphasis_tags: string[]
  order: number
}

interface Grant {
  id: string
  name: string
  status: string | null
  amount: number | null
  start_date: string | null
  end_date: string | null
}

interface FunderNote {
  id: string
  content: string
  created_at: string
  created_by: string | null
}

export default function FunderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [funder, setFunder] = useState<FunderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    ein: "",
    website: "",
    program_officer_name: "",
    program_officer_email: "",
    submission_method: "",
    portal_url: "",
    emphasis_areas: "",
  })

  useEffect(() => {
    async function fetchFunder() {
      try {
        const res = await fetch(`/api/funders/${id}`)
        if (res.ok) {
          const data = await res.json()
          setFunder(data)
          setEditForm({
            name: data.name || "",
            type: data.type || "",
            ein: data.ein || "",
            website: data.website || "",
            program_officer_name: data.program_officer_name || "",
            program_officer_email: data.program_officer_email || "",
            submission_method: data.submission_method || "",
            portal_url: data.portal_url || "",
            emphasis_areas: (data.emphasis_areas || []).join(", "),
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchFunder()
  }, [id])

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const res = await fetch(`/api/funders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          type: editForm.type || null,
          ein: editForm.ein.trim() || null,
          website: editForm.website.trim() || null,
          program_officer_name: editForm.program_officer_name.trim() || null,
          program_officer_email: editForm.program_officer_email.trim() || null,
          submission_method: editForm.submission_method || null,
          portal_url: editForm.portal_url.trim() || null,
          emphasis_areas: editForm.emphasis_areas
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setFunder((prev) => (prev ? { ...prev, ...updated } : prev))
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      // For notes, we'll POST to a simple endpoint inline
      // Since there's no dedicated notes API, we'll use supabase client-side
      const res = await fetch(`/api/funders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: funder?.name,
          _add_note: noteText.trim(),
        }),
      })
      if (res.ok) {
        // Re-fetch funder to get updated notes
        const fetchRes = await fetch(`/api/funders/${id}`)
        if (fetchRes.ok) {
          const data = await fetchRes.json()
          setFunder(data)
        }
        setNoteText("")
      }
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Loading..." />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Loading funder details...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!funder) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Not Found" />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Funder not found.
              </p>
              <Button className="mt-4" render={<Link href="/funders" />}>
                Back to Funders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={funder.name}
        actions={
          <Button variant="outline" render={<Link href="/funders" />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Tabs defaultValue="profile">
          <TabsList variant="line">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="mt-4">
              <CardContent className="pt-6">
                {editing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Funder Name</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={editForm.type}
                          onValueChange={(v) =>
                            setEditForm((f) => ({ ...f, type: v ?? "" }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="foundation">
                              Foundation
                            </SelectItem>
                            <SelectItem value="government">
                              Government
                            </SelectItem>
                            <SelectItem value="corporate">
                              Corporate
                            </SelectItem>
                            <SelectItem value="united_way">
                              United Way
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-ein">EIN</Label>
                        <Input
                          id="edit-ein"
                          value={editForm.ein}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, ein: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-website">Website</Label>
                      <Input
                        id="edit-website"
                        type="url"
                        value={editForm.website}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            website: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-po-name">
                          Program Officer Name
                        </Label>
                        <Input
                          id="edit-po-name"
                          value={editForm.program_officer_name}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              program_officer_name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-po-email">
                          Program Officer Email
                        </Label>
                        <Input
                          id="edit-po-email"
                          type="email"
                          value={editForm.program_officer_email}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              program_officer_email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Submission Method</Label>
                        <Select
                          value={editForm.submission_method}
                          onValueChange={(v) =>
                            setEditForm((f) => ({
                              ...f,
                              submission_method: v ?? "",
                            }))
                          }
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
                        <Label htmlFor="edit-portal-url">Portal URL</Label>
                        <Input
                          id="edit-portal-url"
                          type="url"
                          value={editForm.portal_url}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              portal_url: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-emphasis">Emphasis Areas</Label>
                      <Input
                        id="edit-emphasis"
                        value={editForm.emphasis_areas}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            emphasis_areas: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple areas with commas
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{funder.name}</h2>
                        <div className="mt-1 flex items-center gap-2">
                          {funder.type && (
                            <Badge variant="secondary">
                              {funder.type.replace("_", " ")}
                            </Badge>
                          )}
                          {funder.is_community && (
                            <Badge variant="outline">Community</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => setEditing(true)}>
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {funder.ein && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            EIN
                          </p>
                          <p className="mt-1 text-sm">{funder.ein}</p>
                        </div>
                      )}
                      {funder.website && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Website
                          </p>
                          <a
                            href={funder.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="size-3" />
                            {funder.website}
                          </a>
                        </div>
                      )}
                      {funder.program_officer_name && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Program Officer
                          </p>
                          <p className="mt-1 text-sm">
                            {funder.program_officer_name}
                          </p>
                        </div>
                      )}
                      {funder.program_officer_email && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Officer Email
                          </p>
                          <a
                            href={`mailto:${funder.program_officer_email}`}
                            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Mail className="size-3" />
                            {funder.program_officer_email}
                          </a>
                        </div>
                      )}
                      {funder.submission_method && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Submission Method
                          </p>
                          <p className="mt-1 text-sm capitalize">
                            {funder.submission_method}
                          </p>
                        </div>
                      )}
                      {funder.portal_url && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Portal URL
                          </p>
                          <a
                            href={funder.portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="size-3" />
                            {funder.portal_url}
                          </a>
                        </div>
                      )}
                    </div>

                    {funder.emphasis_areas &&
                      funder.emphasis_areas.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Emphasis Areas
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {funder.emphasis_areas.map((area) => (
                              <Badge key={area} variant="outline">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template">
            <Card className="mt-4">
              <CardContent className="pt-6">
                <TemplateBuilder
                  funderId={funder.id}
                  initialSections={funder.template_sections.sort(
                    (a, b) => a.order - b.order
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grants Tab */}
          <TabsContent value="grants">
            <Card className="mt-4">
              <CardContent className="pt-6">
                {funder.grants.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No grants associated with this funder yet.
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      render={<Link href="/grants/new" />}
                    >
                      Add Grant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {funder.grants.map((grant) => (
                      <div
                        key={grant.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <Link
                            href={`/grants/${grant.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {grant.name}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            {grant.status && (
                              <Badge variant="secondary">{grant.status}</Badge>
                            )}
                            {grant.amount && (
                              <span className="text-xs text-muted-foreground">
                                ${grant.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {grant.end_date && (
                          <span className="text-xs text-muted-foreground">
                            Ends{" "}
                            {new Date(grant.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center py-16 text-center">
                <Send className="size-8 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Report submission history will appear here once reports have
                  been submitted to this funder.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="mt-4">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="new-note">Add a Note</Label>
                  <Textarea
                    id="new-note"
                    placeholder="Write a note about this funder..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={addingNote || !noteText.trim()}
                    >
                      {addingNote ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                </div>

                {funder.notes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No notes yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {funder.notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
