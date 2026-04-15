import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; pid: string }> }) {
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
      throw new ApiError("BAD_REQUEST", `Cannot decline proposals while deal is ${deal.status}`)
    }

    const { data: proposal } = await supabase
      .from("deal_proposals")
      .select("id, from_user_id, status")
      .eq("id", pid)
      .eq("deal_id", id)
      .maybeSingle()
    if (!proposal) throw new ApiError("NOT_FOUND", "Proposal not found")
    if (proposal.status !== "PENDING") throw new ApiError("BAD_REQUEST", "Proposal already resolved")
    if (proposal.from_user_id === user.id) {
      throw new ApiError("FORBIDDEN", "Cannot decline your own proposal")
    }

    const svc = createServiceSupabase()
    const { error } = await svc.from("deal_proposals").update({ status: "DECLINED" }).eq("id", pid)
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
