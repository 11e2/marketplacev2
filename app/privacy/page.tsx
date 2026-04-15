import { BackLink } from "@/components/back-link"

export const metadata = { title: "Privacy Policy - Marketingplace" }

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Overview",
    body: [
      "This Privacy Policy describes how Marketingplace (we, us, our) collects, uses, and shares your information when you use our platform. By using Marketingplace, you agree to the practices described here.",
    ],
  },
  {
    heading: "2. Information We Collect",
    body: [
      "Account information: name, email address, password (hashed), role (Creator or Brand), avatar, and profile details you provide during onboarding.",
      "Business information (brands): company name, logo, website, industry, billing contact.",
      "Creator information: bio, niches, content samples, and any service listings you publish.",
      "Linked social accounts: when you connect a social platform via OAuth, we store the platform user ID, username, and access tokens (encrypted at rest). We fetch public metrics such as follower counts, post views, and engagement rates from the platform's API.",
      "Payment information: processed by our payment partner (Stripe). We do not store full card numbers on our servers. We retain the last four digits and the payment method type for your records.",
      "Usage information: log data, IP address, device identifiers, browser type, pages visited, and actions taken on the Platform.",
      "Content you submit: messages, applications, proposals, campaign submissions, and any files you upload.",
    ],
  },
  {
    heading: "3. How We Use Your Information",
    body: [
      "To operate the Platform: authenticate you, match brands and creators, process payments and escrow, send notifications, and provide support.",
      "To improve the Platform: analyze usage patterns, debug issues, develop new features, and measure performance.",
      "To communicate with you: transactional emails about your account, deals, and payouts; product updates (which you may opt out of); and required legal or safety notices.",
      "To comply with law: respond to lawful requests, enforce our Terms, detect fraud, and protect the rights, property, and safety of users and the Platform.",
    ],
  },
  {
    heading: "4. How We Share Information",
    body: [
      "Between users: when you participate in a deal, the other party sees your profile, applications, messages, proposals, and submissions as needed to complete the transaction.",
      "Service providers: we share data with vendors that help us run the Platform, including our database host, payment processor, email provider, error tracking, and analytics. These vendors are bound by contract to use the data only for the services they provide to us.",
      "Legal and safety: we may disclose information to comply with a subpoena, court order, or applicable law, or to protect against fraud, abuse, or harm.",
      "Business transfers: if we are involved in a merger, acquisition, or sale of assets, user information may be transferred as part of that transaction, subject to this Policy.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    heading: "5. Data Retention",
    body: [
      "We retain account data for as long as your account is active and for a reasonable period afterwards to comply with legal, tax, and accounting requirements. Transactional records (deals, payments, payouts) are retained for at least seven years. Messages and submissions are retained for the life of the account plus a reasonable grace period to support disputes.",
    ],
  },
  {
    heading: "6. Your Rights",
    body: [
      "You can access, correct, or delete most of your information from the Settings area. You may also request a copy of your data or ask us to delete your account by writing to support@marketingplace.com. Depending on your location, you may have additional rights under GDPR, CCPA, or similar laws, including the right to object to processing and the right to lodge a complaint with a supervisory authority.",
      "To exercise your rights, contact us at support@marketingplace.com. We may need to verify your identity before acting on your request.",
    ],
  },
  {
    heading: "7. Security",
    body: [
      "We use industry-standard safeguards including encryption in transit (TLS), encryption at rest for sensitive fields (such as OAuth tokens), hashed passwords, access controls, and routine security reviews. No method of transmission or storage is completely secure; we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "8. Cookies and Tracking",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember preferences, and measure usage. You can control cookies through your browser settings. Blocking essential cookies may prevent you from using parts of the Platform.",
    ],
  },
  {
    heading: "9. Children",
    body: [
      "Marketingplace is not directed to children under 18 and we do not knowingly collect information from anyone under 18. If you believe a child has provided us with information, contact support@marketingplace.com and we will delete it.",
    ],
  },
  {
    heading: "10. International Transfers",
    body: [
      "We operate primarily in the United States. If you access the Platform from outside the US, your information may be transferred to, stored, and processed in the US or other countries where our service providers operate. We take steps to ensure appropriate safeguards are in place for such transfers.",
    ],
  },
  {
    heading: "11. Changes to This Policy",
    body: [
      "We may update this Policy to reflect changes in our practices or for legal reasons. Material changes will be announced in-app or via email at least 14 days before taking effect.",
    ],
  },
  {
    heading: "12. Contact",
    body: [
      "Questions or requests about privacy can be sent to support@marketingplace.com.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0]">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <BackLink />

        <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2">Privacy Policy</h1>
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
