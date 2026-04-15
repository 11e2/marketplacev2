import { NextResponse } from "next/server"

// Dev stub. Real implementation sketch:
//
// import Stripe from "stripe"
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
// const secret = process.env.STRIPE_WEBHOOK_SECRET!
//
// export async function POST(request: Request) {
//   const signature = request.headers.get("stripe-signature")
//   const payload = await request.text()
//   let event: Stripe.Event
//   try {
//     event = stripe.webhooks.constructEvent(payload, signature!, secret)
//   } catch {
//     return new NextResponse("Invalid signature", { status: 400 })
//   }
//   switch (event.type) {
//     case "checkout.session.completed":
//       // call ledger_deposit with amount_total/100 and session.client_reference_id
//       break
//     case "transfer.paid":
//       // mark the matching PAYOUT transaction COMPLETED
//       break
//     case "charge.dispute.created":
//       // flag the related deal/transaction and notify admin
//       break
//   }
//   return NextResponse.json({ received: true })
// }
//
// TODO(stripe): replace the stub below with the sketch once STRIPE_SECRET_KEY
// and STRIPE_WEBHOOK_SECRET are provisioned. Dev returns 200 so the Stripe CLI
// can be pointed at this URL without error.
export async function POST() {
  return NextResponse.json({ ok: true, note: "stripe webhook stub" })
}
