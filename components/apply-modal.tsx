"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const MAX = 1000

export function ApplyModal({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
  onApplied,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  campaignId: string
  campaignTitle: string
  onApplied?: () => void
}) {
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = json?.error?.message || "Failed to apply"
        if (res.status === 409) {
          toast.info("You have already applied to this campaign")
          onOpenChange(false)
          onApplied?.()
          return
        }
        toast.error(msg)
        return
      }
      toast.success("Application submitted")
      onOpenChange(false)
      setMessage("")
      onApplied?.()
    } catch {
      toast.error("Network error. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131825] border-[#2A3050] text-[#E2E8F0] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#E2E8F0]">Apply to campaign</DialogTitle>
          <DialogDescription className="text-[#8892A8]">
            {campaignTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="apply-message" className="text-[#E2E8F0] text-sm">
            Message to brand (optional)
          </Label>
          <Textarea
            id="apply-message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
            placeholder="Tell the brand why you're a great fit, your audience, or ideas for this campaign."
            rows={6}
            className="bg-[#0B0F1A] border-[#2A3050] text-[#E2E8F0] placeholder:text-[#8892A8] resize-none"
            disabled={submitting}
          />
          <div className="flex justify-end text-xs text-[#8892A8] font-mono">
            {message.length} / {MAX}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
