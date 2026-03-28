"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Library, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CommunityFunder {
  id: string
  name: string
  type: string | null
  is_community: boolean
  template_section_count: number
}

interface CommunityLibraryModalProps {
  onAdd: (funderId: string) => void
}

export function CommunityLibraryModal({ onAdd }: CommunityLibraryModalProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CommunityFunder[]>([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `/api/funders/search?q=${encodeURIComponent(q.trim())}`
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  async function handleAdd(funderId: string) {
    setAddingId(funderId)
    try {
      onAdd(funderId)
      setOpen(false)
      setQuery("")
      setResults([])
    } finally {
      setAddingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Search className="size-4" />
            Search Community Library
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Community Funder Library</DialogTitle>
          <DialogDescription>
            Search for funders shared by the community and add them to your
            organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute top-2 left-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search funders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {loading && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Searching...
              </p>
            )}
            {!loading && query.trim() && results.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <Library className="size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No community funders found matching your search.
                </p>
              </div>
            )}
            {results.map((funder) => (
              <div
                key={funder.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{funder.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {funder.type && (
                      <Badge variant="secondary" className="text-xs">
                        {funder.type}
                      </Badge>
                    )}
                    {funder.template_section_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        {funder.template_section_count} sections
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAdd(funder.id)}
                  disabled={addingId === funder.id}
                >
                  {addingId === funder.id ? "Adding..." : "Add"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
