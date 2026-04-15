import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"

const prefsSchema = z.object({
  emailDeals: z.boolean(),
  emailMessages: z.boolean(),
  emailPayouts: z.boolean(),
  emailMarketing: z.boolean(),
  pushDeals: z.boolean(),
  pushMessages: z.boolean(),
})

export type NotificationPrefs = z.infer<typeof prefsSchema>

const DEFAULTS: NotificationPrefs = {
  emailDeals: true,
  emailMessages: true,
  emailPayouts: true,
  emailMarketing: false,
  pushDeals: true,
  pushMessages: true,
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const stored = user.user_metadata?.notification_prefs as Partial<NotificationPrefs> | undefined
    return NextResponse.json({ prefs: { ...DEFAULTS, ...(stored || {}) } })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const prefs = prefsSchema.parse(await request.json())
    const { error } = await supabase.auth.updateUser({ data: { notification_prefs: prefs } })
    if (error) throw new ApiError("INTERNAL", error.message)

    return NextResponse.json({ prefs })
  } catch (err) {
    return handleApiError(err)
  }
}
