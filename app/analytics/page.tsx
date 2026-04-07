import { SidebarNav } from "@/components/sidebar-nav"
import { BarChart2, Users, Eye, TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />
      <main className="flex-1 min-w-0 px-6 py-6">
        <h1 className="text-xl font-bold text-[#E2E8F0] mb-6">Analytics</h1>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reach", value: "840K", icon: Users, color: "#6C5CE7" },
            { label: "Impressions", value: "3.2M", icon: Eye, color: "#4ECDC4" },
            { label: "Eng. Rate", value: "7.8%", icon: TrendingUp, color: "#00B894" },
            { label: "Campaigns", value: "127", icon: BarChart2, color: "#FF9F43" },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color: s.color }} />
                  <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide">{s.label}</p>
                </div>
                <p className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
              </div>
            )
          })}
        </div>
        <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-6 text-center">
          <BarChart2 size={32} className="mx-auto mb-3 text-[#6C5CE7] opacity-60" />
          <p className="font-bold text-[#E2E8F0] mb-2">Detailed Analytics Coming Soon</p>
          <p className="text-sm text-[#8892A8]">Per-campaign performance breakdowns, audience demographics, and channel comparisons will appear here.</p>
        </div>
      </main>
    </div>
  )
}
