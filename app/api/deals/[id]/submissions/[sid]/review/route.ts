import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { escrowRelease } from "@/lib/escrow"

const bodySchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().max(2000).optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  try {
    const { id, sid } = await params
    const { decision, notes } = bodySchema.parse(await request.json())

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
      await svc
        .from("messages")
        .insert({
          conversation_id: (
            await svc.from("conversations").select("id").eq("deal_id", id).maybeSingle()
          ).data?.id,
          sender_id: user.id,
          content: `[review] ${decision}: ${notes}`,
        })
        .then(() => {})
    }

    if (decision === "APPROVED") {
      await escrowRelease(id)
    }

    return NextResponse.json({ ok: true, decision })
  } catch (err) {
    return handleApiError(err)
  }
}
