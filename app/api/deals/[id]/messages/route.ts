import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { messageSchema } from "@/lib/validation"

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  before: z.string().optional(),
})

async function participantContext(dealId: string) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

  const { data: deal } = await supabase
    .from("deals")
    .select("id, brand_user_id, creator_user_id, campaign_id")
    .eq("id", dealId)
    .maybeSingle()
  if (!deal) throw new ApiError("NOT_FOUND", "Deal not found")
  if (deal.brand_user_id !== user.id && deal.creator_user_id !== user.id) {
    throw new ApiError("FORBIDDEN", "Not a deal participant")
  }

  let { data: convo } = await supabase
    .from("conversations")
    .select("id")
    .eq("deal_id", dealId)
    .maybeSingle()

  if (!convo) {
    const svc = createServiceSupabase()
    const { data: created, error } = await svc
      .from("conversations")
      .insert({
        deal_id: deal.id,
        campaign_id: deal.campaign_id,
        brand_user_id: deal.brand_user_id,
        creator_user_id: deal.creator_user_id,
      })
      .select("id")
      .single()
    if (error) {
      if (error.code === "23505") {
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .eq("deal_id", dealId)
          .single()
        if (!existing) throw new ApiError("INTERNAL", "Failed to resolve conversation")
        convo = existing
      } else {
        throw new ApiError("INTERNAL", error.message)
      }
    } else {
      convo = created
    }
  }

  return { supabase, user, deal, conversationId: convo.id as string }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const { limit, before } = listQuery.parse(Object.fromEntries(url.searchParams.entries()))

    const { supabase, user, conversationId } = await participantContext(id)

    let q = supabase
      .from("messages")
      .select("id, sender_id, content, is_proposal, proposal_id, read_at, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (before) q = q.lt("created_at", before)

    const { data, error } = await q
    if (error) throw new ApiError("INTERNAL", error.message)

    const messages = (data ?? []).slice().reverse()

    // Mark messages from the other party as read
    const toMark = messages.filter((m) => m.sender_id !== user.id && !m.read_at).map((m) => m.id)
    if (toMark.length) {
      const svc = createServiceSupabase()
      const { error: markErr } = await svc.from("messages").update({ read_at: new Date().toISOString() }).in("id", toMark)
      if (markErr) console.error("read-receipt update failed:", markErr.message)
    }

    return NextResponse.json({ conversationId, messages })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { supabase, user, conversationId } = await participantContext(id)
    const input = messageSchema.parse(await request.json())

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: input.content,
        proposal_id: input.proposalId ?? null,
        is_proposal: !!input.proposalId,
      })
      .select("id, created_at")
      .single()
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to send message")

    const svc = createServiceSupabase()
    await svc.from("conversations").update({ last_message_at: data.created_at }).eq("id", conversationId)

    return NextResponse.json({ id: data.id, createdAt: data.created_at }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
