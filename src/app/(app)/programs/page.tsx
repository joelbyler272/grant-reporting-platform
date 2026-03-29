"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, Plus, Loader2 } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { UpgradePrompt } from "@/components/shared/upgrade-prompt"

interface Program {
  id: string
  name: string
  description: string | null
  population_served: string | null
  geography: string | null
  active_grants_count: number
  completeness_score: number | null
  updated_at: string
  created_at: string
}

interface LimitInfo {
  current: number
  limit: number
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState<LimitInfo | null>(null)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch("/api/programs")
        if (!res.ok) {
          throw new Error("Failed to fetch programs")
        }
        const data = await res.json()
        setPrograms(data)

        // Check if adding a new program would hit the limit
        const subRes = await fetch("/api/billing/subscription")
        if (subRes.ok) {
          const sub = await subRes.json()
          const usage = sub.usage?.programs
          if (usage?.limit !== null && usage?.current >= usage?.limit) {
            setLimitReached({ current: usage.current, limit: usage.limit })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Programs"
        actions={
          <Button render={<Link href="/programs/new" />}>
            <Plus className="size-4" />
            Add Program
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {limitReached && (
          <div className="mb-6">
            <UpgradePrompt
              resource="programs"
              current={limitReached.current}
              limit={limitReached.limit}
            />
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <ClipboardList className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No programs yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Programs represent the services your organization provides.
                Add your first program to start tracking outcomes and generating
                reports.
              </p>
              <Button className="mt-6" render={<Link href="/programs/new" />}>
                <Plus className="size-4" />
                Add Your First Program
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        Population Served
                      </th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        Active Grants
                      </th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        Data Completeness
                      </th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => (
                      <tr
                        key={program.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/programs/${program.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {program.name}
                          </Link>
                          {program.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                              {program.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {program.population_served || "\u2014"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">
                            {program.active_grants_count}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {program.completeness_score !== null ? (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={program.completeness_score}
                                className="w-24"
                              >
                                <ProgressValue />
                              </Progress>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{"\u2014"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(
                            program.updated_at || program.created_at
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
