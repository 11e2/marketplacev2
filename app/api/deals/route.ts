import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { createDealSchema } from "@/lib/validation"
import { escrowHold } from "@/lib/escrow"

const listQuery = z.object({
  role: z.enum(["brand", "creator"]).optional(),
  status: z
    .enum(["NEGOTIATING", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "APPROVED", "DISPUTED", "COMPLETED", "CANCELLED"])
    .optional(),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const { role, status } = listQuery.parse(Object.fromEntries(url.searchParams.entries()))

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    let q = supabase
      .from("deals")
      .select(
        "id, campaign_id, brand_user_id, creator_user_id, status, deliverables, agreed_rate, rate_type, escrow_amount, escrow_status, deadline, created_at, completed_at, campaign:campaigns!deals_campaign_id_fkey(id, title, type, channels), brand:profiles!deals_brand_user_id_fkey(id, name, avatar_url), creator:profiles!deals_creator_user_id_fkey(id, name, avatar_url)",
      )
      .order("created_at", { ascending: false })

    if (role === "brand") q = q.eq("brand_user_id", user.id)
    else if (role === "creator") q = q.eq("creator_user_id", user.id)
    else q = q.or(`brand_user_id.eq.${user.id},creator_user_id.eq.${user.id}`)

    if (status) q = q.eq("status", status)

    const { data, error } = await q
    if (error) throw new ApiError("INTERNAL", error.message)
    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const input = createDealSchema.parse(await request.json())

    let campaignId: string | null = input.campaignId ?? null
    let creatorUserId: string | null = input.creatorUserId ?? null

    if (input.applicationId) {
      const { data: app } = await supabase
        .from("campaign_applications")
        .select("id, campaign_id, creator_user_id, status, campaigns:campaigns!campaign_applications_campaign_id_fkey(brand_user_id)")
        .eq("id", input.applicationId)
        .maybeSingle()
      if (!app) throw new ApiError("NOT_FOUND", "Application not found")
      const owner = (app as unknown as { campaigns: { brand_user_id: string } | null }).campaigns?.brand_user_id
      if (owner !== user.id) throw new ApiError("FORBIDDEN", "Not your campaign")
      if (app.status !== "PENDING") throw new ApiError("BAD_REQUEST", "Application already reviewed")
      campaignId = app.campaign_id
      creatorUserId = app.creator_user_id
    }

    if (!creatorUserId) throw new ApiError("BAD_REQUEST", "creatorUserId or applicationId required")

    // Verify the caller is a brand
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || (profile.role !== "BRAND" && profile.role !== "ADMIN")) {
      throw new ApiError("FORBIDDEN", "Only brands can create deals")
    }

    // Check sufficient balance before insert
    const { data: balance } = await supabase
      .from("balances")
      .select("available")
      .eq("user_id", user.id)
      .maybeSingle()
    if (Number(balance?.available ?? 0) < input.agreedRate) {
      throw new ApiError("BAD_REQUEST", "Insufficient balance to fund escrow")
    }

    const svc = createServiceSupabase()
    const { data: deal, error } = await svc
      .from("deals")
      .insert({
        campaign_id: campaignId,
        brand_user_id: user.id,
        creator_user_id: creatorUserId,
        status: "NEGOTIATING",
        deliverables: input.deliverables,
        agreed_rate: input.agreedRate,
        rate_type: input.rateType,
        deadline: input.deadline ?? null,
      })
      .select("id")
      .single()
    if (error || !deal) throw new ApiError("INTERNAL", error?.message ?? "Failed to create deal")

    await escrowHold(user.id, deal.id, input.agreedRate)

    if (input.applicationId) {
      await svc
        .from("campaign_applications")
        .update({ status: "ACCEPTED", reviewed_at: new Date().toISOString() })
        .eq("id", input.applicationId)
    }

    return NextResponse.json({ id: deal.id }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
