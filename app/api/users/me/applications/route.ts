import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const querySchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"]).optional(),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const { status } = querySchema.parse(Object.fromEntries(url.searchParams.entries()))

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    let q = supabase
      .from("campaign_applications")
      .select(
        "id, status, message, applied_at, campaign:campaigns!campaign_applications_campaign_id_fkey(id, title, type, channels, accent_color, owner:profiles!campaigns_brand_user_id_fkey(name, avatar_url))",
      )
      .eq("creator_user_id", user.id)
      .order("applied_at", { ascending: false })

    if (status) q = q.eq("status", status)

    const { data, error } = await q
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    return handleApiError(err)
  }
}
