"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)

  function next() {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function back() {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

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

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && <StepOrganization />}
            {currentStep === 2 && <StepProgram />}
            {currentStep === 3 && <StepFunder />}
            {currentStep === 4 && <StepGrant />}
            {currentStep === 5 && <StepReady />}
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
              <Button variant="ghost" render={<Link href="/dashboard" />}>Skip</Button>
            )}

            {currentStep < TOTAL_STEPS && (
              <Button onClick={next}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            )}

            {currentStep === TOTAL_STEPS && (
              <Button render={<Link href="/reports/new" />}>
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

// ── Step Components ──────────────────────────────────────────────────

function StepOrganization() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Your Organization</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your nonprofit organization.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input id="org-name" placeholder="e.g. Hope Community Services" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ein">EIN (Optional)</Label>
          <Input id="ein" placeholder="e.g. 12-3456789" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mission">Mission Statement (Optional)</Label>
          <Textarea
            id="mission"
            placeholder="Briefly describe your organization's mission..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

function StepProgram() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Your First Program</h2>
        <p className="text-sm text-muted-foreground">
          Add a program that your organization runs.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="program-name">Program Name</Label>
          <Input id="program-name" placeholder="e.g. Youth Mentorship Program" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="population">Target Population</Label>
          <Input
            id="population"
            placeholder="e.g. At-risk youth ages 14-18"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program-desc">Description (Optional)</Label>
          <Textarea
            id="program-desc"
            placeholder="What does this program do?"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

function StepFunder() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Your First Funder</h2>
        <p className="text-sm text-muted-foreground">
          Add a funder that supports your organization.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="funder-name">Funder Name</Label>
          <Input
            id="funder-name"
            placeholder="e.g. Community Foundation of Greater Metro"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="funder-type">Funder Type</Label>
          <Input
            id="funder-type"
            placeholder="e.g. Foundation, Government, Corporate, United Way"
          />
        </div>
      </div>
    </div>
  )
}

function StepGrant() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Your First Grant</h2>
        <p className="text-sm text-muted-foreground">
          Connect a grant from your funder to your program.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="grant-amount">Grant Amount</Label>
          <Input id="grant-amount" type="number" placeholder="e.g. 50000" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start-date">Start Date</Label>
          <Input id="start-date" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-date">End Date</Label>
          <Input id="end-date" type="date" />
        </div>
      </div>
    </div>
  )
}

function StepReady() {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="rounded-full bg-status-on-track-bg p-4">
        <CheckCircle className="size-10 text-status-on-track" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">You&apos;re All Set!</h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Your organization is set up and ready to go. Generate your first
        report or head to the dashboard to explore.
      </p>
      <Button variant="outline" className="mt-4" render={<Link href="/dashboard" />}>Go to Dashboard</Button>
    </div>
  )
}
