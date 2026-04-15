import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const SIGNED_URL_TTL_SECONDS = 300

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; sid: string }> }) {
  try {
    const { id, sid } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: deal } = await supabase
      .from("deals")
      .select("brand_user_id, creator_user_id")
      .eq("id", id)
      .maybeSingle()
    if (!deal) throw new ApiError("NOT_FOUND", "Deal not found")
    if (deal.brand_user_id !== user.id && deal.creator_user_id !== user.id) {
      throw new ApiError("FORBIDDEN", "Not a deal participant")
    }

    const { data: sub } = await supabase
      .from("submissions")
      .select("id, video_url, processed_video_url")
      .eq("id", sid)
      .eq("deal_id", id)
      .maybeSingle()
    if (!sub) throw new ApiError("NOT_FOUND", "Submission not found")

    const rawUrl = sub.processed_video_url ?? sub.video_url
    if (!rawUrl) throw new ApiError("NOT_FOUND", "No video on submission")

    // The stored URL may be either a full Supabase URL or a bucket path.
    // Extract the bucket + path for the submissions bucket.
    const match = rawUrl.match(/\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/)
    const bucket = match?.[1] ?? "submissions"
    const path = match?.[2] ?? rawUrl.replace(/^submissions\//, "")

    const svc = createServiceSupabase()
    const { data, error } = await svc.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to sign URL")

    return NextResponse.json({ url: data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS })
  } catch (err) {
    return handleApiError(err)
  }
}
