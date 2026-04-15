import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
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
    const unread = new Map<string, number>()
    if (ids.length) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("conversation_id, sender_id, read_at")
        .in("conversation_id", ids)
      for (const m of msgs ?? []) {
        if (m.sender_id !== user.id && !m.read_at) {
          unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1)
        }
      }
    }

    return NextResponse.json({
      items: convos.map((c) => ({ ...c, unread_count: unread.get(c.id) ?? 0 })),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
