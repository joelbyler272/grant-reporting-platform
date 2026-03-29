"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClipboardList,
  Building2,
  FileText,
  Users,
} from "lucide-react"
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

interface SearchResult {
  id: string
  name: string
  type: string
  url: string
}

interface SearchResults {
  programs: SearchResult[]
  funders: SearchResult[]
  grants: SearchResult[]
  reports: SearchResult[]
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  programs: { label: "Programs", icon: ClipboardList },
  funders: { label: "Funders", icon: Building2 },
  grants: { label: "Grants", icon: FileText },
  reports: { label: "Reports", icon: Users },
}

interface SearchCommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SearchCommand({ open: controlledOpen, onOpenChange }: SearchCommandProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Register Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data: SearchResults = await res.json()
        setResults(data)
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false)
    }
  }, [])

  function handleValueChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  function handleSelect(url: string) {
    setOpen(false)
    setQuery("")
    setResults(null)
    router.push(url)
  }

  const hasResults =
    results &&
    (results.programs.length > 0 ||
      results.funders.length > 0 ||
      results.grants.length > 0 ||
      results.reports.length > 0)

  return (
    <CommandDialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          setQuery("")
          setResults(null)
        }
      }}
      title="Search"
      description="Search across programs, funders, grants, and reports"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search programs, funders, grants, reports..."
          value={query}
          onValueChange={handleValueChange}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && !hasResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {!loading &&
            results &&
            (Object.keys(CATEGORY_META) as Array<keyof SearchResults>).map(
              (category) => {
                const items = results[category]
                if (!items || items.length === 0) return null
                const meta = CATEGORY_META[category]
                const Icon = meta.icon
                return (
                  <CommandGroup key={category} heading={meta.label}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${category}-${item.id}`}
                        onSelect={() => handleSelect(item.url)}
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        <span>{item.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              }
            )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
