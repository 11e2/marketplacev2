import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { currentPassword, newPassword } = schema.parse(await request.json())

    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (verifyErr) throw new ApiError("BAD_REQUEST", "Current password is incorrect")

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
