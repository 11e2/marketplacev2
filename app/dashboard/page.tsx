"use client"

import Link from "next/link"
import { DollarSign, Layers, Users, TrendingDown, UserCheck, Inbox } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"

const topStats = [
  { label: "Total Spend", value: "--", sub: "This month", icon: DollarSign, iconColor: "#6C5CE7" },
  { label: "Active Campaigns", value: "--", sub: "No campaigns yet", icon: Layers, iconColor: "#4ECDC4" },
  { label: "Total Reach", value: "--", sub: "No data", icon: TrendingDown, iconColor: "#00B894" },
  { label: "Avg Cost/Engagement", value: "--", sub: "No data", icon: TrendingDown, iconColor: "#00B894" },
  { label: "Active Creators", value: "--", sub: "0 pending review", icon: UserCheck, iconColor: "#FF9F43" },
]

export default function DashboardPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="brand" />

      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Brand Dashboard</h1>
            <p className="text-sm text-[#8892A8]">Metrics populate as your campaigns go live</p>
          </div>
          <Link
            href="/campaign-builder"
            className="bg-[#FF6B35] hover:bg-[#e55a25] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Layers size={14} />
            New Campaign
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {topStats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#8892A8] font-medium uppercase tracking-wide">{s.label}</p>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${s.iconColor}20` }}
                  >
                    <Icon size={14} style={{ color: s.iconColor }} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-[#E2E8F0]">{s.value}</p>
                <p className="text-xs mt-1 text-[#8892A8]">{s.sub}</p>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#E2E8F0]">Spend by Channel</h2>
                <p className="text-xs text-[#8892A8]">Last 30 days</p>
              </div>
              <Users size={16} className="text-[#8892A8]" />
            </div>
            <EmptyState
              icon={TrendingDown}
              title="No spend yet"
              description="Chart activates after your first campaign is funded."
              className="py-8"
            />
          </div>

          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Active Campaigns</h2>
            <EmptyState
              icon={Layers}
              title="No active campaigns"
              description="Create your first campaign to start reaching creators."
              className="py-8"
              action={
                <Link
                  href="/campaign-builder"
                  className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Create Campaign
                </Link>
              }
            />
          </div>
        </div>

        <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Recent Submissions</h2>
          <EmptyState
            icon={Inbox}
            title="No submissions yet"
            description="Once creators submit content for your campaigns, it will appear here for review."
          />
        </div>
      </main>
    </div>
  )
}
