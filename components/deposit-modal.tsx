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
import { Label } from "@/components/ui/label"

const PRESETS = [100, 500, 1000, 5000]

export function DepositModal({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onDone?: () => void
}) {
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    const n = Number(amount)
    if (!n || n <= 0) {
      toast.error("Enter a positive amount")
      return
    }
    setSubmitting(true)
    try {
      const r = await fetch("/api/users/me/balance/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error?.message || "Deposit failed")
      toast.success(`Deposited $${n.toLocaleString()}`)
      onOpenChange(false)
      setAmount("")
      onDone?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131825] border-[#2A3050] text-[#E2E8F0] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E2E8F0]">Deposit funds</DialogTitle>
          <DialogDescription className="text-[#8892A8]">
            Dev mode credits your balance instantly. In production this routes through Stripe Checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="flex-1 text-xs font-semibold px-2 py-2 rounded-lg border border-[#2A3050] hover:border-[#6C5CE7] text-[#E2E8F0] transition-colors"
                disabled={submitting}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>

          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Amount (USD)</Label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
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
            {submitting ? "Processing..." : "Deposit"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
