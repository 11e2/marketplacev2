"use client"

import { useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Variant = "default" | "destructive"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  promptLabel,
  promptPlaceholder,
  promptMaxLength = 2000,
  requirePrompt = false,
  onConfirm,
  children,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  promptLabel?: string
  promptPlaceholder?: string
  promptMaxLength?: number
  requirePrompt?: boolean
  onConfirm: (note?: string) => void | Promise<void>
  children?: ReactNode
}) {
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    if (requirePrompt && !note.trim()) return
    setBusy(true)
    try {
      await onConfirm(promptLabel ? note.trim() || undefined : undefined)
      setNote("")
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  const confirmClass =
    variant === "destructive"
      ? "bg-[#FF6B6B] hover:bg-[#e55a5a] text-white"
      : "bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white"

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) onOpenChange(v)
      }}
    >
      <AlertDialogContent className="bg-[#131825] border-[#2A3050] text-[#E2E8F0] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#E2E8F0]">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-[#8892A8]">{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children}

        {promptLabel && (
          <div className="space-y-1.5">
            <Label className="text-[#E2E8F0] text-sm">{promptLabel}</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, promptMaxLength))}
              placeholder={promptPlaceholder}
              rows={4}
              className="bg-[#0B0F1A] border-[#2A3050] text-[#E2E8F0] placeholder:text-[#8892A8] resize-none"
              disabled={busy}
            />
            <div className="flex justify-end text-xs text-[#8892A8] font-mono">
              {note.length} / {promptMaxLength}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || (requirePrompt && !note.trim())}
            className={`text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60 inline-flex items-center gap-2 ${confirmClass}`}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {busy ? "Working..." : confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
