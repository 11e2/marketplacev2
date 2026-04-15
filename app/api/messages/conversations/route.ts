import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data, error } = await supabase
      .from("conversations")
      .select(
        "id, deal_id, campaign_id, brand_user_id, creator_user_id, last_message_at, created_at, brand:profiles!conversations_brand_user_id_fkey(id, name, avatar_url), creator:profiles!conversations_creator_user_id_fkey(id, name, avatar_url), campaign:campaigns!conversations_campaign_id_fkey(id, title, channels)",
      )
      .or(`brand_user_id.eq.${user.id},creator_user_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false })
    if (error) throw new ApiError("INTERNAL", error.message)

    const convos = data ?? []
    const ids = convos.map((c) => c.id)
    const brandIds = Array.from(new Set(convos.map((c) => c.brand_user_id).filter(Boolean))) as string[]
    const creatorIds = Array.from(new Set(convos.map((c) => c.creator_user_id).filter(Boolean))) as string[]

    const svc = createServiceSupabase()
    const unread = new Map<string, number>()
    const [{ data: unreadRows }, { data: bp }, { data: cp }, { data: links }] = await Promise.all([
      ids.length
        ? supabase.rpc("conversation_unread_counts", { p_user_id: user.id, p_conv_ids: ids })
        : Promise.resolve({ data: [] as { conversation_id: string; unread_count: number }[] }),
      brandIds.length
        ? supabase.from("brand_profiles").select("user_id, is_verified").in("user_id", brandIds)
        : Promise.resolve({ data: [] as { user_id: string; is_verified: boolean }[] }),
      creatorIds.length
        ? supabase.from("creator_profiles").select("user_id, is_verified").in("user_id", creatorIds)
        : Promise.resolve({ data: [] as { user_id: string; is_verified: boolean }[] }),
      creatorIds.length
        ? svc.from("linked_accounts").select("user_id, is_verified").in("user_id", creatorIds).eq("is_verified", true)
        : Promise.resolve({ data: [] as { user_id: string; is_verified: boolean }[] }),
    ])
    for (const row of unreadRows ?? []) {
      unread.set(row.conversation_id, row.unread_count)
    }
    const brandVerified = new Map((bp ?? []).map((r) => [r.user_id, !!r.is_verified]))
    const creatorVerified = new Map((cp ?? []).map((r) => [r.user_id, !!r.is_verified]))
    const creatorHasLink = new Set((links ?? []).map((r) => r.user_id))

    return NextResponse.json({
      items: convos.map((c) => {
        const creatorLinkVerified = creatorHasLink.has(c.creator_user_id)
        return {
          ...c,
          unread_count: unread.get(c.id) ?? 0,
          brand_is_verified: brandVerified.get(c.brand_user_id) ?? false,
          creator_is_verified: (creatorVerified.get(c.creator_user_id) ?? false) || creatorLinkVerified,
          creator_has_verified_link: creatorLinkVerified,
        }
      }),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
