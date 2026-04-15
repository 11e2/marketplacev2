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

function isUrl(v: string) {
  if (!v) return true
  try {
    new URL(v)
    return true
  } catch {
    return false
  }
}

export function SubmissionModal({
  open,
  onOpenChange,
  dealId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  dealId: string
  onCreated?: () => void
}) {
  const [platformPostUrl, setPlatformPostUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [contentUrl, setContentUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const inputCls =
    "w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"

  async function submit() {
    if (!platformPostUrl.trim() && !videoUrl.trim() && !contentUrl.trim()) {
      toast.error("Provide at least one link")
      return
    }
    if (!isUrl(platformPostUrl.trim()) || !isUrl(videoUrl.trim()) || !isUrl(contentUrl.trim())) {
      toast.error("Links must be valid URLs")
      return
    }
    setSubmitting(true)
    try {
      const r = await fetch(`/api/deals/${dealId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformPostUrl: platformPostUrl.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          contentUrl: contentUrl.trim() || undefined,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error?.message || "Failed to submit")
      toast.success("Submission delivered")
      onOpenChange(false)
      setPlatformPostUrl("")
      setVideoUrl("")
      setContentUrl("")
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
          <DialogTitle className="text-[#E2E8F0]">Submit deliverable</DialogTitle>
          <DialogDescription className="text-[#8892A8]">
            Share the link to your published content. The deal moves to DELIVERED on submit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Platform post URL</Label>
            <input
              type="url"
              value={platformPostUrl}
              onChange={(e) => setPlatformPostUrl(e.target.value)}
              placeholder="https://tiktok.com/@you/video/..."
              className={inputCls}
              disabled={submitting}
            />
          </div>
          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Video file URL (optional)</Label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
              disabled={submitting}
            />
          </div>
          <div>
            <Label className="text-[#E2E8F0] text-sm mb-1.5 block">Other content URL (optional)</Label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
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
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
