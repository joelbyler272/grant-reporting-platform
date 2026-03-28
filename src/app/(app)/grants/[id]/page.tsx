"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Pencil,
  Building2,
  ClipboardList,
} from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReportDueDate {
  id: string
  due_date: string
  period_label: string
  period_start: string
  period_end: string
  status: string
}

interface Grant {
  id: string
  name: string
  funder_id: string
  funder_name: string | null
  program_id: string | null
  program_name: string | null
  grant_id_external: string | null
  amount: number | null
  period_start: string | null
  period_end: string | null
  purpose: string | null
  restrictions: string | null
  status: string
  reporting_schedule: unknown
  report_due_dates: ReportDueDate[]
  created_at: string
  updated_at: string
}

function formatCurrency(amount: number | null) {
  if (amount == null) return "--"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--"
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "completed":
      return "secondary"
    case "pending":
      return "outline"
    default:
      return "outline"
  }
}

function getDueDateBadgeVariant(
  dueDate: string,
  status: string
): "destructive" | "secondary" | "outline" | "default" {
  if (status === "submitted") return "default"
  if (status === "generated") return "secondary"
  if (status === "overdue") return "destructive"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + "T00:00:00")
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return "destructive"
  if (diffDays <= 14) return "secondary"
  return "outline"
}

export default function GrantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [grant, setGrant] = useState<Grant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGrant() {
      try {
        const res = await fetch(`/api/grants/${params.id}`)
        if (res.ok) {
          setGrant(await res.json())
        } else {
          router.push("/grants")
        }
      } catch {
        router.push("/grants")
      } finally {
        setLoading(false)
      }
    }
    fetchGrant()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Grant Details" />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!grant) return null

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={grant.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" render={<Link href="/grants" />}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{grant.name}</h2>
              <Badge variant={getStatusBadgeVariant(grant.status)}>
                {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {grant.funder_name ?? "Unknown Funder"}
              {grant.grant_id_external && ` \u00B7 ${grant.grant_id_external}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(grant.amount)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(grant.period_start)} &ndash;{" "}
              {formatDate(grant.period_end)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Key Info Card */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Grant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Grant Name</p>
                    <p className="font-medium">{grant.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">External ID</p>
                    <p className="font-medium">
                      {grant.grant_id_external || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">{formatCurrency(grant.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadgeVariant(grant.status)}>
                      {grant.status.charAt(0).toUpperCase() +
                        grant.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period Start</p>
                    <p className="font-medium">
                      {formatDate(grant.period_start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period End</p>
                    <p className="font-medium">
                      {formatDate(grant.period_end)}
                    </p>
                  </div>
                </div>

                {grant.purpose && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Purpose</p>
                    <p className="mt-1">{grant.purpose}</p>
                  </div>
                )}

                {grant.restrictions && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Restrictions</p>
                    <p className="mt-1">{grant.restrictions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reporting Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting Timeline</CardTitle>
                <CardDescription>
                  {grant.report_due_dates.length} report
                  {grant.report_due_dates.length !== 1 ? "s" : ""} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {grant.report_due_dates.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No report due dates configured for this grant.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {grant.report_due_dates.map((dd) => (
                      <div
                        key={dd.id}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="size-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {dd.period_label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(dd.period_start)} &ndash;{" "}
                              {formatDate(dd.period_end)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge
                              variant={getDueDateBadgeVariant(
                                dd.due_date,
                                dd.status
                              )}
                            >
                              {dd.status === "submitted"
                                ? "Submitted"
                                : dd.status === "generated"
                                  ? "Generated"
                                  : dd.status === "overdue"
                                    ? "Overdue"
                                    : "Upcoming"}
                            </Badge>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Due {formatDate(dd.due_date)}
                            </p>
                          </div>
                          {(dd.status === "upcoming" ||
                            dd.status === "overdue") && (
                            <Button
                              variant="outline"
                              size="sm"
                              render={
                                <Link
                                  href={`/reports/new?grant_id=${grant.id}&due_date_id=${dd.id}`}
                                />
                              }
                            >
                              <FileText className="size-3.5" />
                              Generate Report
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funder Info */}
            <Card size="sm">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    Funder
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {grant.funder_name ?? "Unknown"}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0"
                  render={<Link href={`/funders/${grant.funder_id}`} />}
                >
                  View Funder
                </Button>
              </CardContent>
            </Card>

            {/* Program Info */}
            {grant.program_id && (
              <Card size="sm">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="size-4 text-muted-foreground" />
                      Program
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    {grant.program_name ?? "Unknown"}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0"
                    render={
                      <Link href={`/programs/${grant.program_id}`} />
                    }
                  >
                    View Program
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card size="sm">
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>
                    {new Date(grant.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>
                    {new Date(grant.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
