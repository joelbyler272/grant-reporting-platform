"use client"

import Link from "next/link"
import { Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UpgradePromptProps {
  resource: string
  current: number
  limit: number
}

export function UpgradePrompt({ resource, current, limit }: UpgradePromptProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Crown className="size-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            You&apos;ve reached the free plan limit of {limit} {resource}.
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            You currently have {current} {resource}. Upgrade to Pro for unlimited
            access and more features.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button render={<Link href="/settings?tab=billing" />}>
            <Crown className="size-4" />
            Upgrade to Pro
          </Button>
          <Button variant="ghost" render={<Link href="/settings?tab=billing" />}>
            Learn more
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
