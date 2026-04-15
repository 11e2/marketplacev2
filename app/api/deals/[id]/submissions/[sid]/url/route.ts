import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const SIGNED_URL_TTL_SECONDS = 300
const BUCKET = "submissions"

function extractPathFromUrl(url: string): string | null {
  // Regex fallback for rows that predate the video_path column.
  const match = url.match(/\/object\/(?:public|sign)\/submissions\/([^?]+)/)
  return match?.[1] ?? null
}

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
      .select("id, video_url, video_path, processed_video_url, processed_video_path")
      .eq("id", sid)
      .eq("deal_id", id)
      .maybeSingle()
    if (!sub) throw new ApiError("NOT_FOUND", "Submission not found")

    // Prefer the dedicated path columns; fall back to parsing the URL for legacy rows.
    const path =
      sub.processed_video_path ??
      sub.video_path ??
      (sub.processed_video_url ? extractPathFromUrl(sub.processed_video_url) : null) ??
      (sub.video_url ? extractPathFromUrl(sub.video_url) : null)

    if (!path) throw new ApiError("NOT_FOUND", "No video on submission")

    const svc = createServiceSupabase()
    const { data, error } = await svc.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to sign URL")

    return NextResponse.json({ url: data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS })
  } catch (err) {
    return handleApiError(err)
  }
}
