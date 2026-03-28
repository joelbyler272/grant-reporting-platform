"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SubmissionDialogProps {
  reportId: string
  onSubmitted: () => void
  children: React.ReactNode
}

export function SubmissionDialog({
  reportId,
  onSubmitted,
  children,
}: SubmissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionDate, setSubmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [submissionMethod, setSubmissionMethod] = useState("email")
  const [notes, setNotes] = useState("")

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "submitted",
          submitted_at: submissionDate,
          submission_method: submissionMethod,
          submission_notes: notes || null,
        }),
      })

      if (res.ok) {
        setOpen(false)
        onSubmitted()
      }
    } catch (err) {
      console.error("Failed to mark as submitted:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Submitted</DialogTitle>
          <DialogDescription>
            Record the submission details for this report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission-date">Submission Date</Label>
            <Input
              id="submission-date"
              type="date"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Submission Method</Label>
            <Select
              value={submissionMethod}
              onValueChange={(v) => setSubmissionMethod(v ?? "email")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="portal">Online Portal</SelectItem>
                <SelectItem value="mail">Physical Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submission-notes">Notes (optional)</Label>
            <Textarea
              id="submission-notes"
              placeholder="Any additional notes about the submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Mark as Submitted
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
