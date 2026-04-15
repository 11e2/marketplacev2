import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { handleApiError, ApiError } from "@/lib/errors"
import { updateProfileSchema } from "@/lib/validation"

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, name, avatar_url, role, created_at")
      .eq("id", user.id)
      .maybeSingle()

    const role = (profile?.role as "CREATOR" | "BRAND" | "ADMIN" | undefined) ?? "CREATOR"
    const fallbackName =
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "User"

    let extra: Record<string, unknown> = {}
    if (role === "CREATOR") {
      const { data } = await supabase
        .from("creator_profiles")
        .select("bio, niches")
        .eq("user_id", user.id)
        .maybeSingle()
      extra = { creator: data ?? null }
    } else if (role === "BRAND") {
      const { data } = await supabase
        .from("brand_profiles")
        .select("company_name, logo_url, website, industry, is_verified")
        .eq("user_id", user.id)
        .maybeSingle()
      extra = { brand: data ?? null }
    }

    return NextResponse.json({
      user: {
        id: profile?.id ?? user.id,
        email: profile?.email ?? user.email ?? "",
        name: profile?.name ?? fallbackName,
        avatar_url: profile?.avatar_url ?? null,
        role,
        created_at: profile?.created_at ?? null,
        onboarded: Boolean(user.user_metadata?.onboarded),
        ...extra,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

const patchSchema = updateProfileSchema.extend({
  bio: z.string().max(1000).optional(),
  niches: z.array(z.string()).optional(),
})

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const input = patchSchema.parse(await request.json())

    const profileUpdate: Record<string, unknown> = {}
    if (input.name !== undefined) profileUpdate.name = input.name
    if (input.avatarUrl !== undefined) profileUpdate.avatar_url = input.avatarUrl
    if (Object.keys(profileUpdate).length) {
      const { error } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id)
      if (error) throw new ApiError("INTERNAL", error.message)
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const role = profile?.role as "CREATOR" | "BRAND" | "ADMIN"

    if (role === "CREATOR" && (input.bio !== undefined || input.niches !== undefined)) {
      const payload: Record<string, unknown> = { user_id: user.id }
      if (input.bio !== undefined) payload.bio = input.bio
      if (input.niches !== undefined) payload.niches = input.niches
      const { error } = await supabase.from("creator_profiles").upsert(payload)
      if (error) throw new ApiError("INTERNAL", error.message)
    }

    if (role === "BRAND") {
      const payload: Record<string, unknown> = { user_id: user.id }
      if (input.companyName !== undefined) payload.company_name = input.companyName
      if (input.logoUrl !== undefined) payload.logo_url = input.logoUrl
      if (input.website !== undefined) payload.website = input.website
      if (input.industry !== undefined) payload.industry = input.industry
      if (Object.keys(payload).length > 1) {
        const { error } = await supabase.from("brand_profiles").upsert(payload)
        if (error) throw new ApiError("INTERNAL", error.message)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
