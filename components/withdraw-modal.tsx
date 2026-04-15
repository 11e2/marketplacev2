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

const MIN = 50

export function WithdrawModal({
  open,
  onOpenChange,
  available,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  available: number
  onDone?: () => void
}) {
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    const n = Number(amount)
    if (!n || n < MIN) {
      toast.error(`Minimum withdrawal is $${MIN}`)
      return
    }
    if (n > available) {
      toast.error("Amount exceeds available balance")
      return
    }
    setSubmitting(true)
    try {
      const r = await fetch("/api/users/me/balance/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error?.message || "Withdrawal failed")
      toast.success(`Withdrawal initiated: $${n.toLocaleString()}`)
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
          <DialogTitle className="text-[#E2E8F0]">Withdraw funds</DialogTitle>
          <DialogDescription className="text-[#8892A8]">
            Available: ${available.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Minimum withdrawal: ${MIN}.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8892A8] font-mono">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={MIN}
              max={available}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(MIN)}
              className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg pl-7 pr-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
              disabled={submitting}
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(available.toFixed(2))}
            className="text-[11px] text-[#6C5CE7] hover:underline mt-1.5"
            disabled={submitting}
          >
            Withdraw maximum
          </button>
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
            {submitting ? "Processing..." : "Withdraw"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
