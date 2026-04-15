import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { campaignType, campaignStatus } from "@/lib/validation"

const listQuery = z.object({
  channel: z.string().optional(),
  type: campaignType.optional(),
  status: campaignStatus.optional(),
  search: z.string().optional(),
  minBudget: z.coerce.number().nonnegative().optional(),
  maxBudget: z.coerce.number().nonnegative().optional(),
  mine: z.enum(["1", "true"]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
})

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  type: campaignType,
  channels: z.array(z.string().min(1)).min(1),
  totalBudget: z.number().positive().max(10_000_000),
  cpm: z.number().positive().optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  minViews: z.number().int().nonnegative().optional(),
  spots: z.number().int().positive().optional(),
  brandAssetUrl: z.string().url().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  publish: z.boolean().optional(),
})

function computedFields(row: Record<string, unknown>) {
  const total = Number(row.total_budget ?? 0)
  const remaining = Number(row.remaining_budget ?? total)
  const percentBudgetUsed = total > 0 ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0
  const spots = row.spots as number | null
  const spotsRemaining = row.spots_remaining as number | null
  return { percentBudgetUsed, spotsRemaining: spotsRemaining ?? spots ?? null }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const q = listQuery.parse(params)

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let query = supabase
      .from("campaigns")
      .select(
        "id, brand_user_id, title, description, type, status, channels, cpm, min_followers, min_views, total_budget, remaining_budget, spots, spots_remaining, brand_asset_url, accent_color, created_at, updated_at, owner:profiles!campaigns_brand_user_id_fkey(name, avatar_url), brand:brand_profiles!brand_profiles_user_id_fkey(company_name, logo_url, is_verified)",
      )
      .order("created_at", { ascending: false })
      .limit(q.limit)

    if (q.mine) {
      if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")
      query = query.eq("brand_user_id", user.id)
      if (q.status) query = query.eq("status", q.status)
    } else {
      query = query.eq("status", q.status ?? "ACTIVE")
    }

    if (q.type) query = query.eq("type", q.type)
    if (q.channel) query = query.contains("channels", [q.channel])
    if (q.minBudget !== undefined) query = query.gte("total_budget", q.minBudget)
    if (q.maxBudget !== undefined) query = query.lte("total_budget", q.maxBudget)
    if (q.search) query = query.ilike("title", `%${q.search}%`)
    if (q.cursor) query = query.lt("created_at", q.cursor)

    const { data, error } = await query
    if (error) throw new ApiError("INTERNAL", error.message)

    const items = (data ?? []).map((row) => ({ ...row, ...computedFields(row as Record<string, unknown>) }))
    const nextCursor =
      items.length === q.limit ? (items[items.length - 1] as { created_at: string }).created_at : null

    return NextResponse.json({ items, nextCursor })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "BRAND" && profile?.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Only brands can create campaigns")
    }

    const input = createSchema.parse(await request.json())
    if (input.type === "CLIPPING" && !input.cpm) {
      throw new ApiError("BAD_REQUEST", "CPM is required for clipping campaigns")
    }

    const status: "DRAFT" | "ACTIVE" = input.publish ? "ACTIVE" : "DRAFT"

    if (status === "ACTIVE") {
      const { data: balance } = await supabase
        .from("balances")
        .select("available")
        .eq("user_id", user.id)
        .maybeSingle()
      const available = Number(balance?.available ?? 0)
      if (available < input.totalBudget) {
        throw new ApiError(
          "BAD_REQUEST",
          `Insufficient balance. Available $${available.toFixed(2)}, needed $${input.totalBudget.toFixed(2)}. Deposit funds or save as draft.`,
        )
      }
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        brand_user_id: user.id,
        title: input.title,
        description: input.description,
        type: input.type,
        status,
        channels: input.channels,
        cpm: input.cpm ?? null,
        min_followers: input.minFollowers ?? null,
        min_views: input.minViews ?? null,
        total_budget: input.totalBudget,
        remaining_budget: input.totalBudget,
        spots: input.spots ?? null,
        spots_remaining: input.spots ?? null,
        brand_asset_url: input.brandAssetUrl ?? null,
        accent_color: input.accentColor ?? null,
      })
      .select("id")
      .single()
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ id: data.id, status }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
