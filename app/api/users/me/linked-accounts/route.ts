import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const deleteQuery = z.object({ id: z.string().uuid() })

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data, error } = await supabase
      .from("linked_accounts")
      .select("id, platform, platform_user_id, platform_username, followers, avg_views, engagement_rate, is_verified, last_synced_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (error) throw new ApiError("INTERNAL", error.message)
    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const { id } = deleteQuery.parse(Object.fromEntries(url.searchParams.entries()))

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { error } = await supabase.from("linked_accounts").delete().eq("id", id).eq("user_id", user.id)
    if (error) throw new ApiError("INTERNAL", error.message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
