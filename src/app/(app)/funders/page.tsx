"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Building2, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CommunityLibraryModal } from "@/components/funders/community-library-modal"

interface Funder {
  id: string
  name: string
  type: string | null
  active_grants: number
  has_template: boolean
  last_report_sent: string | null
}

export default function FundersPage() {
  const [funders, setFunders] = useState<Funder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFunders = useCallback(async () => {
    try {
      const res = await fetch("/api/funders")
      if (res.ok) {
        const data = await res.json()
        setFunders(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFunders()
  }, [fetchFunders])

  function handleCommunityAdd() {
    fetchFunders()
  }

  const typeColors: Record<string, "default" | "secondary" | "outline"> = {
    foundation: "default",
    government: "secondary",
    corporate: "outline",
    united_way: "secondary",
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Funders"
        actions={
          <div className="flex items-center gap-2">
            <CommunityLibraryModal onAdd={handleCommunityAdd} />
            <Button render={<Link href="/funders/new" />}>
              <Plus className="size-4" />
              Add Funder
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6">
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Loading funders...
              </p>
            </CardContent>
          </Card>
        ) : funders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <Building2 className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No funders yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Funders are the organizations that provide grants to your
                programs. Add a funder or search the community library to get
                started.
              </p>
              <div className="mt-6 flex gap-3">
                <Button render={<Link href="/funders/new" />}>
                  <Plus className="size-4" />
                  Add Funder
                </Button>
                <CommunityLibraryModal onAdd={handleCommunityAdd} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Funder Name
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Active Grants
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Template Status
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Last Report Sent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {funders.map((funder) => (
                    <tr
                      key={funder.id}
                      className="border-b transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/funders/${funder.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {funder.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {funder.type ? (
                          <Badge
                            variant={typeColors[funder.type] ?? "outline"}
                          >
                            {funder.type.replace("_", " ")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{funder.active_grants}</td>
                      <td className="px-4 py-3">
                        {funder.has_template ? (
                          <Badge variant="secondary">Has template</Badge>
                        ) : (
                          <Badge variant="outline">Needs template</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {funder.last_report_sent
                          ? new Date(
                              funder.last_report_sent
                            ).toLocaleDateString()
                          : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
