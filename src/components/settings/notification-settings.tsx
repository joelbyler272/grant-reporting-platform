"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface NotificationPreferences {
  reminder14Days: boolean
  reminder7Days: boolean
  reminder3Days: boolean
  emailReportReminders: boolean
  emailTeamActivity: boolean
}

const DEFAULTS: NotificationPreferences = {
  reminder14Days: true,
  reminder7Days: true,
  reminder3Days: true,
  emailReportReminders: true,
  emailTeamActivity: false,
}

const STORAGE_KEY = "cleargrant-notification-prefs"

function loadPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch {
    // Ignore parse errors
  }
  return DEFAULTS
}

function Checkbox({
  id,
  checked,
  onChange,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex size-4 shrink-0 items-center justify-center rounded border border-input transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      data-state={checked ? "checked" : "unchecked"}
    >
      {checked && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className="text-white"
        >
          <path
            d="M8.5 2.5L3.75 7.5L1.5 5.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setPrefs(loadPreferences())
    setLoaded(true)
  }, [])

  function updatePref<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!loaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Configure email notifications for report deadlines, team activity,
            and system updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure email notifications for report deadlines, team activity, and
          system updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid max-w-xl gap-6">
          {saved && (
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              Notification preferences saved.
            </div>
          )}

          {/* Deadline Reminder Timing */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Deadline Reminder Timing
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose when to receive reminders before a report is due.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="reminder-14"
                  checked={prefs.reminder14Days}
                  onChange={(v) => updatePref("reminder14Days", v)}
                />
                <Label htmlFor="reminder-14" className="font-normal">
                  2 weeks before due date
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="reminder-7"
                  checked={prefs.reminder7Days}
                  onChange={(v) => updatePref("reminder7Days", v)}
                />
                <Label htmlFor="reminder-7" className="font-normal">
                  1 week before due date
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="reminder-3"
                  checked={prefs.reminder3Days}
                  onChange={(v) => updatePref("reminder3Days", v)}
                />
                <Label htmlFor="reminder-3" className="font-normal">
                  3 days before due date
                </Label>
              </div>
            </div>
          </div>

          {/* Email Notification Toggles */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Email Notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                Control which emails you receive.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="email-reminders"
                  checked={prefs.emailReportReminders}
                  onChange={(v) => updatePref("emailReportReminders", v)}
                />
                <Label htmlFor="email-reminders" className="font-normal">
                  Report deadline reminders
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="email-team"
                  checked={prefs.emailTeamActivity}
                  onChange={(v) => updatePref("emailTeamActivity", v)}
                />
                <Label htmlFor="email-team" className="font-normal">
                  Team activity (comments, reviews, submissions)
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSave}>Save preferences</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
