import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const BUCKETS = {
  avatar: "avatars",
  "campaign-asset": "campaign-assets",
  submission: "submissions",
} as const

const bodySchema = z.object({
  kind: z.enum(["avatar", "campaign-asset", "submission"]),
  filename: z.string().min(1).max(200),
  contentType: z.string().max(100).optional(),
})

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { kind, filename } = bodySchema.parse(await request.json())
    const bucket = BUCKETS[kind]
    const path = `${user.id}/${Date.now()}_${sanitize(filename)}`

    // Submissions are videos that take longer to upload; give the URL an hour.
    // Other kinds default to Supabase's standard (~120s is usually enough for images).
    const createOpts = kind === "submission" ? { expiresIn: 3600 } : undefined
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, createOpts)
    if (error || !data) throw new ApiError("INTERNAL", error?.message ?? "Failed to create upload URL")

    const isPublic = kind !== "submission"
    const publicUrl = isPublic ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null

    return NextResponse.json({
      bucket,
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
