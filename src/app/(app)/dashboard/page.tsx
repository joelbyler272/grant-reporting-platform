import Link from "next/link"
import {
  FileText,
  DollarSign,
  ClipboardList,
  CheckCircle,
  Plus,
  ArrowRight,
} from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const stats = [
  { label: "Reports Due This Month", value: "3", icon: FileText },
  { label: "Active Grants", value: "8", icon: ClipboardList },
  { label: "Total Funding", value: "$425,000", icon: DollarSign },
  { label: "Reports Submitted YTD", value: "12", icon: CheckCircle },
]

const reportsDue = [
  {
    funder: "Community Foundation",
    grant: "Youth Development Grant",
    daysRemaining: -3,
    status: "overdue" as const,
  },
  {
    funder: "United Way",
    grant: "Family Services Program",
    daysRemaining: 5,
    status: "due-soon" as const,
  },
  {
    funder: "State Department of Education",
    grant: "Literacy Initiative",
    daysRemaining: 18,
    status: "on-track" as const,
  },
]

function statusBadge(status: "overdue" | "due-soon" | "on-track") {
  switch (status) {
    case "overdue":
      return (
        <Badge className="bg-status-overdue-bg text-status-overdue border-none">
          Overdue
        </Badge>
      )
    case "due-soon":
      return (
        <Badge className="bg-status-due-soon-bg text-status-due-soon border-none">
          Due Soon
        </Badge>
      )
    case "on-track":
      return (
        <Badge className="bg-status-on-track-bg text-status-on-track border-none">
          On Track
        </Badge>
      )
  }
}

export default function DashboardPage() {
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

      <div className="flex-1 space-y-6 p-6">
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
            {reportsDue.map((item) => (
              <div
                key={item.grant}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{item.grant}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.funder}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {item.daysRemaining < 0
                      ? `${Math.abs(item.daysRemaining)} days overdue`
                      : `${item.daysRemaining} days remaining`}
                  </span>
                  {statusBadge(item.status)}
                  <Button variant="outline" size="sm">
                    Generate
                  </Button>
                </div>
              </div>
            ))}
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No recent activity yet. Start by generating your first report.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "View Reports", href: "/reports" },
                { label: "Manage Programs", href: "/programs" },
                { label: "Manage Funders", href: "/funders" },
                { label: "Manage Grants", href: "/grants" },
              ].map((action) => (
                <Button
                  key={action.href}
                  variant="ghost"
                  className="w-full justify-between"
                  render={<Link href={action.href} />}
                >
                    {action.label}
                    <ArrowRight className="size-4" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
