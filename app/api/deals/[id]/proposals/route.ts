import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { proposalSchema } from "@/lib/validation"

async function assertParticipant(id: string) {
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
  return { supabase, user, deal }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { supabase } = await assertParticipant(id)
    const { data, error } = await supabase
      .from("deal_proposals")
      .select("id, from_user_id, proposed_rate, deliverables, timeline, message, status, created_at")
      .eq("deal_id", id)
      .order("created_at", { ascending: true })
    if (error) throw new ApiError("INTERNAL", error.message)
    return NextResponse.json({ proposals: data ?? [] })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { supabase, user } = await assertParticipant(id)
    const input = proposalSchema.parse(await request.json())

    const { data, error } = await supabase
      .from("deal_proposals")
      .insert({
        deal_id: id,
        from_user_id: user.id,
        proposed_rate: input.proposedRate,
        deliverables: input.deliverables,
        timeline: input.timeline ?? null,
        message: input.message ?? null,
      })
      .select("id")
      .single()
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to create proposal")

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
