import Link from "next/link"
import { Building2, Plus, Search } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FundersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Funders"
        actions={
          <Button render={<Link href="/funders/new" />}>
              <Plus className="size-4" />
              Add Funder
          </Button>
        }
      />

      <div className="flex-1 p-6">
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
              <Button variant="outline" render={<Link href="/funders/library" />}>
                  <Search className="size-4" />
                  Search Community Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
