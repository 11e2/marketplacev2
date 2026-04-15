import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { platformEnum } from "@/lib/validation"

type Platform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "TWITTER" | "DISCORD" | "TWITCH" | "PODCAST"

// Dev simulation: seed realistic-looking metrics so the UI has something to show.
// TODO(oauth): validate the `state` query param against the value the connect
// handler stored in a cookie (CSRF defense — reject if missing or mismatched),
// exchange `code` for tokens, call the platform API for identity + metrics,
// encrypt tokens at rest, schedule the daily metric sync job.
function fakeStats(platform: Platform) {
  const base = Math.floor(Math.random() * 80_000) + 10_000
  return {
    platform_user_id: `${platform.toLowerCase()}_${Math.random().toString(36).slice(2, 10)}`,
    platform_username: `creator_${Math.random().toString(36).slice(2, 8)}`,
    followers: base,
    avg_views: Math.floor(base * (0.1 + Math.random() * 0.4)),
    engagement_rate: Number((2 + Math.random() * 6).toFixed(2)),
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const { platform: raw } = await params
    const platform = platformEnum.parse(raw.toUpperCase()) as Platform

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    if (!code) throw new ApiError("BAD_REQUEST", "Missing code")

    const stats = fakeStats(platform)

    const { data: existing } = await supabase
      .from("linked_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .maybeSingle()

    const row = {
      user_id: user.id,
      platform,
      platform_user_id: stats.platform_user_id,
      platform_username: stats.platform_username,
      access_token: `dev-access-${code}`,
      refresh_token: `dev-refresh-${code}`,
      token_expires_at: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toISOString(),
      followers: stats.followers,
      avg_views: stats.avg_views,
      engagement_rate: stats.engagement_rate,
      is_verified: true,
      last_synced_at: new Date().toISOString(),
    }

    if (existing) {
      await supabase.from("linked_accounts").update(row).eq("id", existing.id)
    } else {
      await supabase.from("linked_accounts").insert(row)
    }

    return NextResponse.redirect(`${url.origin}/linked-accounts?connected=${platform.toLowerCase()}`)
  } catch (err) {
    return handleApiError(err)
  }
}
