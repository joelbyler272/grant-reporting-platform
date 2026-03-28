"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Plus, Eye } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Report, ReportStatus } from "@/types"

interface ReportRow {
  id: string
  title: string
  status: ReportStatus
  created_at: string
  submitted_at: string | null
  grant?: {
    id: string
    name: string
    funder?: {
      id: string
      name: string
    }
  }
  due_date?: {
    due_date: string
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
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

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports")
        if (res.ok) {
          const data = await res.json()
          setReports(data)
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar
          title="Reports"
          actions={
            <Button render={<Link href="/reports/new" />}>
              <Plus className="size-4" />
              Generate Report
            </Button>
          }
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar
          title="Reports"
          actions={
            <Button render={<Link href="/reports/new" />}>
              <Plus className="size-4" />
              Generate Report
            </Button>
          }
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <FileText className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No reports yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Reports are generated from your program data and funder
                templates. Set up your programs, funders, and grants first, then
                generate your first report.
              </p>
              <Button className="mt-6" render={<Link href="/reports/new" />}>
                <Plus className="size-4" />
                Generate Your First Report
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
        title="Reports"
        actions={
          <Button render={<Link href="/reports/new" />}>
            <Plus className="size-4" />
            Generate Report
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Funder</th>
                    <th className="px-4 py-3 font-medium">Grant</th>
                    <th className="px-4 py-3 font-medium">Due Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Generated</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b last:border-b-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/reports/${report.id}`}
                          className="hover:underline"
                        >
                          {report.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {report.grant?.funder?.name ?? "--"}
                      </td>
                      <td className="px-4 py-3">
                        {report.grant?.name ?? "--"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(report.due_date?.due_date ?? null)}
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(report.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/reports/${report.id}`} />}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
