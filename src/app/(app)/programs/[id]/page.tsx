"use client"

import { use, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Upload,
  FileSpreadsheet,
  FormInput,
  Loader2,
  Calendar,
  MapPin,
  Users,
} from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress, ProgressValue } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Grant {
  id: string
  name: string
  funder_id: string
  status: string
  amount: number | null
  start_date: string | null
  end_date: string | null
}

interface ProgramData {
  id: string
  program_id: string
  period_label: string
  period_start: string
  period_end: string
  source: string
  outcomes_data: Record<string, unknown> | null
  metrics_data: Record<string, unknown> | null
  client_stories: string | null
  challenges: string | null
  financials: Record<string, unknown> | null
  completeness_score: number
  created_at: string
}

interface Program {
  id: string
  name: string
  description: string | null
  population_served: string | null
  geography: string | null
  created_at: string
  updated_at: string
  grants: Grant[]
  program_data: ProgramData[]
}

type AddDataStep = "choose" | "upload" | "form" | "spreadsheet"

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add Data dialog state
  const [addDataOpen, setAddDataOpen] = useState(false)
  const [addDataStep, setAddDataStep] = useState<AddDataStep>("choose")
  const [formSaving, setFormSaving] = useState(false)

  // Form fields for "Fill Out Form"
  const [formPeriodLabel, setFormPeriodLabel] = useState("")
  const [formPeriodStart, setFormPeriodStart] = useState("")
  const [formPeriodEnd, setFormPeriodEnd] = useState("")
  const [formOutcomes, setFormOutcomes] = useState("")
  const [formMetrics, setFormMetrics] = useState("")
  const [formClientStories, setFormClientStories] = useState("")
  const [formChallenges, setFormChallenges] = useState("")
  const [formFinancials, setFormFinancials] = useState("")

  const fetchProgram = useCallback(async () => {
    try {
      const res = await fetch(`/api/programs/${id}`)
      if (!res.ok) throw new Error("Failed to fetch program")
      const data = await res.json()
      setProgram(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProgram()
  }, [fetchProgram])

  function openAddData() {
    setAddDataStep("choose")
    setAddDataOpen(true)
    resetForm()
  }

  function resetForm() {
    setFormPeriodLabel("")
    setFormPeriodStart("")
    setFormPeriodEnd("")
    setFormOutcomes("")
    setFormMetrics("")
    setFormClientStories("")
    setFormChallenges("")
    setFormFinancials("")
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formPeriodLabel || !formPeriodStart || !formPeriodEnd) return

    setFormSaving(true)
    try {
      // Calculate completeness
      const fields = [
        formOutcomes,
        formMetrics,
        formClientStories,
        formChallenges,
        formFinancials,
      ]
      const filled = fields.filter((f) => f.trim().length > 0).length
      const completeness = Math.round((filled / fields.length) * 100)

      const res = await fetch(`/api/programs/${id}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_label: formPeriodLabel,
          period_start: formPeriodStart,
          period_end: formPeriodEnd,
          source: "manual",
          outcomes_data: formOutcomes
            ? { summary: formOutcomes }
            : null,
          metrics_data: formMetrics ? { summary: formMetrics } : null,
          client_stories: formClientStories || null,
          challenges: formChallenges || null,
          financials: formFinancials
            ? { summary: formFinancials }
            : null,
          completeness_score: completeness,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save data")
      }

      setAddDataOpen(false)
      fetchProgram()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setFormSaving(false)
    }
  }

  const sortedData = program?.program_data
    ? [...program.program_data].sort(
        (a, b) =>
          new Date(b.period_start).getTime() -
          new Date(a.period_start).getTime()
      )
    : []

  const activeGrants =
    program?.grants?.filter((g) => g.status === "active") ?? []

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Program" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Program" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-destructive">
            {error || "Program not found"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={program.name}
        actions={
          <Button variant="outline" render={<Link href="/programs" />}>
            <ArrowLeft className="size-4" />
            Back to Programs
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="mt-4 space-y-6">
              {/* Program Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {program.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1">{program.description}</p>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {program.population_served && (
                      <div className="flex items-start gap-2">
                        <Users className="mt-0.5 size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Population Served
                          </p>
                          <p className="mt-0.5 font-medium">
                            {program.population_served}
                          </p>
                        </div>
                      </div>
                    )}
                    {program.geography && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Geography
                          </p>
                          <p className="mt-0.5 font-medium">
                            {program.geography}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Created
                        </p>
                        <p className="mt-0.5 font-medium">
                          {new Date(program.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Grants */}
              <Card>
                <CardHeader>
                  <CardTitle>Linked Grants</CardTitle>
                  <CardDescription>
                    Grants associated with this program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {program.grants && program.grants.length > 0 ? (
                    <div className="space-y-3">
                      {program.grants.map((grant) => (
                        <div
                          key={grant.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium">{grant.name}</p>
                            {grant.amount && (
                              <p className="text-sm text-muted-foreground">
                                $
                                {grant.amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              grant.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {grant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No grants linked to this program yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Reporting Periods</h3>
                <Button onClick={openAddData}>
                  <Plus className="size-4" />
                  Add Data
                </Button>
              </div>

              {sortedData.length > 0 ? (
                <div className="space-y-3">
                  {sortedData.map((entry) => (
                    <Card key={entry.id} size="sm">
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{entry.period_label}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              entry.period_start
                            ).toLocaleDateString()}{" "}
                            &ndash;{" "}
                            {new Date(
                              entry.period_end
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{entry.source}</Badge>
                          <div className="w-28">
                            <Progress value={entry.completeness_score}>
                              <ProgressValue />
                            </Progress>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No data entries yet. Add your first reporting period
                      data.
                    </p>
                    <Button className="mt-4" onClick={openAddData}>
                      <Plus className="size-4" />
                      Add Data
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="mt-4">
              {sortedData.length > 0 ? (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

                  {sortedData.map((entry) => (
                    <div
                      key={entry.id}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-1.5 size-3 rounded-full border-2 border-primary bg-background" />

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {entry.period_label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                entry.period_start
                              ).toLocaleDateString()}{" "}
                              &ndash;{" "}
                              {new Date(
                                entry.period_end
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{entry.source}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                entry.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 rounded-lg border border-border p-3 text-sm">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <span className="text-muted-foreground">
                                Completeness:{" "}
                              </span>
                              <span className="font-medium">
                                {entry.completeness_score}%
                              </span>
                            </div>
                            {entry.outcomes_data && (
                              <div>
                                <span className="text-muted-foreground">
                                  Outcomes:{" "}
                                </span>
                                <span className="font-medium">Provided</span>
                              </div>
                            )}
                            {entry.metrics_data && (
                              <div>
                                <span className="text-muted-foreground">
                                  Metrics:{" "}
                                </span>
                                <span className="font-medium">Provided</span>
                              </div>
                            )}
                            {entry.client_stories && (
                              <div>
                                <span className="text-muted-foreground">
                                  Client Stories:{" "}
                                </span>
                                <span className="font-medium">Provided</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No history yet. Data entries will appear here
                      chronologically.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Data Dialog */}
      <Dialog open={addDataOpen} onOpenChange={setAddDataOpen}>
        <DialogContent className="sm:max-w-lg">
          {addDataStep === "choose" && (
            <>
              <DialogHeader>
                <DialogTitle>Add Program Data</DialogTitle>
                <DialogDescription>
                  Choose how you want to add data for this program.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <button
                  type="button"
                  onClick={() => setAddDataStep("upload")}
                  className="flex w-full items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <Upload className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Upload Document</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a PDF, Word doc, or other document
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAddDataStep("form")}
                  className="flex w-full items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <FormInput className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Fill Out Form</p>
                    <p className="text-sm text-muted-foreground">
                      Enter outcomes, metrics, stories, and financials
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAddDataStep("spreadsheet")}
                  className="flex w-full items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <FileSpreadsheet className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Import Spreadsheet</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV or Excel file with program data
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {addDataStep === "upload" && (
            <>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a document containing program data.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <Upload className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  Drag and drop a file here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, DOCX, or TXT up to 10MB
                </p>
                <Button variant="outline" className="mt-4" size="sm">
                  Browse Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Document upload is coming soon. Use the form option for now.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddDataStep("choose")}
                >
                  Back
                </Button>
              </DialogFooter>
            </>
          )}

          {addDataStep === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Add Reporting Period Data</DialogTitle>
                <DialogDescription>
                  Enter program data for a reporting period.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleFormSubmit}
                className="max-h-[60vh] space-y-4 overflow-y-auto pr-1"
              >
                {/* Period Info */}
                <div className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Reporting Period</p>
                  <div className="space-y-2">
                    <Label htmlFor="period_label">Period Label</Label>
                    <Input
                      id="period_label"
                      placeholder="e.g., Q1 2025"
                      value={formPeriodLabel}
                      onChange={(e) => setFormPeriodLabel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="period_start">Start Date</Label>
                      <Input
                        id="period_start"
                        type="date"
                        value={formPeriodStart}
                        onChange={(e) => setFormPeriodStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period_end">End Date</Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={formPeriodEnd}
                        onChange={(e) => setFormPeriodEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Outcomes */}
                <div className="space-y-2">
                  <Label htmlFor="outcomes">Outcomes</Label>
                  <Textarea
                    id="outcomes"
                    placeholder="Describe program outcomes for this period..."
                    value={formOutcomes}
                    onChange={(e) => setFormOutcomes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <Label htmlFor="metrics">Metrics</Label>
                  <Textarea
                    id="metrics"
                    placeholder="Key metrics: participants served, completion rates, etc."
                    value={formMetrics}
                    onChange={(e) => setFormMetrics(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Client Stories */}
                <div className="space-y-2">
                  <Label htmlFor="client_stories">Client Stories</Label>
                  <Textarea
                    id="client_stories"
                    placeholder="Share anonymized success stories or testimonials..."
                    value={formClientStories}
                    onChange={(e) => setFormClientStories(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Challenges */}
                <div className="space-y-2">
                  <Label htmlFor="challenges">Challenges</Label>
                  <Textarea
                    id="challenges"
                    placeholder="Describe any challenges or barriers encountered..."
                    value={formChallenges}
                    onChange={(e) => setFormChallenges(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Financials */}
                <div className="space-y-2">
                  <Label htmlFor="financials">Financial Summary</Label>
                  <Textarea
                    id="financials"
                    placeholder="Budget vs. actual spending, notable expenses..."
                    value={formFinancials}
                    onChange={(e) => setFormFinancials(e.target.value)}
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDataStep("choose")}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={formSaving}>
                    {formSaving ? "Saving..." : "Save Data"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {addDataStep === "spreadsheet" && (
            <>
              <DialogHeader>
                <DialogTitle>Import Spreadsheet</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file with program data.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <FileSpreadsheet className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  Drag and drop a spreadsheet here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  CSV or XLSX up to 10MB
                </p>
                <Button variant="outline" className="mt-4" size="sm">
                  Browse Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Spreadsheet import is coming soon. Use the form option for now.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddDataStep("choose")}
                >
                  Back
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
