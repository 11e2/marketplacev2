import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { depositSchema } from "@/lib/validation"
import { ledgerDeposit } from "@/lib/escrow"

// Dev mode: credit balance immediately. In production, this should create a
// Stripe Checkout session and defer crediting to the webhook handler.
// TODO(stripe): replace direct ledger_deposit with Checkout session creation.
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { amount } = depositSchema.parse(await request.json())
    const reference = `dev-deposit-${Date.now()}`
    await ledgerDeposit(user.id, amount, reference)

    return NextResponse.json({ ok: true, amount, reference })
  } catch (err) {
    return handleApiError(err)
  }
}
