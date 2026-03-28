import Link from "next/link"
import { ClipboardList, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProgramsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Programs"
        actions={
          <Button render={<Link href="/programs/new" />}>
              <Plus className="size-4" />
              Add Program
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <ClipboardList className="size-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No programs yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Programs represent the services your organization provides.
              Add your first program to start tracking outcomes and generating
              reports.
            </p>
            <Button className="mt-6" render={<Link href="/programs/new" />}>
                <Plus className="size-4" />
                Add Your First Program
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
