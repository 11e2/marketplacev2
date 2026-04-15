import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { applyToCampaignSchema } from "@/lib/validation"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const raw = await request.json().catch(() => ({}))
    const { message } = applyToCampaignSchema.parse(raw ?? {})

    const { data: campaign, error: campaignErr } = await supabase
      .from("campaigns")
      .select("id, brand_user_id, status")
      .eq("id", id)
      .maybeSingle()
    if (campaignErr) throw new ApiError("INTERNAL", campaignErr.message)
    if (!campaign) throw new ApiError("NOT_FOUND", "Campaign not found")
    if (campaign.status !== "ACTIVE") {
      throw new ApiError("BAD_REQUEST", "Campaign is not accepting applications")
    }
    if (campaign.brand_user_id === user.id) {
      throw new ApiError("FORBIDDEN", "You cannot apply to your own campaign")
    }

    const { data: existing } = await supabase
      .from("campaign_applications")
      .select("id")
      .eq("campaign_id", id)
      .eq("creator_user_id", user.id)
      .maybeSingle()
    if (existing) {
      throw new ApiError("CONFLICT", "You have already applied to this campaign")
    }

    const { data, error } = await supabase
      .from("campaign_applications")
      .insert({
        campaign_id: id,
        creator_user_id: user.id,
        message: message ?? null,
      })
      .select("id, status, applied_at")
      .single()
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ application: data }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
