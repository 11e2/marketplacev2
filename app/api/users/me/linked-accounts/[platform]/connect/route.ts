import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { platformEnum } from "@/lib/validation"

// In production this redirects to the platform's OAuth consent URL built from
// env credentials and a CSRF-protected state param. In dev we redirect back to
// the local callback with a simulated code so the flow works end-to-end.
// TODO(oauth): replace with real provider URLs for TIKTOK, INSTAGRAM, YOUTUBE, TWITTER, DISCORD, TWITCH.
export async function GET(request: Request, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const { platform: raw } = await params
    const platform = platformEnum.parse(raw.toUpperCase())

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const url = new URL(request.url)
    const origin = url.origin
    const callback = `${origin}/api/users/me/linked-accounts/${platform.toLowerCase()}/callback?code=dev&state=dev`

    return NextResponse.redirect(callback)
  } catch (err) {
    return handleApiError(err)
  }
}
