"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ProposalModal({
  open,
  onOpenChange,
  dealId,
  initialRate,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  dealId: string
  initialRate?: number
  onCreated?: () => void
}) {
  const [rate, setRate] = useState("")
  const [timeline, setTimeline] = useState("")
  const [message, setMessage] = useState("")
  const [deliverables, setDeliverables] = useState<{ name: string; detail: string }[]>([{ name: "", detail: "" }])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialRate != null) setRate(String(initialRate))
  }, [open, initialRate])

  const MAX_DELIVERABLES = 10

  const inputCls =
    "w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"

  async function submit() {
    const rateNum = Number(rate)
    if (!rateNum || rateNum <= 0) {
      toast.error("Enter a positive rate")
      return
    }
    const cleanedDeliverables = deliverables.filter((d) => d.name.trim())
    setSubmitting(true)
    try {
      const r = await fetch(`/api/deals/${dealId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedRate: rateNum,
          deliverables: cleanedDeliverables.map((d) => ({ name: d.name, detail: d.detail || undefined })),
          timeline: timeline.trim() || undefined,
          message: message.trim() || undefined,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error?.message || "Failed to send proposal")
      toast.success("Proposal sent")
      onOpenChange(false)
      setRate("")
      setTimeline("")
      setMessage("")
      setDeliverables([{ name: "", detail: "" }])
      onCreated?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131825] border-[#2A3050] text-[#E2E8F0] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#E2E8F0]">New proposal</DialogTitle>
          <DialogDescription className="text-[#8892A8]">
            Propose rate, deliverables, and timeline. The other party can accept, counter, or decline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Proposed rate (USD)</Label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="200"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Timeline (optional)</Label>
            <input
              value={timeline}
              onChange={(e) => setTimeline(e.target.value.slice(0, 500))}
              placeholder="e.g. Deliver within 5 days"
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[#E2E8F0] text-sm">Deliverables</Label>
              <button
                type="button"
                onClick={() =>
                  setDeliverables((d) =>
                    d.length >= MAX_DELIVERABLES ? d : [...d, { name: "", detail: "" }],
                  )
                }
                className="text-[11px] text-[#6C5CE7] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                disabled={submitting || deliverables.length >= MAX_DELIVERABLES}
              >
                <Plus size={10} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {deliverables.map((d, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={d.name}
                      onChange={(e) =>
                        setDeliverables((prev) =>
                          prev.map((p, idx) => (idx === i ? { ...p, name: e.target.value } : p)),
                        )
                      }
                      placeholder="Name (e.g. TikTok product demo)"
                      className={inputCls}
                      disabled={submitting}
                    />
                    <input
                      value={d.detail}
                      onChange={(e) =>
                        setDeliverables((prev) =>
                          prev.map((p, idx) => (idx === i ? { ...p, detail: e.target.value } : p)),
                        )
                      }
                      placeholder="Detail (optional)"
                      className={inputCls}
                      disabled={submitting}
                    />
                  </div>
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeliverables((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="Remove deliverable"
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-[#2A3050] text-[#8892A8] hover:text-[#FF6B6B]"
                      disabled={submitting}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
              rows={4}
              placeholder="Any context for this proposal..."
              className="bg-[#0B0F1A] border-[#2A3050] text-[#E2E8F0] placeholder:text-[#8892A8] resize-none"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white disabled:opacity-60 inline-flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Sending..." : "Send proposal"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
