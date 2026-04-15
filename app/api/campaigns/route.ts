import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { campaignType, campaignStatus, campaignsListQuerySchema } from "@/lib/validation"

// Drafts are intentionally permissive so brands can save partial work.
// Full validation kicks in when publish === true.
const draftSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(4000).optional().default(""),
  type: campaignType,
  channels: z.array(z.string().min(1)).default([]),
  totalBudget: z.number().nonnegative().max(10_000_000).optional().default(0),
  cpm: z.number().nonnegative().optional(),
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

const publishSchema = draftSchema.extend({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  channels: z.array(z.string().min(1)).min(1),
  totalBudget: z.number().positive().max(10_000_000),
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
    const q = campaignsListQuerySchema.parse(params)

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!q.mine && !user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const usePagination = q.page !== undefined || q.pageSize !== undefined
    const pageSize = q.pageSize ?? q.limit
    const page = q.page ?? 1
    const from = usePagination ? (page - 1) * pageSize : 0
    const to = usePagination ? from + pageSize - 1 : pageSize - 1

    let query = supabase
      .from("campaigns")
      .select(
        "id, brand_user_id, title, description, type, status, channels, cpm, min_followers, min_views, total_budget, remaining_budget, spots, spots_remaining, brand_asset_url, accent_color, created_at, updated_at, owner:profiles!campaigns_brand_user_id_fkey(name, avatar_url)",
        usePagination ? { count: "exact" } : undefined,
      )
      .order("created_at", { ascending: false })

    if (q.mine) {
      if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")
      query = query.eq("brand_user_id", user.id)
      if (q.status) query = query.eq("status", q.status)
    } else {
      query = query.eq("status", q.status ?? "ACTIVE")
    }

    if (q.type) query = query.eq("type", q.type)

    const channelList = q.channels
      ? q.channels
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : q.channel
        ? [q.channel]
        : []
    if (channelList.length === 1) query = query.contains("channels", channelList)
    else if (channelList.length > 1) query = query.overlaps("channels", channelList)

    if (q.minBudget !== undefined) query = query.gte("total_budget", q.minBudget)
    if (q.maxBudget !== undefined) query = query.lte("total_budget", q.maxBudget)
    if (q.search) {
      const like = `%${q.search.replace(/[%_]/g, (c) => `\\${c}`)}%`
      query = query.or(`title.ilike.${like},description.ilike.${like}`)
    }
    if (!usePagination && q.cursor) query = query.lt("created_at", q.cursor)

    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw new ApiError("INTERNAL", error.message)

    const items = (data ?? []).map((row) => ({ ...row, ...computedFields(row as Record<string, unknown>) }))

    if (usePagination) {
      const total = count ?? 0
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      return NextResponse.json({
        items,
        pagination: { page, pageSize, total, totalPages, hasMore: page < totalPages },
      })
    }

    const nextCursor =
      items.length === pageSize ? (items[items.length - 1] as { created_at: string }).created_at : null
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    if (!profile) throw new ApiError("BAD_REQUEST", "Profile missing. Finish onboarding first.")
    if (profile.role !== "BRAND" && profile.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Only brand accounts can create campaigns")
    }

    const body = await request.json()
    const input = body?.publish ? publishSchema.parse(body) : draftSchema.parse(body)
    if (input.publish && input.type === "CLIPPING" && !input.cpm) {
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
