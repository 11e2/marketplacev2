import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { dealTransition } from "@/lib/validation"
import { escrowRefund, escrowRelease } from "@/lib/escrow"

type DealStatus = "NEGOTIATING" | "ACCEPTED" | "IN_PROGRESS" | "DELIVERED" | "APPROVED" | "DISPUTED" | "COMPLETED" | "CANCELLED"

const BRAND_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  NEGOTIATING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["CANCELLED"],
  DELIVERED: ["APPROVED", "DISPUTED"],
  APPROVED: ["COMPLETED"],
  DISPUTED: ["APPROVED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}

const CREATOR_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  NEGOTIATING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["DELIVERED"],
  DELIVERED: [],
  APPROVED: [],
  DISPUTED: [],
  COMPLETED: [],
  CANCELLED: [],
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data, error } = await supabase
      .from("deals")
      .select(
        "id, campaign_id, brand_user_id, creator_user_id, status, deliverables, agreed_rate, rate_type, escrow_amount, escrow_status, deadline, created_at, completed_at, campaign:campaigns!deals_campaign_id_fkey(id, title, type, channels), brand:profiles!deals_brand_user_id_fkey(id, name, avatar_url), creator:profiles!deals_creator_user_id_fkey(id, name, avatar_url)",
      )
      .eq("id", id)
      .maybeSingle()
    if (error) throw new ApiError("INTERNAL", error.message)
    if (!data) throw new ApiError("NOT_FOUND", "Deal not found")

    const [{ data: bp }, { data: cp }] = await Promise.all([
      supabase.from("brand_profiles").select("is_verified").eq("user_id", data.brand_user_id).maybeSingle(),
      supabase.from("creator_profiles").select("is_verified").eq("user_id", data.creator_user_id).maybeSingle(),
    ])

    return NextResponse.json({
      deal: {
        ...data,
        brand_is_verified: !!bp?.is_verified,
        creator_is_verified: !!cp?.is_verified,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = dealTransition.parse(await request.json())

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: deal } = await supabase
      .from("deals")
      .select("id, status, brand_user_id, creator_user_id")
      .eq("id", id)
      .maybeSingle()
    if (!deal) throw new ApiError("NOT_FOUND", "Deal not found")

    const isBrand = deal.brand_user_id === user.id
    const isCreator = deal.creator_user_id === user.id
    if (!isBrand && !isCreator) throw new ApiError("FORBIDDEN", "Not a deal participant")

    const allowed = (isBrand ? BRAND_TRANSITIONS : CREATOR_TRANSITIONS)[deal.status as DealStatus] ?? []
    if (!allowed.includes(status)) {
      throw new ApiError("BAD_REQUEST", `Cannot transition ${deal.status} -> ${status} as ${isBrand ? "brand" : "creator"}`)
    }

    const svc = createServiceSupabase()

    if (status === "COMPLETED") {
      await escrowRelease(id)
    } else if (status === "CANCELLED") {
      await escrowRefund(id)
    } else {
      const { error } = await svc.from("deals").update({ status }).eq("id", id)
      if (error) throw new ApiError("INTERNAL", error.message)
    }

    return NextResponse.json({ ok: true, status })
  } catch (err) {
    return handleApiError(err)
  }
}
