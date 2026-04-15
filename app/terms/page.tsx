import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Terms of Service - Marketingplace" }

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      "By accessing or using Marketingplace (the Platform), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform. These Terms form a binding agreement between you and Marketingplace.",
    ],
  },
  {
    heading: "2. Eligibility",
    body: [
      "You must be at least 18 years old and have the legal capacity to enter contracts in your jurisdiction. Brands must represent a legitimate business entity. Creators must be the owner or authorized representative of the social media accounts they link.",
    ],
  },
  {
    heading: "3. The Platform",
    body: [
      "Marketingplace is a two-sided marketplace that connects brands with short-form content creators. Brands publish campaigns; creators apply, negotiate, and deliver content. We facilitate discovery, messaging, escrow, and payouts, but we are not a party to the agreements between brands and creators.",
    ],
  },
  {
    heading: "4. Accounts and Roles",
    body: [
      "You must provide accurate, current information when registering and keep it up to date. You are responsible for safeguarding your password and for all activity under your account. Each account has a role (Creator, Brand, or Admin) that determines the features available to you. You may not share, sell, or transfer your account.",
    ],
  },
  {
    heading: "5. Campaigns and Deals",
    body: [
      "Brands are solely responsible for the accuracy, legality, and content of the campaigns they publish. Creators are solely responsible for the content they submit and for complying with applicable advertising disclosure laws (including FTC guidelines in the United States).",
      "A Deal is created when a brand accepts a creator's application or when the parties agree to terms via the proposal system. Deliverables, rates, and deadlines are set by the parties. Marketingplace does not guarantee outcomes, engagement, or conversion rates.",
    ],
  },
  {
    heading: "6. Payments, Fees, and Escrow",
    body: [
      "Marketingplace charges a platform fee of 4% to brands and 4% to creators on the gross value of each completed deal, for a total platform take of 8%. Fees are deducted automatically at the time of escrow release.",
      "Brands fund deals by depositing balance into the Platform. When a deal is accepted, the agreed rate is held in escrow. On approval of the creator's submission, escrow is released to the creator's available balance (minus the platform fee). If a deal is cancelled before delivery, escrow is refunded to the brand (minus any non-refundable fees disclosed at cancellation).",
      "Payouts to creators are processed through our payment partner. Minimum withdrawal thresholds, timing, and verification requirements are disclosed in the payouts area of your account.",
    ],
  },
  {
    heading: "7. Content and Intellectual Property",
    body: [
      "Creators retain ownership of the content they create unless otherwise agreed in writing with the brand. By submitting content to a campaign, the creator grants the brand a non-exclusive, worldwide license to use the content for the purposes described in the campaign brief, unless the parties negotiate different terms.",
      "Brands retain ownership of their brand assets (logos, product imagery, marketing copy) and grant creators a limited license to use those assets solely for the purpose of fulfilling the campaign.",
      "You may not upload, submit, or distribute content that infringes third-party rights, violates law, or is defamatory, obscene, or misleading.",
    ],
  },
  {
    heading: "8. Prohibited Conduct",
    body: [
      "You agree not to: (a) use the Platform for any illegal purpose; (b) misrepresent your identity, follower counts, or engagement metrics; (c) circumvent the Platform's fee structure by transacting off-platform after being matched here; (d) harass, threaten, or defraud any user; (e) attempt to access accounts, data, or systems without authorization; (f) scrape, reverse engineer, or overload the Platform.",
    ],
  },
  {
    heading: "9. Disputes Between Users",
    body: [
      "Disputes between brands and creators should first be resolved directly through the messaging system. If unresolved, either party may escalate to Marketingplace support for review. Admins may examine deal artifacts (messages, submissions, metrics) and issue a binding resolution regarding escrow release or refund. Disputes about content ownership, defamation, or off-platform liabilities are the sole responsibility of the parties involved.",
    ],
  },
  {
    heading: "10. Termination",
    body: [
      "You may close your account at any time via Settings. Marketingplace may suspend or terminate accounts that violate these Terms, engage in fraud, or pose a risk to other users or the Platform. On termination, pending balances are settled according to the payout rules in effect at that time.",
    ],
  },
  {
    heading: "11. Disclaimers",
    body: [
      "The Platform is provided on an \"as is\" and \"as available\" basis. We make no warranties, express or implied, about uptime, merchantability, fitness for a particular purpose, or the accuracy of any data surfaced from third-party social platforms.",
    ],
  },
  {
    heading: "12. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Marketingplace's aggregate liability arising from or relating to the Platform is limited to the greater of (a) the platform fees you paid to us in the twelve months preceding the claim, or (b) one hundred US dollars. We are not liable for indirect, incidental, consequential, or punitive damages.",
    ],
  },
  {
    heading: "13. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Material changes will be announced in-app or via email at least 14 days before taking effect. Continued use of the Platform after changes take effect constitutes acceptance.",
    ],
  },
  {
    heading: "14. Governing Law",
    body: [
      "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-laws principles. Exclusive jurisdiction lies in the state and federal courts located in Delaware.",
    ],
  },
  {
    heading: "15. Contact",
    body: [
      "Questions about these Terms can be sent to support@marketingplace.com.",
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0]">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#8892A8] mb-10">Last updated: April 16, 2026</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold text-[#E2E8F0] mb-3">{s.heading}</h2>
              <div className="space-y-3 text-sm text-[#8892A8] leading-relaxed">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-xs text-[#8892A8]">
          Contact: <a href="mailto:support@marketingplace.com" className="text-[#6C5CE7] hover:underline">support@marketingplace.com</a>
        </p>
      </main>
    </div>
  )
}
