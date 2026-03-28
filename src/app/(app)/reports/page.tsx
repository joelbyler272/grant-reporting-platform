import Link from "next/link"
import { FileText, Plus } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Reports"
        actions={
          <Button render={<Link href="/reports/new" />}>
              <Plus className="size-4" />
              Generate Report
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No reports yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Reports are generated from your program data and funder
              templates. Set up your programs, funders, and grants first, then
              generate your first report.
            </p>
            <Button className="mt-6" render={<Link href="/reports/new" />}>
                <Plus className="size-4" />
                Generate Your First Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
