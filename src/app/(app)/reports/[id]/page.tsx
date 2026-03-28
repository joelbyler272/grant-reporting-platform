"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Share2,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionEditor } from "@/components/reports/section-editor"
import { ExportDialog } from "@/components/reports/export-dialog"
import { SubmissionDialog } from "@/components/reports/submission-dialog"
import { ShareDialog } from "@/components/reports/share-dialog"
import type {
  Report,
  ReportContentSection,
  TemplateSection,
  Comment,
  ReportStatus,
} from "@/types"

interface ReportDetail extends Omit<Report, 'grant'> {
  grant?: {
    id: string
    name: string
    funder_id: string
    funder?: {
      id: string
      name: string
      templates?: Array<{
        id: string
        sections: TemplateSection[] | null
      }>
    }
  }
}

function statusBadge(status: ReportStatus) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>
    case "in_review":
      return (
        <Badge className="bg-status-due-soon-bg text-status-due-soon">
          In Review
        </Badge>
      )
    case "approved":
      return (
        <Badge className="bg-status-on-track-bg text-status-on-track">
          Approved
        </Badge>
      )
    case "submitted":
      return (
        <Badge className="bg-status-submitted-bg text-status-submitted">
          Submitted
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>(
    []
  )
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Local editable content
  const [editableContent, setEditableContent] = useState<
    Record<string, ReportContentSection>
  >({})

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`)
        if (res.ok) {
          const data: ReportDetail = await res.json()
          setReport(data)
          setEditableContent(data.content ?? {})

          // Try to get template sections from the funder
          if (data.grant?.funder_id) {
            try {
              const tRes = await fetch(
                `/api/funders/${data.grant.funder_id}/templates`
              )
              if (tRes.ok) {
                const templates = await tRes.json()
                if (templates.length > 0 && templates[0].sections) {
                  setTemplateSections(
                    [...templates[0].sections].sort(
                      (a: TemplateSection, b: TemplateSection) =>
                        a.order - b.order
                    )
                  )
                }
              }
            } catch {}
          }

          // Fetch comments
          try {
            const cRes = await fetch(`/api/reports/${id}/comments`)
            if (cRes.ok) {
              setComments(await cRes.json())
            }
          } catch {}
        }
      } catch (err) {
        console.error("Failed to fetch report:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id])

  function handleContentChange(sectionId: string, content: string) {
    setEditableContent((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        content,
        word_count: content.trim().split(/\s+/).filter(Boolean).length,
      },
    }))
  }

  async function handleAddComment(sectionKey: string, body: string) {
    try {
      const res = await fetch(`/api/reports/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_key: sectionKey, body }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
      }
    } catch (err) {
      console.error("Failed to add comment:", err)
    }
  }

  async function handleSaveContent() {
    setSaving(true)
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editableContent }),
      })
    } catch (err) {
      console.error("Failed to save:", err)
    } finally {
      setSaving(false)
    }
  }

  async function handleApprove() {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (res.ok) {
        setReport((prev) => (prev ? { ...prev, status: "approved" } : prev))
      }
    } catch (err) {
      console.error("Failed to approve:", err)
    }
  }

  async function handleShareForReview() {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_review" }),
      })
      if (res.ok) {
        setReport((prev) => (prev ? { ...prev, status: "in_review" } : prev))
      }
    } catch {}
  }

  function handleSubmitted() {
    setReport((prev) =>
      prev ? { ...prev, status: "submitted" } : prev
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading report...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Report not found.</p>
      </div>
    )
  }

  // Build section keys from either template or content keys
  const sectionKeys =
    templateSections.length > 0
      ? templateSections.map((s) => s.id)
      : Object.keys(editableContent)

  // Build a lookup for template sections by id
  const templateMap = new Map(templateSections.map((s) => [s.id, s]))

  return (
    <div className="flex h-full flex-col">
      {/* Top actions bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/reports" />}
          >
            <ArrowLeft className="size-4" />
            Reports
          </Button>
          <span className="text-sm font-medium text-foreground">
            {report.title}
          </span>
          {statusBadge(report.status)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveContent}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>

          <ShareDialog reportId={id}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareForReview}
            >
              <Share2 className="size-4" />
              Share for Review
            </Button>
          </ShareDialog>

          {report.status !== "approved" && report.status !== "submitted" && (
            <Button variant="outline" size="sm" onClick={handleApprove}>
              <CheckCircle2 className="size-4" />
              Approve Report
            </Button>
          )}

          <ExportDialog
            reportId={id}
            reportContent={editableContent}
          >
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
          </ExportDialog>

          {report.status === "approved" && (
            <SubmissionDialog reportId={id} onSubmitted={handleSubmitted}>
              <Button size="sm">
                <Send className="size-4" />
                Mark as Submitted
              </Button>
            </SubmissionDialog>
          )}
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Funder requirements (40%) */}
        <div className="w-2/5 overflow-y-auto border-r border-border bg-muted/30 p-4">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Funder Requirements
          </h2>

          {templateSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No funder template sections available. The template may not be
              configured for this funder.
            </p>
          ) : (
            <div className="space-y-4">
              {templateSections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-lg border bg-white p-4 dark:bg-card"
                >
                  <h3 className="text-sm font-semibold">{section.name}</h3>
                  {section.instructions && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {section.instructions}
                    </p>
                  )}
                  {section.word_limit && (
                    <p className="mt-2 text-xs font-mono text-muted-foreground">
                      Word limit: {section.word_limit}
                    </p>
                  )}
                  {section.required_fields.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {section.required_fields.map((field) => (
                        <span
                          key={field}
                          className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: Generated content (60%) */}
        <div className="w-3/5 overflow-y-auto p-4">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Report Content
          </h2>

          {sectionKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No content sections available.
            </p>
          ) : (
            <div className="space-y-6">
              {sectionKeys.map((sectionId) => {
                const contentSection = editableContent[sectionId]
                const template = templateMap.get(sectionId)
                const sectionComments = comments.filter(
                  (c) => c.section_key === sectionId
                )

                return (
                  <SectionEditor
                    key={sectionId}
                    sectionId={sectionId}
                    sectionName={template?.name ?? sectionId}
                    content={contentSection?.content ?? ""}
                    wordLimit={
                      contentSection?.word_limit ??
                      template?.word_limit ??
                      null
                    }
                    isComplete={contentSection?.is_complete ?? true}
                    missingData={contentSection?.missing_data}
                    comments={sectionComments}
                    onContentChange={handleContentChange}
                    onAddComment={handleAddComment}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
