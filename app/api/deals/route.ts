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

    const rows = data ?? []
    const brandIds = Array.from(new Set(rows.map((r) => (r as { brand_user_id?: string }).brand_user_id).filter(Boolean))) as string[]
    const creatorIds = Array.from(new Set(rows.map((r) => (r as { creator_user_id?: string }).creator_user_id).filter(Boolean))) as string[]
    const svc = createServiceSupabase()
    const [bp, cp, links] = await Promise.all([
      brandIds.length
        ? supabase.from("brand_profiles").select("user_id, is_verified").in("user_id", brandIds)
        : Promise.resolve({ data: [] as { user_id: string; is_verified: boolean }[] }),
      creatorIds.length
        ? supabase.from("creator_profiles").select("user_id, is_verified").in("user_id", creatorIds)
        : Promise.resolve({ data: [] as { user_id: string; is_verified: boolean }[] }),
      creatorIds.length
        ? svc.from("linked_accounts").select("user_id, is_verified").in("user_id", creatorIds).eq("is_verified", true)
        : Promise.resolve({ data: [] as { user_id: string; is_verified: boolean }[] }),
    ])
    const brandVerified = new Map((bp.data ?? []).map((r) => [r.user_id, !!r.is_verified]))
    const creatorVerified = new Map((cp.data ?? []).map((r) => [r.user_id, !!r.is_verified]))
    const creatorHasLink = new Set((links.data ?? []).map((r) => r.user_id))

    const items = rows.map((r) => {
      const brandId = (r as { brand_user_id: string }).brand_user_id
      const creatorId = (r as { creator_user_id: string }).creator_user_id
      const creatorProfileVerified = creatorVerified.get(creatorId) ?? false
      const creatorLinkVerified = creatorHasLink.has(creatorId)
      return {
        ...r,
        brand_is_verified: brandVerified.get(brandId) ?? false,
        creator_is_verified: creatorProfileVerified || creatorLinkVerified,
        creator_has_verified_link: creatorLinkVerified,
      }
    })

    return NextResponse.json({ items })
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

    try {
      await escrowHold(user.id, deal.id, input.agreedRate)
    } catch (escrowErr) {
      await svc.from("deals").delete().eq("id", deal.id)
      throw escrowErr
    }

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
