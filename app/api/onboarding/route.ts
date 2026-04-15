import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { handleApiError, ApiError } from "@/lib/errors"

const creatorSchema = z.object({
  role: z.literal("CREATOR"),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(1000).optional().default(""),
  niches: z.array(z.string()).min(1),
})

const brandSchema = z.object({
  role: z.literal("BRAND"),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  companyName: z.string().min(1).max(200),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().max(100).optional().default(""),
})

const bodySchema = z.discriminatedUnion("role", [creatorSchema, brandSchema])

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const json = await request.json()
    const input = bodySchema.parse(json)

    const profileUpdate = {
      name: input.name,
      avatar_url: input.role === "CREATOR" ? input.avatarUrl || null : input.avatarUrl || null,
      role: input.role,
    }
    const { error: pErr } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id)
    if (pErr) throw new ApiError("INTERNAL", pErr.message)

    if (input.role === "CREATOR") {
      const { error } = await supabase.from("creator_profiles").upsert({
        user_id: user.id,
        bio: input.bio || null,
        niches: input.niches,
      })
      if (error) throw new ApiError("INTERNAL", error.message)
    } else {
      const { error } = await supabase.from("brand_profiles").upsert({
        user_id: user.id,
        company_name: input.companyName,
        logo_url: input.logoUrl || null,
        website: input.website || null,
        industry: input.industry || null,
      })
      if (error) throw new ApiError("INTERNAL", error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
