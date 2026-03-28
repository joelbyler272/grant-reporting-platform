"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  BookOpen,
  FileSearch,
  PenTool,
  Check,
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
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

interface GrantOption {
  id: string
  name: string
  funder_name: string | null
  program_name: string | null
  program_id: string | null
  period_start: string | null
  period_end: string | null
  next_due_date: string | null
}

const GENERATION_STEPS = [
  { label: "Reading your program data...", icon: BookOpen, duration: 2000 },
  { label: "Matching funder template...", icon: FileSearch, duration: 2000 },
  { label: "Writing your report...", icon: PenTool, duration: 3000 },
]

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--"
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function NewReportPage() {
  const router = useRouter()
  const [step, setStep] = useState<"select" | "generate">("select")

  // Step 1: Grant selection
  const [grants, setGrants] = useState<GrantOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedGrant, setSelectedGrant] = useState<GrantOption | null>(null)
  const [completeness, setCompleteness] = useState<number | null>(null)
  const [completenessLoading, setCompletenessLoading] = useState(false)

  // Step 2: Generation
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!selectedGrant?.program_id) {
      setCompleteness(null)
      return
    }
    async function fetchCompleteness() {
      setCompletenessLoading(true)
      try {
        const res = await fetch(
          `/api/programs/${selectedGrant!.program_id}/data`
        )
        if (res.ok) {
          const data = await res.json()
          // Use the latest period's completeness_score, or average
          if (Array.isArray(data) && data.length > 0) {
            const latest = data[data.length - 1]
            setCompleteness(latest.completeness_score ?? null)
          } else {
            setCompleteness(0)
          }
        }
      } catch {
        setCompleteness(null)
      } finally {
        setCompletenessLoading(false)
      }
    }
    fetchCompleteness()
  }, [selectedGrant])

  const filteredGrants = grants.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.funder_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (g.program_name ?? "").toLowerCase().includes(search.toLowerCase())
  )

  async function handleGenerate() {
    if (!selectedGrant) return
    setStep("generate")
    setGenerating(true)
    setGenStep(0)
    setError(null)

    // Animate through steps
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setGenStep(i)
      await new Promise((r) => setTimeout(r, GENERATION_STEPS[i].duration))
    }

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_id: selectedGrant.id }),
      })

      if (res.ok) {
        const report = await res.json()
        router.push(`/reports/${report.id}`)
      } else {
        const err = await res.json()
        setError(err.error || "Failed to generate report.")
        setGenerating(false)
      }
    } catch {
      setError("Failed to generate report. Please try again.")
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Generate Report"
        actions={
          <Button variant="outline" render={<Link href="/reports" />}>
            <ArrowLeft className="size-4" />
            Back to Reports
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {step === "select" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Select Grant</CardTitle>
                  <CardDescription>
                    Choose a grant to generate a report for. The report will be
                    built using your program data and the funder&apos;s template.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search grants by name, funder, or program..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {loading ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Loading grants...
                    </p>
                  ) : filteredGrants.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No grants found. Create a grant first.
                    </p>
                  ) : (
                    <div className="max-h-80 space-y-1 overflow-y-auto">
                      {filteredGrants.map((grant) => (
                        <button
                          key={grant.id}
                          type="button"
                          className={`w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted ${
                            selectedGrant?.id === grant.id
                              ? "bg-primary/10 ring-1 ring-primary/30"
                              : ""
                          }`}
                          onClick={() => setSelectedGrant(grant)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {grant.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {grant.funder_name ?? "No funder"}{" "}
                                {grant.program_name
                                  ? `/ ${grant.program_name}`
                                  : ""}
                              </p>
                            </div>
                            {grant.next_due_date && (
                              <Badge variant="outline" className="shrink-0">
                                Due {formatDate(grant.next_due_date)}
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completeness check */}
              {selectedGrant && (
                <Card>
                  <CardContent className="pt-4">
                    {completenessLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Checking program data completeness...
                      </p>
                    ) : completeness !== null ? (
                      <div className="space-y-3">
                        <Progress value={completeness}>
                          <ProgressLabel>Data Completeness</ProgressLabel>
                          <ProgressValue>
                            {(formatted) => formatted ?? `${Math.round(completeness)}%`}
                          </ProgressValue>
                        </Progress>
                        <p className="text-sm text-muted-foreground">
                          Program data is{" "}
                          <span className="font-medium text-foreground">
                            {Math.round(completeness)}% complete
                          </span>{" "}
                          for this period.
                        </p>
                        {completeness < 60 && (
                          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <span>
                              Data is incomplete. The report may have gaps.
                              Consider updating your program data before
                              generating.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No program data available for completeness check.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedGrant}
                >
                  <Sparkles className="size-4" />
                  Generate Report
                </Button>
              </div>
            </>
          )}

          {step === "generate" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                {generating ? (
                  <div className="space-y-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="size-8 animate-pulse text-primary" />
                    </div>
                    <div className="space-y-6">
                      {GENERATION_STEPS.map((s, i) => {
                        const Icon = s.icon
                        const isActive = i === genStep
                        const isDone = i < genStep
                        return (
                          <div
                            key={s.label}
                            className={`flex items-center gap-3 transition-opacity ${
                              isActive
                                ? "opacity-100"
                                : isDone
                                  ? "opacity-50"
                                  : "opacity-30"
                            }`}
                          >
                            <div
                              className={`flex size-8 items-center justify-center rounded-full ${
                                isDone
                                  ? "bg-primary text-primary-foreground"
                                  : isActive
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isDone ? (
                                <Check className="size-4" />
                              ) : (
                                <Icon className="size-4" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isActive
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : error ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
                      <AlertTriangle className="size-8 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Generation Failed
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {error}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep("select")}
                      >
                        Back
                      </Button>
                      <Button onClick={handleGenerate}>Try Again</Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
