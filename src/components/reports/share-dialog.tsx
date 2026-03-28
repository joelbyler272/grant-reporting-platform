"use client"

import { useState } from "react"
import { Mail, Send, Check } from "lucide-react"
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

interface ShareDialogProps {
  reportId: string
  children: React.ReactNode
}

export function ShareDialog({ reportId, children }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!email.trim()) return
    // Placeholder: just show success toast
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setEmail("")
      setOpen(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share for Review</DialogTitle>
          <DialogDescription>
            Send a review link to a colleague or funder contact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewer-email">Reviewer Email</Label>
            <div className="flex gap-2">
              <Input
                id="reviewer-email"
                type="email"
                placeholder="reviewer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Reviewer will be able to view and comment on this report.
          </p>
        </div>

        <DialogFooter>
          {sent ? (
            <Button disabled>
              <Check className="size-4" />
              Link Sent!
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!email.trim()}>
              <Send className="size-4" />
              Send Review Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
