import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx"
import type {
  TemplateSection,
  ReportContentSection,
} from "@/types"

// ── Auth helper (mirrors other API routes) ─────────────────────────

async function getAuthenticatedOrg() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized", status: 401, supabase: null, orgId: null }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return { error: "User profile not found", status: 404, supabase: null, orgId: null }
  }

  return { error: null, status: null, supabase, orgId: profile.org_id }
}

// ── Fetch full report with relations ────────────────────────────────

interface ReportRow {
  id: string
  title: string
  status: string
  content: Record<string, ReportContentSection> | null
  created_at: string
  updated_at: string
  grants: {
    id: string
    name: string
    funder_id: string
    period_start: string | null
    period_end: string | null
    funders: { id: string; name: string } | null
    organizations: { id: string; name: string } | null
  } | null
}

async function fetchReportData(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  reportId: string,
  orgId: string,
) {
  // Fetch report with grant -> funder and organization
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(`
      id, title, status, content, created_at, updated_at,
      grants:grant_id (
        id, name, funder_id, period_start, period_end,
        funders:funder_id ( id, name ),
        organizations:org_id ( id, name )
      )
    `)
    .eq("id", reportId)
    .eq("org_id", orgId)
    .single()

  if (reportError || !report) return null

  const typedReport = report as unknown as ReportRow
  const funderId = typedReport.grants?.funder_id

  // Fetch funder template (org-specific first, then community)
  let template: { sections: TemplateSection[] | null } | null = null

  if (funderId) {
    const { data: orgTemplate } = await supabase
      .from("funder_templates")
      .select("sections")
      .eq("funder_id", funderId)
      .eq("org_id", orgId)
      .single()

    if (orgTemplate) {
      template = orgTemplate
    } else {
      const { data: communityTemplate } = await supabase
        .from("funder_templates")
        .select("sections")
        .eq("funder_id", funderId)
        .is("org_id", null)
        .single()

      template = communityTemplate
    }
  }

  return { report: typedReport, template }
}

// ── Ordered sections helper ─────────────────────────────────────────

function getOrderedSections(
  sections: TemplateSection[] | null | undefined,
  content: Record<string, ReportContentSection> | null,
) {
  if (!sections || sections.length === 0) {
    // If no template, return content keyed sections in alphabetical order
    if (!content) return []
    return Object.entries(content).map(([key, value]) => ({
      id: key,
      name: key,
      content: value.content ?? "",
      wordCount: value.word_count ?? 0,
      wordLimit: value.word_limit ?? null,
    }))
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order)
  return sorted.map((section) => {
    const sectionContent = content?.[section.id]
    return {
      id: section.id,
      name: section.name,
      content: sectionContent?.content ?? "",
      wordCount: sectionContent?.word_count ?? 0,
      wordLimit: sectionContent?.word_limit ?? section.word_limit ?? null,
    }
  })
}

// ── DOCX generation ─────────────────────────────────────────────────

function buildDocx(
  title: string,
  orgName: string,
  funderName: string,
  grantName: string,
  date: string,
  sections: ReturnType<typeof getOrderedSections>,
) {
  const children: Paragraph[] = []

  // Title page content
  children.push(
    new Paragraph({ spacing: { after: 600 } }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: grantName, size: 28, color: "666666" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: orgName, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Submitted to: ${funderName}`, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: date, size: 22, color: "888888" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    // Separator
    new Paragraph({
      children: [new TextRun({ text: "─".repeat(60), color: "CCCCCC" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  )

  // Sections
  for (const section of sections) {
    children.push(
      new Paragraph({
        text: section.name,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
    )

    // Split content by paragraphs
    const paragraphs = (section.content || "").split(/\n\n+/)
    for (const para of paragraphs) {
      const trimmed = para.trim()
      if (!trimmed) continue
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 24 })],
          spacing: { after: 120 },
        }),
      )
    }

    // Word count footer
    if (section.wordLimit) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Word count: ${section.wordCount} / ${section.wordLimit}`,
              size: 18,
              color: "999999",
              italics: true,
            }),
          ],
          spacing: { before: 80, after: 200 },
        }),
      )
    }
  }

  return new Document({
    sections: [{ children }],
  })
}

// ── Plain text generation ───────────────────────────────────────────

function buildPlainText(
  title: string,
  orgName: string,
  funderName: string,
  grantName: string,
  date: string,
  sections: ReturnType<typeof getOrderedSections>,
) {
  const lines: string[] = []

  lines.push(title.toUpperCase())
  lines.push(grantName)
  lines.push(`Organization: ${orgName}`)
  lines.push(`Funder: ${funderName}`)
  lines.push(`Date: ${date}`)
  lines.push("")
  lines.push("=".repeat(60))
  lines.push("")

  for (const section of sections) {
    lines.push(section.name.toUpperCase())
    lines.push("-".repeat(section.name.length))
    lines.push("")
    lines.push(section.content || "(No content)")
    lines.push("")

    if (section.wordLimit) {
      lines.push(`[Word count: ${section.wordCount} / ${section.wordLimit}]`)
      lines.push("")
    }
  }

  return lines.join("\n")
}

// ── HTML/PDF generation ─────────────────────────────────────────────

function buildPrintableHtml(
  title: string,
  orgName: string,
  funderName: string,
  grantName: string,
  date: string,
  sections: ReturnType<typeof getOrderedSections>,
) {
  const sectionHtml = sections
    .map((s) => {
      const contentHtml = (s.content || "<em>No content</em>")
        .split(/\n\n+/)
        .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
        .join("")

      const wordCountHtml = s.wordLimit
        ? `<p class="word-count">Word count: ${s.wordCount} / ${s.wordLimit}</p>`
        : ""

      return `
        <section>
          <h2>${escapeHtml(s.name)}</h2>
          ${contentHtml}
          ${wordCountHtml}
        </section>`
    })
    .join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @media print {
      body { margin: 0; }
      .print-notice { display: none; }
    }
    body {
      font-family: Georgia, "Times New Roman", serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .print-notice {
      background: #f0f4ff;
      border: 1px solid #c7d2fe;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 32px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      color: #4338ca;
    }
    .title-block {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 32px;
      border-bottom: 2px solid #e5e7eb;
    }
    .title-block h1 {
      font-size: 28px;
      margin: 0 0 8px;
    }
    .title-block .grant-name {
      font-size: 18px;
      color: #6b7280;
      margin: 0 0 16px;
    }
    .title-block .meta {
      font-size: 14px;
      color: #9ca3af;
      font-family: system-ui, sans-serif;
    }
    section {
      margin-bottom: 32px;
    }
    section h2 {
      font-size: 20px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    section p {
      margin: 0 0 12px;
    }
    .word-count {
      font-size: 12px;
      color: #9ca3af;
      font-style: italic;
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div class="print-notice">
    To save as PDF, use your browser's print function (Ctrl+P / Cmd+P) and select "Save as PDF".
  </div>

  <div class="title-block">
    <h1>${escapeHtml(title)}</h1>
    <p class="grant-name">${escapeHtml(grantName)}</p>
    <p class="meta">${escapeHtml(orgName)} &mdash; Submitted to ${escapeHtml(funderName)}</p>
    <p class="meta">${escapeHtml(date)}</p>
  </div>

  ${sectionHtml}
</body>
</html>`
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// ── GET handler ─────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const format = request.nextUrl.searchParams.get("format") ?? "docx"

  if (!["docx", "pdf", "text"].includes(format)) {
    return Response.json(
      { error: "Invalid format. Supported: docx, pdf, text" },
      { status: 400 },
    )
  }

  const { error, status, supabase, orgId } = await getAuthenticatedOrg()
  if (error || !supabase || !orgId) {
    return Response.json({ error }, { status: status ?? 500 })
  }

  const result = await fetchReportData(supabase, id, orgId)
  if (!result) {
    return Response.json({ error: "Report not found" }, { status: 404 })
  }

  const { report, template } = result
  const orderedSections = getOrderedSections(
    template?.sections,
    report.content,
  )

  const title = report.title
  const orgName = report.grants?.organizations?.name ?? "Organization"
  const funderName = report.grants?.funders?.name ?? "Funder"
  const grantName = report.grants?.name ?? "Grant"
  const date = new Date(report.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const safeFilename = title.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_")

  // ── DOCX ──────────────────────────────────────────────────────────
  if (format === "docx") {
    const doc = buildDocx(title, orgName, funderName, grantName, date, orderedSections)
    const buffer = await Packer.toBuffer(doc)
    const uint8 = new Uint8Array(buffer)

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeFilename}.docx"`,
      },
    })
  }

  // ── Plain text ────────────────────────────────────────────────────
  if (format === "text") {
    const text = buildPlainText(title, orgName, funderName, grantName, date, orderedSections)

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}.txt"`,
      },
    })
  }

  // ── PDF (printable HTML) ──────────────────────────────────────────
  const html = buildPrintableHtml(title, orgName, funderName, grantName, date, orderedSections)

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
