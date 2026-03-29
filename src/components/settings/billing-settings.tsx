"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Minus, Crown, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SubscriptionData {
  plan: "free" | "pro"
  status: string
  current_period_end: string | null
  usage: {
    programs: { current: number; limit: number | null }
    funders: { current: number; limit: number | null }
    team_members: { current: number; limit: number | null }
  }
}

const PLAN_FEATURES: {
  feature: string
  free: string | boolean | null
  pro: string | boolean | null
}[] = [
  { feature: "Programs", free: "1", pro: "Unlimited" },
  { feature: "Funders", free: "3", pro: "Unlimited" },
  { feature: "Report Generation", free: "Unlimited", pro: "Unlimited" },
  { feature: "Report Archive", free: "30 days", pro: "Unlimited" },
  { feature: "Team Members", free: "1", pro: "Up to 5" },
  { feature: "Export (Word/PDF)", free: null, pro: true },
  { feature: "Funder Notes", free: null, pro: true },
  { feature: "Community Library", free: "Read", pro: "Read + Contribute" },
]

export function BillingSettings() {
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showSuccess = searchParams.get("success") === "true"

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/billing/subscription")
        if (!res.ok) throw new Error("Failed to load subscription")
        const data = await res.json()
        setSubscription(data)
      } catch {
        setError("Failed to load billing information")
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  async function handleUpgrade() {
    setActionLoading(true)
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" })
      if (!res.ok) throw new Error("Failed to start checkout")
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Failed to start checkout. Please try again.")
      setActionLoading(false)
    }
  }

  async function handleManage() {
    setActionLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      if (!res.ok) throw new Error("Failed to open portal")
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError("Failed to open billing portal. Please try again.")
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !subscription) {
    return (
      <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </div>
    )
  }

  const plan = subscription?.plan ?? "free"
  const isPro = plan === "pro"

  return (
    <div className="grid max-w-3xl gap-6">
      {showSuccess && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <p className="font-medium">Subscription updated successfully!</p>
          <p className="mt-0.5">Thank you for upgrading to Pro. All features are now available.</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? (
                <>
                  <Crown className="size-3" />
                  Pro
                </>
              ) : (
                "Free"
              )}
            </Badge>
          </div>
          <CardDescription>
            {isPro
              ? "You have access to all Pro features."
              : "You are on the free plan with limited features."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {isPro ? (
              <>
                <Button onClick={handleManage} disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Manage Subscription
                </Button>
                {subscription?.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    Next billing date:{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                )}
              </>
            ) : (
              <Button onClick={handleUpgrade} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Crown className="size-4" />
                )}
                Upgrade to Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      {subscription?.usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Your current resource usage against plan limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                { label: "Programs", key: "programs" as const },
                { label: "Funders", key: "funders" as const },
                { label: "Team Members", key: "team_members" as const },
              ]).map(({ label, key }) => {
                const usage = subscription.usage[key]
                return (
                  <div
                    key={key}
                    className="rounded-lg border p-3"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {usage.current}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / {usage.limit ?? "\u221E"}
                      </span>
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            See what is included in each plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="pb-3 px-4 font-medium text-muted-foreground">
                    Free
                  </th>
                  <th className="pb-3 pl-4 font-medium text-muted-foreground">
                    Pro ($20/mo)
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map(({ feature, free, pro }) => (
                  <tr key={feature} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{feature}</td>
                    <td className="py-3 px-4">
                      {free === null ? (
                        <Minus className="size-4 text-muted-foreground" />
                      ) : free === true ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <span className="text-muted-foreground">{free}</span>
                      )}
                    </td>
                    <td className="py-3 pl-4">
                      {pro === null ? (
                        <Minus className="size-4 text-muted-foreground" />
                      ) : pro === true ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <span>{pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isPro && (
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleUpgrade} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Crown className="size-4" />
                )}
                Upgrade to Pro - $20/month
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
