"use client"

import { useState } from "react"
import { Bell, Search } from "lucide-react"
import { SearchCommand } from "@/components/layout/search-command"

interface TopBarProps {
  title: string
  actions?: React.ReactNode
}

export function TopBar({ title, actions }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-6">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          {actions}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
          >
            <Search className="size-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-2 inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted sm:hidden"
          >
            <Search className="size-5" />
          </button>
          <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted">
            <Bell className="size-5" />
          </button>
        </div>
      </header>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
