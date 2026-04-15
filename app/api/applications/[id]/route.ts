import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const patchSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { status } = patchSchema.parse(await request.json())

    const { data: app } = await supabase
      .from("campaign_applications")
      .select("id, campaign_id, campaigns:campaigns!campaign_applications_campaign_id_fkey(brand_user_id)")
      .eq("id", id)
      .maybeSingle()
    if (!app) throw new ApiError("NOT_FOUND", "Application not found")

    const campaigns = (app as unknown as { campaigns: { brand_user_id: string } | { brand_user_id: string }[] | null })
      .campaigns
    const owner = Array.isArray(campaigns) ? campaigns[0]?.brand_user_id : campaigns?.brand_user_id
    if (owner !== user.id) throw new ApiError("FORBIDDEN", "Not your campaign")

    const { error } = await supabase
      .from("campaign_applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
