"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { DollarSign, Plus, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Grant {
  id: string
  name: string
  funder_name: string | null
  program_name: string | null
  amount: number | null
  period_start: string | null
  period_end: string | null
  status: string
  next_due_date: string | null
  next_due_status: string | null
  funder_id: string
  program_id: string | null
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

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) return "--"
  return `${formatDate(start)} - ${formatDate(end)}`
}

function getDueDateBadgeVariant(dueDate: string | null, dueStatus: string | null): {
  variant: "destructive" | "secondary" | "outline"
  label: string
} {
  if (!dueDate) return { variant: "outline", label: "No reports" }
  if (dueStatus === "overdue") return { variant: "destructive", label: formatDate(dueDate) }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + "T00:00:00")
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { variant: "destructive", label: formatDate(dueDate) }
  if (diffDays <= 14) return { variant: "secondary", label: formatDate(dueDate) }
  return { variant: "outline", label: formatDate(dueDate) }
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

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [funderFilter, setFunderFilter] = useState("all")
  const [programFilter, setProgramFilter] = useState("all")

  useEffect(() => {
    async function fetchGrants() {
      try {
        const res = await fetch("/api/grants")
        if (res.ok) {
          const data = await res.json()
          setGrants(data)
        }
      } catch (err) {
        console.error("Failed to fetch grants:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrants()
  }, [])

  const funders = useMemo(() => {
    const unique = new Map<string, string>()
    for (const g of grants) {
      if (g.funder_id && g.funder_name) {
        unique.set(g.funder_id, g.funder_name)
      }
    }
    return Array.from(unique, ([id, name]) => ({ id, name }))
  }, [grants])

  const programs = useMemo(() => {
    const unique = new Map<string, string>()
    for (const g of grants) {
      if (g.program_id && g.program_name) {
        unique.set(g.program_id, g.program_name)
      }
    }
    return Array.from(unique, ([id, name]) => ({ id, name }))
  }, [grants])

  const filtered = useMemo(() => {
    return grants.filter((g) => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false
      if (funderFilter !== "all" && g.funder_id !== funderFilter) return false
      if (programFilter !== "all" && g.program_id !== programFilter) return false
      return true
    })
  }, [grants, statusFilter, funderFilter, programFilter])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this grant?")) return
    const res = await fetch(`/api/grants/${id}`, { method: "DELETE" })
    if (res.ok) {
      setGrants((prev) => prev.filter((g) => g.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar
          title="Grants"
          actions={
            <Button render={<Link href="/grants/new" />}>
              <Plus className="size-4" />
              Add Grant
            </Button>
          }
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading grants...</p>
        </div>
      </div>
    )
  }

  if (grants.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar
          title="Grants"
          actions={
            <Button render={<Link href="/grants/new" />}>
              <Plus className="size-4" />
              Add Grant
            </Button>
          }
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <DollarSign className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No grants yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Grants connect your funders to your programs. Add a grant to
                start tracking funding and generating reports.
              </p>
              <Button className="mt-6" render={<Link href="/grants/new" />}>
                <Plus className="size-4" />
                Add Your First Grant
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
        title="Grants"
        actions={
          <Button render={<Link href="/grants/new" />}>
            <Plus className="size-4" />
            Add Grant
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={funderFilter} onValueChange={(v) => setFunderFilter(v ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Funders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Funders</SelectItem>
              {funders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={programFilter} onValueChange={(v) => setProgramFilter(v ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Grant Name</th>
                    <th className="px-4 py-3 font-medium">Funder</th>
                    <th className="px-4 py-3 font-medium">Program</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Next Report Due</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((grant) => {
                    const dueBadge = getDueDateBadgeVariant(
                      grant.next_due_date,
                      grant.next_due_status
                    )
                    return (
                      <tr
                        key={grant.id}
                        className="border-b last:border-b-0 hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/grants/${grant.id}`}
                            className="hover:underline"
                          >
                            {grant.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{grant.funder_name ?? "--"}</td>
                        <td className="px-4 py-3">{grant.program_name ?? "--"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(grant.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatPeriod(grant.period_start, grant.period_end)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={dueBadge.variant}>{dueBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusBadgeVariant(grant.status)}>
                            {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              render={<Link href={`/grants/${grant.id}`} />}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(grant.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No grants match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
