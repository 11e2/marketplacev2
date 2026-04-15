import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { reviewSchema } from "@/lib/validation"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const input = reviewSchema.parse(await request.json())

    const { data: deal } = await supabase
      .from("deals")
      .select("brand_user_id, creator_user_id, status")
      .eq("id", id)
      .maybeSingle()
    if (!deal) throw new ApiError("NOT_FOUND", "Deal not found")
    if (deal.status !== "COMPLETED") throw new ApiError("BAD_REQUEST", "Deal not completed")
    const isBrand = deal.brand_user_id === user.id
    const isCreator = deal.creator_user_id === user.id
    if (!isBrand && !isCreator) throw new ApiError("FORBIDDEN", "Not a deal participant")
    const toUserId = isBrand ? deal.creator_user_id : deal.brand_user_id

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        deal_id: id,
        from_user_id: user.id,
        to_user_id: toUserId,
        rating: input.rating,
        text: input.text ?? null,
      })
      .select("id")
      .single()
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to create review")

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
