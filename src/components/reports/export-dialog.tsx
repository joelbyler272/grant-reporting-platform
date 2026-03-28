"use client"

import { useState } from "react"
import { FileText, FileDown, Copy, Loader2, Check } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ExportDialogProps {
  reportId: string
  reportContent: Record<string, { content: string | null }> | null
  children: React.ReactNode
}

type ExportFormat = "docx" | "pdf" | "text"

export function ExportDialog({
  reportId,
  reportContent,
  children,
}: ExportDialogProps) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleExport(format: ExportFormat) {
    if (format === "text") {
      // Copy all section content to clipboard
      const allContent = Object.entries(reportContent ?? {})
        .map(([key, section]) => `## ${key}\n\n${section.content ?? ""}`)
        .join("\n\n---\n\n")

      await navigator.clipboard.writeText(allContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    setDownloading(format)
    try {
      const res = await fetch(
        `/api/reports/${reportId}/export?format=${format}`
      )
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `report.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose a format to export your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Word */}
          <button
            type="button"
            className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
            onClick={() => handleExport("docx")}
            disabled={downloading !== null}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              {downloading === "docx" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <FileText className="size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Download as Word (.docx)</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Formatted Word document ready for editing or submission.
              </p>
            </div>
          </button>

          {/* PDF */}
          <button
            type="button"
            className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
            onClick={() => handleExport("pdf")}
            disabled={downloading !== null}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {downloading === "pdf" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <FileDown className="size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Download as PDF</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Fixed-layout PDF suitable for printing and archiving.
              </p>
            </div>
          </button>

          {/* Plain text */}
          <button
            type="button"
            className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
            onClick={() => handleExport("text")}
            disabled={downloading !== null}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {copied ? (
                <Check className="size-5" />
              ) : (
                <Copy className="size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {copied ? "Copied!" : "Copy as Plain Text"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Copy all section content to your clipboard.
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
