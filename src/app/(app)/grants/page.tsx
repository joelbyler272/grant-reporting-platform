import Link from "next/link"
import { DollarSign, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GrantsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Grants"
        actions={
          <Button render={<Link href="/grants/new" />}>
              <Plus className="size-4" />
              Add Grant
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <DollarSign className="size-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No grants yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Grants connect your funders to your programs. Add a grant to
              start tracking funding and generating reports.
            </p>
            <Button className="mt-6" render={<Link href="/grants/new" />}>
                <Plus className="size-4" />
                Add Your First Grant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
