import { SidebarNav } from "@/components/sidebar-nav"
import { Link2, TrendingUp, DollarSign } from "lucide-react"

export default function AffiliatesPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />
      <main className="flex-1 min-w-0 px-6 py-6">
        <h1 className="text-xl font-bold text-[#E2E8F0] mb-6">Affiliate Network</h1>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active Links", value: "14", icon: Link2, color: "#6C5CE7" },
            { label: "This Month", value: "$843.20", icon: DollarSign, color: "#00B894" },
            { label: "Conversions", value: "312", icon: TrendingUp, color: "#4ECDC4" },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: s.color }} />
                  <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide">{s.label}</p>
                </div>
                <p className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
              </div>
            )
          })}
        </div>
        <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-6 text-center">
          <Link2 size={32} className="mx-auto mb-3 text-[#6C5CE7] opacity-60" />
          <p className="font-bold text-[#E2E8F0] mb-2">Your Affiliate Links</p>
          <p className="text-sm text-[#8892A8]">Apply to campaigns with affiliate components to generate tracked links and earn commissions.</p>
          <button className="mt-4 bg-[#6C5CE7] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#5a4dd4] transition-colors">
            Browse Affiliate Campaigns
          </button>
        </div>
      </main>
    </div>
  )
}
