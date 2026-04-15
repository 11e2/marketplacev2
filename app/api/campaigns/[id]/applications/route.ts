import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { applicationsListQuerySchema } from "@/lib/validation"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const { status } = applicationsListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()))

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

    let q = supabase
      .from("campaign_applications")
      .select(
        "id, status, message, applied_at, reviewed_at, creator_user_id, creator:profiles!campaign_applications_creator_user_id_fkey(id, name, avatar_url), creator_detail:creator_profiles!creator_profiles_user_id_fkey(bio, niches, total_reach, avg_rating, avg_engagement, is_verified)",
      )
      .eq("campaign_id", id)
      .order("applied_at", { ascending: false })

    if (status) q = q.eq("status", status)

    const { data, error } = await q
    if (error) throw new ApiError("INTERNAL", error.message)

    const apps = data ?? []
    const creatorIds = Array.from(new Set(apps.map((a) => a.creator_user_id).filter(Boolean))) as string[]

    let followersByCreator = new Map<string, { totalFollowers: number; platforms: number }>()
    if (creatorIds.length) {
      const serviceSupabase = createServiceSupabase()
      const { data: linked } = await serviceSupabase
        .from("linked_accounts")
        .select("user_id, followers")
        .in("user_id", creatorIds)
      for (const row of linked ?? []) {
        const entry = followersByCreator.get(row.user_id) ?? { totalFollowers: 0, platforms: 0 }
        entry.totalFollowers += Number(row.followers ?? 0)
        entry.platforms += 1
        followersByCreator.set(row.user_id, entry)
      }
    }

    const applications = apps.map((a) => ({
      ...a,
      follower_totals: followersByCreator.get(a.creator_user_id) ?? { totalFollowers: 0, platforms: 0 },
    }))

    return NextResponse.json({ applications })
  } catch (err) {
    return handleApiError(err)
  }
}
