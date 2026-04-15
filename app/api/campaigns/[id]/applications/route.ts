import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("brand_user_id")
      .eq("id", id)
      .maybeSingle()
    if (!campaign) throw new ApiError("NOT_FOUND", "Campaign not found")
    if (campaign.brand_user_id !== user.id) throw new ApiError("FORBIDDEN", "Not your campaign")

    const { data, error } = await supabase
      .from("campaign_applications")
      .select(
        "id, status, message, applied_at, reviewed_at, creator:profiles!campaign_applications_creator_user_id_fkey(id, name, avatar_url), creator_detail:creator_profiles!creator_profiles_user_id_fkey(bio, niches, total_reach, avg_rating)",
      )
      .eq("campaign_id", id)
      .order("applied_at", { ascending: false })
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ applications: data ?? [] })
  } catch (err) {
    return handleApiError(err)
  }
}
