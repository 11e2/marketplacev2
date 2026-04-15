import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { submissionSchema } from "@/lib/validation"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data, error } = await supabase
      .from("submissions")
      .select("id, deal_id, creator_user_id, video_url, processed_video_url, content_url, platform_post_url, views, engagement_rate, earnings, status, submitted_at, reviewed_at")
      .eq("deal_id", id)
      .order("submitted_at", { ascending: false })
    if (error) throw new ApiError("INTERNAL", error.message)

    // video_url / processed_video_url are paths in the private `submissions`
    // bucket. Brands cannot read them directly (owner-folder RLS). The frontend
    // should call GET /api/deals/[id]/submissions/[sid]/url to obtain a
    // short-lived signed download URL for playback.
    const submissions = (data ?? []).map((s) => ({
      ...s,
      video_stream_path: `/api/deals/${id}/submissions/${s.id}/url`,
    }))
    return NextResponse.json({ submissions })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const input = submissionSchema.parse(await request.json())

    const { data: deal } = await supabase
      .from("deals")
      .select("creator_user_id, status")
      .eq("id", id)
      .maybeSingle()
    if (!deal) throw new ApiError("NOT_FOUND", "Deal not found")
    if (deal.creator_user_id !== user.id) throw new ApiError("FORBIDDEN", "Not your deal")

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        deal_id: id,
        creator_user_id: user.id,
        video_url: input.videoUrl ?? null,
        processed_video_url: input.processedVideoUrl ?? null,
        content_url: input.contentUrl ?? null,
        platform_post_url: input.platformPostUrl ?? null,
        status: "SUBMITTED",
      })
      .select("id")
      .single()
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to create submission")

    const svc = createServiceSupabase()
    await svc.from("deals").update({ status: "DELIVERED" }).eq("id", id)

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
