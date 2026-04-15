import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { submissionReviewSchema } from "@/lib/validation"
import { escrowRelease } from "@/lib/escrow"

export async function POST(request: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  try {
    const { id, sid } = await params
    const { decision, notes } = submissionReviewSchema.parse(await request.json())

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: deal } = await supabase
      .from("deals")
      .select("brand_user_id, creator_user_id, status")
      .eq("id", id)
      .maybeSingle()
    if (!deal) throw new ApiError("NOT_FOUND", "Deal not found")
    if (deal.brand_user_id !== user.id) throw new ApiError("FORBIDDEN", "Only the brand can review submissions")
    if (deal.status !== "DELIVERED") {
      throw new ApiError("BAD_REQUEST", `Cannot review submissions while deal is ${deal.status}`)
    }

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, deal_id, status")
      .eq("id", sid)
      .eq("deal_id", id)
      .maybeSingle()
    if (!sub) throw new ApiError("NOT_FOUND", "Submission not found")
    if (sub.status === "APPROVED" || sub.status === "REJECTED") {
      throw new ApiError("BAD_REQUEST", "Submission already reviewed")
    }

    const svc = createServiceSupabase()
    const { error: sErr } = await svc
      .from("submissions")
      .update({ status: decision, reviewed_at: new Date().toISOString() })
      .eq("id", sid)
    if (sErr) throw new ApiError("INTERNAL", sErr.message)

    if (notes) {
      const { data: convo } = await svc.from("conversations").select("id").eq("deal_id", id).maybeSingle()
      if (convo?.id) {
        const { error: msgErr } = await svc.from("messages").insert({
          conversation_id: convo.id,
          sender_id: user.id,
          content: `[review] ${decision}: ${notes}`,
        })
        if (msgErr) console.error("[submission-review] failed to post review note:", msgErr.message)
      } else {
        console.warn("[submission-review] no conversation found for deal", id)
      }
    }

    if (decision === "APPROVED") {
      await escrowRelease(id)
    } else {
      // Rejection sends the deal back to IN_PROGRESS so the creator can revise.
      const { error: revertErr } = await svc.from("deals").update({ status: "IN_PROGRESS" }).eq("id", id)
      if (revertErr) throw new ApiError("INTERNAL", revertErr.message)
    }

    return NextResponse.json({ ok: true, decision })
  } catch (err) {
    return handleApiError(err)
  }
}
