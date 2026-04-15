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

    const [{ data: balance }, { data: txs }] = await Promise.all([
      supabase.from("balances").select("available, pending, currency").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("transactions")
        .select("id, type, amount, status, description, reference, related_deal_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
    ])

    const lifetime = (txs ?? [])
      .filter((t) => t.type === "EARNING" && t.status === "COMPLETED")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0)

    return NextResponse.json({
      available: Number(balance?.available ?? 0),
      pending: Number(balance?.pending ?? 0),
      currency: balance?.currency ?? "USD",
      lifetimeEarnings: lifetime,
      transactions: txs ?? [],
    })
  } catch (err) {
    return handleApiError(err)
  }
}
