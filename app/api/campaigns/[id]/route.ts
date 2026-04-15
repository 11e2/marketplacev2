import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { campaignStatus } from "@/lib/validation"

const patchSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(4000).optional(),
  channels: z.array(z.string().min(1)).min(1).optional(),
  cpm: z.number().positive().optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  minViews: z.number().int().nonnegative().optional(),
  spots: z.number().int().positive().optional(),
  totalBudget: z.number().positive().optional(),
  brandAssetUrl: z.string().url().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  status: campaignStatus.optional(),
})

const ACTIVE_EDITABLE = new Set(["description", "channels", "min_followers", "min_views", "status"])

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("campaigns")
      .select(
        "id, brand_user_id, title, description, type, status, channels, cpm, min_followers, min_views, total_budget, remaining_budget, spots, spots_remaining, brand_asset_url, accent_color, created_at, updated_at, owner:profiles!campaigns_brand_user_id_fkey(name, avatar_url), brand:brand_profiles!brand_profiles_user_id_fkey(company_name, logo_url, website, industry, is_verified)",
      )
      .eq("id", id)
      .maybeSingle()
    if (error) throw new ApiError("INTERNAL", error.message)
    if (!data) throw new ApiError("NOT_FOUND", "Campaign not found")

    const total = Number(data.total_budget ?? 0)
    const remaining = Number(data.remaining_budget ?? total)
    const percentBudgetUsed = total > 0 ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0

    return NextResponse.json({
      campaign: {
        ...data,
        percentBudgetUsed,
        spotsRemaining: data.spots_remaining ?? data.spots ?? null,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: existing } = await supabase
      .from("campaigns")
      .select("brand_user_id, status, total_budget, remaining_budget")
      .eq("id", id)
      .maybeSingle()
    if (!existing) throw new ApiError("NOT_FOUND", "Campaign not found")
    if (existing.brand_user_id !== user.id) throw new ApiError("FORBIDDEN", "Not your campaign")

    const input = patchSchema.parse(await request.json())
    const update: Record<string, unknown> = {}
    if (input.title !== undefined) update.title = input.title
    if (input.description !== undefined) update.description = input.description
    if (input.channels !== undefined) update.channels = input.channels
    if (input.cpm !== undefined) update.cpm = input.cpm
    if (input.minFollowers !== undefined) update.min_followers = input.minFollowers
    if (input.minViews !== undefined) update.min_views = input.minViews
    if (input.spots !== undefined) update.spots = input.spots
    if (input.totalBudget !== undefined) update.total_budget = input.totalBudget
    if (input.brandAssetUrl !== undefined) update.brand_asset_url = input.brandAssetUrl
    if (input.accentColor !== undefined) update.accent_color = input.accentColor
    if (input.status !== undefined) update.status = input.status

    if (existing.status !== "DRAFT") {
      for (const key of Object.keys(update)) {
        if (!ACTIVE_EDITABLE.has(key)) {
          throw new ApiError(
            "BAD_REQUEST",
            `Cannot edit "${key}" while campaign is ${existing.status}. Pause or keep it in DRAFT to edit.`,
          )
        }
      }
    }

    if (input.status === "ACTIVE" && existing.status === "DRAFT") {
      const { data: balance } = await supabase
        .from("balances")
        .select("available")
        .eq("user_id", user.id)
        .maybeSingle()
      const budget = (update.total_budget as number | undefined) ?? Number(existing.total_budget)
      const available = Number(balance?.available ?? 0)
      if (available < budget) {
        throw new ApiError(
          "BAD_REQUEST",
          `Insufficient balance to activate. Available $${available.toFixed(2)}, needed $${budget.toFixed(2)}.`,
        )
      }
      if (update.total_budget !== undefined) update.remaining_budget = update.total_budget
    }

    if (Object.keys(update).length === 0) return NextResponse.json({ ok: true })

    const { error } = await supabase.from("campaigns").update(update).eq("id", id)
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: existing } = await supabase
      .from("campaigns")
      .select("brand_user_id, status")
      .eq("id", id)
      .maybeSingle()
    if (!existing) throw new ApiError("NOT_FOUND", "Campaign not found")
    if (existing.brand_user_id !== user.id) throw new ApiError("FORBIDDEN", "Not your campaign")

    if (existing.status === "DRAFT") {
      const { error } = await supabase.from("campaigns").delete().eq("id", id)
      if (error) throw new ApiError("INTERNAL", error.message)
      return NextResponse.json({ ok: true, deleted: true })
    }

    const { error } = await supabase.from("campaigns").update({ status: "COMPLETED" }).eq("id", id)
    if (error) throw new ApiError("INTERNAL", error.message)
    return NextResponse.json({ ok: true, archived: true })
  } catch (err) {
    return handleApiError(err)
  }
}
