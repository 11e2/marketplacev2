import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { ApiError, handleApiError } from "@/lib/errors"
import { withdrawSchema } from "@/lib/validation"
import { ledgerWithdraw } from "@/lib/escrow"

const MIN_WITHDRAWAL = 50

// Dev mode: debit balance immediately. In production, this should queue a
// Stripe Connect transfer and only complete on the transfer webhook.
// TODO(stripe-connect): integrate Connected Accounts and Transfers.
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new ApiError("UNAUTHORIZED", "Not signed in")

    const { amount } = withdrawSchema.parse(await request.json())
    if (amount < MIN_WITHDRAWAL) {
      throw new ApiError("BAD_REQUEST", `Minimum withdrawal is $${MIN_WITHDRAWAL}`)
    }

    const reference = `dev-payout-${Date.now()}`
    await ledgerWithdraw(user.id, amount, reference)

    return NextResponse.json({ ok: true, amount, reference })
  } catch (err) {
    return handleApiError(err)
  }
}
