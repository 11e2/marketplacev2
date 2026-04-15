import { NextResponse } from "next/server"

// TODO(stripe): verify signature with STRIPE_WEBHOOK_SECRET and handle:
// - checkout.session.completed -> ledger_deposit
// - transfer.paid -> mark PAYOUT transaction COMPLETED
// - charge.dispute.created -> flag deal/transaction
// Dev mode returns 200 to any POST so Stripe CLI can be pointed at it without error.
export async function POST() {
  return NextResponse.json({ ok: true, note: "stripe webhook stub" })
}
