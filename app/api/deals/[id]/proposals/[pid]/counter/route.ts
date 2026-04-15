import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { proposalSchema } from "@/lib/validation"

export async function POST(request: Request, { params }: { params: Promise<{ id: string; pid: string }> }) {
  try {
    const { id, pid } = await params
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
    if (deal.brand_user_id !== user.id && deal.creator_user_id !== user.id) {
      throw new ApiError("FORBIDDEN", "Not a deal participant")
    }
    if (deal.status !== "NEGOTIATING") {
      throw new ApiError("BAD_REQUEST", `Cannot counter proposals while deal is ${deal.status}`)
    }

    const { data: original } = await supabase
      .from("deal_proposals")
      .select("id, from_user_id, status")
      .eq("id", pid)
      .eq("deal_id", id)
      .maybeSingle()
    if (!original) throw new ApiError("NOT_FOUND", "Proposal not found")
    if (original.status !== "PENDING") throw new ApiError("BAD_REQUEST", "Proposal already resolved")
    if (original.from_user_id === user.id) {
      throw new ApiError("FORBIDDEN", "Cannot counter your own proposal")
    }

    const input = proposalSchema.parse(await request.json())

    const svc = createServiceSupabase()
    const { error: markErr } = await svc
      .from("deal_proposals")
      .update({ status: "COUNTERED" })
      .eq("id", pid)
    if (markErr) throw new ApiError("INTERNAL", markErr.message)

    const { data: created, error: insErr } = await svc
      .from("deal_proposals")
      .insert({
        deal_id: id,
        from_user_id: user.id,
        proposed_rate: input.proposedRate,
        deliverables: input.deliverables,
        timeline: input.timeline ?? null,
        message: input.message ?? null,
      })
      .select("id")
      .single()
    if (insErr || !created) throw new ApiError("INTERNAL", insErr?.message ?? "Failed to create counter")

    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
