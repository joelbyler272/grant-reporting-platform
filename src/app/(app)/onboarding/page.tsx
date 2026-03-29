"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

const TOTAL_STEPS = 5

interface CreatedIds {
  programId: string | null
  programName: string | null
  funderId: string | null
  funderName: string | null
  grantId: string | null
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdIds, setCreatedIds] = useState<CreatedIds>({
    programId: null,
    programName: null,
    funderId: null,
    funderName: null,
    grantId: null,
  })

  // Step 1 state
  const [orgName, setOrgName] = useState("")
  const [orgEin, setOrgEin] = useState("")
  const [orgMission, setOrgMission] = useState("")

  // Step 2 state
  const [programName, setProgramName] = useState("")
  const [populationServed, setPopulationServed] = useState("")
  const [programDesc, setProgramDesc] = useState("")

  // Step 3 state
  const [funderSearch, setFunderSearch] = useState("")
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; type: string | null; is_community: boolean }[]
  >([])
  const [searching, setSearching] = useState(false)
  const [selectedCommunityFunder, setSelectedCommunityFunder] = useState<{
    id: string
    name: string
  } | null>(null)
  const [funderName, setFunderName] = useState("")
  const [funderType, setFunderType] = useState("")
  const [manualEntry, setManualEntry] = useState(false)

  // Step 4 state
  const [grantAmount, setGrantAmount] = useState("")
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [reportDueDate, setReportDueDate] = useState("")

  // Load org data on mount
  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch("/api/organizations")
        if (res.ok) {
          const org = await res.json()
          if (org.name) setOrgName(org.name)
          if (org.ein) setOrgEin(org.ein)
          if (org.mission) setOrgMission(org.mission)
        }
      } catch {
        // ignore - user will fill in
      }
    }
    loadOrg()
  }, [])

  function next() {
    setError(null)
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function back() {
    setError(null)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  async function handleSaveAndContinue() {
    setError(null)
    setSaving(true)

    try {
      if (currentStep === 1) {
        if (!orgName.trim()) {
          setError("Organization name is required.")
          setSaving(false)
          return
        }
        const res = await fetch("/api/organizations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orgName.trim(),
            ein: orgEin.trim() || null,
            mission: orgMission.trim() || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? "Failed to save organization")
        }
      } else if (currentStep === 2) {
        if (!programName.trim()) {
          setError("Program name is required.")
          setSaving(false)
          return
        }
        const res = await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: programName.trim(),
            population_served: populationServed.trim() || null,
            description: programDesc.trim() || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? "Failed to save program")
        }
        const program = await res.json()
        setCreatedIds((prev) => ({
          ...prev,
          programId: program.id,
          programName: program.name,
        }))
      } else if (currentStep === 3) {
        if (selectedCommunityFunder) {
          // Use existing community funder
          setCreatedIds((prev) => ({
            ...prev,
            funderId: selectedCommunityFunder.id,
            funderName: selectedCommunityFunder.name,
          }))
        } else {
          if (!funderName.trim()) {
            setError("Funder name is required.")
            setSaving(false)
            return
          }
          const res = await fetch("/api/funders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: funderName.trim(),
              type: funderType.trim() || null,
            }),
          })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error ?? "Failed to save funder")
          }
          const funder = await res.json()
          setCreatedIds((prev) => ({
            ...prev,
            funderId: funder.id,
            funderName: funder.name,
          }))
        }
      } else if (currentStep === 4) {
        const funderId = createdIds.funderId
        if (!funderId) {
          setError("No funder selected. Go back and add a funder first.")
          setSaving(false)
          return
        }
        if (!grantAmount.trim()) {
          setError("Grant amount is required.")
          setSaving(false)
          return
        }
        const grantName = `${createdIds.funderName ?? "Grant"} - ${createdIds.programName ?? "Program"}`
        const reportDueDates = reportDueDate
          ? [
              {
                due_date: reportDueDate,
                period_label: "First Report",
                period_start: periodStart || null,
                period_end: periodEnd || null,
              },
            ]
          : []
        const res = await fetch("/api/grants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            funder_id: funderId,
            program_id: createdIds.programId || null,
            name: grantName,
            amount: parseFloat(grantAmount),
            period_start: periodStart || null,
            period_end: periodEnd || null,
            report_due_dates: reportDueDates,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? "Failed to save grant")
        }
        const grant = await res.json()
        setCreatedIds((prev) => ({ ...prev, grantId: grant.id }))
      }

      next()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  // Funder search with debounce
  const searchFunders = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `/api/funders/search?q=${encodeURIComponent(query.trim())}`
      )
      if (res.ok) {
        const results = await res.json()
        setSearchResults(results)
      }
    } catch {
      // ignore search errors
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (currentStep !== 3) return
    const timer = setTimeout(() => {
      searchFunders(funderSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [funderSearch, currentStep, searchFunders])

  const reportLink = createdIds.grantId
    ? `/reports/new?grant_id=${createdIds.grantId}`
    : "/reports/new"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Set Up GrantFlow
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Progress */}
        <Progress value={(currentStep / TOTAL_STEPS) * 100} />

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Your Organization</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your nonprofit organization.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="org-name">
                      Organization Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="org-name"
                      placeholder="e.g. Hope Community Services"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ein">EIN (Optional)</Label>
                    <Input
                      id="ein"
                      placeholder="e.g. 12-3456789"
                      value={orgEin}
                      onChange={(e) => setOrgEin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mission">Mission Statement (Optional)</Label>
                    <Textarea
                      id="mission"
                      placeholder="Briefly describe your organization's mission..."
                      rows={3}
                      value={orgMission}
                      onChange={(e) => setOrgMission(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Your First Program</h2>
                  <p className="text-sm text-muted-foreground">
                    Add a program that your organization runs.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="program-name">
                      Program Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="program-name"
                      placeholder="e.g. Youth Mentorship Program"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="population">Target Population</Label>
                    <Input
                      id="population"
                      placeholder="e.g. At-risk youth ages 14-18"
                      value={populationServed}
                      onChange={(e) => setPopulationServed(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="program-desc">Description (Optional)</Label>
                    <Textarea
                      id="program-desc"
                      placeholder="What does this program do?"
                      rows={3}
                      value={programDesc}
                      onChange={(e) => setProgramDesc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Your First Funder</h2>
                  <p className="text-sm text-muted-foreground">
                    Search the community library or add a new funder.
                  </p>
                </div>

                {!manualEntry && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="funder-search">Search Community Library</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          id="funder-search"
                          className="pl-9"
                          placeholder="Search for a funder..."
                          value={funderSearch}
                          onChange={(e) => {
                            setFunderSearch(e.target.value)
                            setSelectedCommunityFunder(null)
                          }}
                        />
                        {searching && (
                          <Loader2 className="absolute right-2.5 top-2.5 size-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto rounded-md border">
                        {searchResults.map((funder) => (
                          <button
                            key={funder.id}
                            type="button"
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent ${
                              selectedCommunityFunder?.id === funder.id
                                ? "bg-accent"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedCommunityFunder({
                                id: funder.id,
                                name: funder.name,
                              })
                            }}
                          >
                            <span className="font-medium">{funder.name}</span>
                            {funder.type && (
                              <span className="text-xs text-muted-foreground">
                                {funder.type}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCommunityFunder && (
                      <div className="rounded-md bg-accent/50 px-3 py-2 text-sm">
                        Selected: <strong>{selectedCommunityFunder.name}</strong>
                      </div>
                    )}

                    {funderSearch && searchResults.length === 0 && !searching && (
                      <p className="text-sm text-muted-foreground">
                        No funders found.
                      </p>
                    )}

                    <div className="pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setManualEntry(true)
                          setSelectedCommunityFunder(null)
                        }}
                      >
                        Or add manually
                      </Button>
                    </div>
                  </div>
                )}

                {manualEntry && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="funder-name">
                        Funder Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="funder-name"
                        placeholder="e.g. Community Foundation of Greater Metro"
                        value={funderName}
                        onChange={(e) => setFunderName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="funder-type">Funder Type</Label>
                      <Input
                        id="funder-type"
                        placeholder="e.g. Foundation, Government, Corporate, United Way"
                        value={funderType}
                        onChange={(e) => setFunderType(e.target.value)}
                      />
                    </div>
                    <div className="pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setManualEntry(false)
                          setFunderName("")
                          setFunderType("")
                        }}
                      >
                        Back to search
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Your First Grant</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect a grant from your funder to your program.
                  </p>
                </div>

                {(createdIds.funderName || createdIds.programName) && (
                  <div className="rounded-md bg-accent/50 px-3 py-2 text-sm space-y-1">
                    {createdIds.funderName && (
                      <p>
                        Funder: <strong>{createdIds.funderName}</strong>
                      </p>
                    )}
                    {createdIds.programName && (
                      <p>
                        Program: <strong>{createdIds.programName}</strong>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="grant-amount">
                      Grant Amount <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grant-amount"
                      type="number"
                      placeholder="e.g. 50000"
                      value={grantAmount}
                      onChange={(e) => setGrantAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="report-due">Next Report Due Date</Label>
                    <Input
                      id="report-due"
                      type="date"
                      value={reportDueDate}
                      onChange={(e) => setReportDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="rounded-full bg-status-on-track-bg p-4">
                  <CheckCircle className="size-10 text-status-on-track" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">
                  You&apos;re All Set!
                </h2>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Your organization is set up and ready to go. Generate your
                  first report or head to the dashboard to explore.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  render={<Link href="/dashboard" />}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && currentStep < TOTAL_STEPS && (
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < TOTAL_STEPS && (
              <Button variant="ghost" onClick={next}>
                Skip
              </Button>
            )}

            {currentStep < TOTAL_STEPS && (
              <Button onClick={handleSaveAndContinue} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {saving ? "Saving..." : "Save & Continue"}
                {!saving && <ArrowRight className="size-4" />}
              </Button>
            )}

            {currentStep === TOTAL_STEPS && (
              <Button render={<Link href={reportLink} />}>
                <Sparkles className="size-4" />
                Generate First Report
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
