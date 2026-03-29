"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText,
  DollarSign,
  ClipboardList,
  CheckCircle,
  Plus,
  ArrowRight,
  AlertTriangle,
  X,
  Clock,
  Upload,
  Database,
  Building2,
  Receipt,
} from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format"

// ── Types ────────────────────────────────────────────────────────────

interface UpcomingReport {
  id: string
  grant_id: string
  due_date: string
  period_label: string | null
  status: string
  days_remaining: number
  grant_name: string | null
  funder_name: string | null
  program_name: string | null
}

interface ActivityItem {
  type: "report_generated" | "data_updated" | "report_submitted"
  description: string
  timestamp: string
}

interface Alert {
  type: "stale_data" | "overdue_report"
  severity: "warning" | "error"
  message: string
}

interface DashboardData {
  reports_due_this_month: number
  active_grants: number
  total_funding: number
  reports_submitted_ytd: number
  upcoming_reports: UpcomingReport[]
  recent_activity: ActivityItem[]
  alerts: Alert[]
}

// ── Helpers ──────────────────────────────────────────────────────────

function daysRemainingColor(days: number): string {
  if (days <= 0) return "text-red-600"
  if (days <= 7) return "text-red-600"
  if (days <= 14) return "text-amber-600"
  return "text-green-600"
}

function statusBadge(status: string, daysRemaining: number) {
  if (status === "overdue" || daysRemaining < 0) {
    return (
      <Badge className="bg-status-overdue-bg text-status-overdue border-none">
        Overdue
      </Badge>
    )
  }
  if (daysRemaining <= 7) {
    return (
      <Badge className="bg-status-due-soon-bg text-status-due-soon border-none">
        Due Soon
      </Badge>
    )
  }
  return (
    <Badge className="bg-status-on-track-bg text-status-on-track border-none">
      On Track
    </Badge>
  )
}

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "report_submitted":
      return <Upload className="size-4 text-green-600" />
    case "report_generated":
      return <FileText className="size-4 text-blue-600" />
    case "data_updated":
      return <Database className="size-4 text-purple-600" />
  }
}

// ── Skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Stat card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="size-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports due skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-28 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Two-column skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="size-4 animate-pulse rounded bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard")
        if (!res.ok) {
          throw new Error("Failed to load dashboard data")
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const stats = data
    ? [
        { label: "Reports Due This Month", value: String(data.reports_due_this_month), icon: FileText },
        { label: "Active Grants", value: String(data.active_grants), icon: ClipboardList },
        { label: "Total Funding", value: formatCurrency(data.total_funding), icon: DollarSign },
        { label: "Reports Submitted YTD", value: String(data.reports_submitted_ytd), icon: CheckCircle },
      ]
    : []

  const visibleAlerts = (data?.alerts ?? []).filter((_, i) => !dismissedAlerts.has(i))

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Dashboard"
        actions={
          <Button render={<Link href="/reports/new" />}>
            <Plus className="size-4" />
            Generate Report
          </Button>
        }
      />

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <AlertTriangle className="size-10 text-amber-500" />
              <p className="mt-3 text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  fetch("/api/dashboard")
                    .then((r) => r.json())
                    .then(setData)
                    .catch(() => setError("Failed to load dashboard data"))
                    .finally(() => setLoading(false))
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 space-y-6 p-6">
          {/* Alert Banner */}
          {visibleAlerts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-3">
                {visibleAlerts.map((alert, i) => {
                  const originalIndex = (data?.alerts ?? []).indexOf(alert)
                  return (
                    <div
                      key={originalIndex}
                      className="flex items-center justify-between gap-3 py-1"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`size-4 shrink-0 ${
                            alert.severity === "error" ? "text-red-600" : "text-amber-600"
                          }`}
                        />
                        <p className="text-sm text-amber-900">{alert.message}</p>
                      </div>
                      <button
                        onClick={() =>
                          setDismissedAlerts((prev) => new Set([...prev, originalIndex]))
                        }
                        className="shrink-0 rounded p-1 text-amber-600 hover:bg-amber-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Reports Due Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Reports Due</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data && data.upcoming_reports.length > 0 ? (
                data.upcoming_reports.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {item.grant_name ?? "Untitled Grant"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.funder_name ?? "Unknown Funder"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-medium ${daysRemainingColor(item.days_remaining)}`}
                      >
                        {item.days_remaining < 0
                          ? `${Math.abs(item.days_remaining)} days overdue`
                          : item.days_remaining === 0
                            ? "Due today"
                            : `${item.days_remaining} days remaining`}
                      </span>
                      {statusBadge(item.status, item.days_remaining)}
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/reports/new?grant_id=${item.grant_id}`} />
                        }
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No upcoming reports due. You're all caught up!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Two-column: Recent Activity + Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {data && data.recent_activity.length > 0 ? (
                  <div className="space-y-4">
                    {data.recent_activity.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5">{activityIcon(item.type)}</div>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No recent activity yet. Start by generating your first report.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    label: "Generate Report",
                    href: "/reports/new",
                    icon: FileText,
                  },
                  {
                    label: "Update Program Data",
                    href: "/programs",
                    icon: Database,
                  },
                  {
                    label: "Add Funder",
                    href: "/funders/new",
                    icon: Building2,
                  },
                  {
                    label: "Add Grant",
                    href: "/grants/new",
                    icon: Receipt,
                  },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.href}
                      variant="ghost"
                      className="w-full justify-between"
                      render={<Link href={action.href} />}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" />
                        {action.label}
                      </span>
                      <ArrowRight className="size-4" />
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
