import { NextResponse } from "next/server"
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

export async function POST() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const admin = createServiceSupabase()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw new ApiError("INTERNAL", error.message)

    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
