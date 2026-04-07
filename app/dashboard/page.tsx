"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  DollarSign,
  Layers,
  Users,
  TrendingDown,
  UserCheck,
  ExternalLink,
} from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip, StatusPill } from "@/components/channel-chip"
import { brandStats, spendByChannel, activeCampaigns, recentSubmissions } from "@/lib/data"

const topStats = [
  {
    label: "Total Spend",
    value: brandStats.totalSpend,
    sub: "This month",
    subColor: "#00B894",
    icon: DollarSign,
    iconColor: "#6C5CE7",
  },
  {
    label: "Active Campaigns",
    value: String(brandStats.activeCampaigns),
    sub: "Across 6 channels",
    subColor: "#4ECDC4",
    icon: Layers,
    iconColor: "#4ECDC4",
  },
  {
    label: "Total Reach",
    value: brandStats.totalReach,
    sub: "+18% vs last month",
    subColor: "#00B894",
    icon: TrendingDown,
    iconColor: "#00B894",
  },
  {
    label: "Avg Cost/Engagement",
    value: brandStats.costPerEngagement,
    sub: "-12% vs last month",
    subColor: "#00B894",
    icon: TrendingDown,
    iconColor: "#00B894",
  },
  {
    label: "Active Creators",
    value: String(brandStats.activeCreators),
    sub: `${brandStats.pendingReview} pending review`,
    subColor: "#FF9F43",
    icon: UserCheck,
    iconColor: "#FF9F43",
  },
]

const channelBarColors: Record<string, string> = {
  TikTok: "#6C5CE7",
  YouTube: "#FF4444",
  "Twitter/X": "#94A3B8",
  Discord: "#4ECDC4",
  Podcast: "#FF9F43",
  Other: "#64748B",
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl px-3 py-2 text-xs text-[#E2E8F0] shadow-lg">
        <p className="font-bold mb-0.5">{label}</p>
        <p className="font-mono text-[#00B894]">${(payload[0].value / 1000).toFixed(1)}K</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="brand" />

      <main className="flex-1 min-w-0 px-6 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Brand Dashboard</h1>
            <p className="text-sm text-[#8892A8]">Last 30 days · April 2026</p>
          </div>
          <button className="bg-[#FF6B35] hover:bg-[#e55a25] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            <Layers size={14} />
            New Campaign
          </button>
        </div>

        {/* Top stats */}
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
                <p className="text-xs mt-1" style={{ color: s.subColor }}>{s.sub}</p>
              </div>
            )
          })}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Spend by channel */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#E2E8F0]">Spend by Channel</h2>
                <p className="text-xs text-[#8892A8]">Last 30 days</p>
              </div>
              <Users size={16} className="text-[#8892A8]" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spendByChannel} barSize={24}>
                <XAxis
                  dataKey="channel"
                  tick={{ fill: "#8892A8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(108,92,231,0.08)" }} />
                <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                  {spendByChannel.map((entry) => (
                    <Cell key={entry.channel} fill={channelBarColors[entry.channel] ?? "#6C5CE7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Active campaigns */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#E2E8F0]">Active Campaigns</h2>
              <button className="text-xs text-[#6C5CE7] hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {activeCampaigns.map((c) => (
                <div
                  key={c.name}
                  className="bg-[#0B0F1A] border border-[#2A3050] rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#E2E8F0] truncate">{c.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {c.channels.map((ch) => (
                        <ChannelChip key={ch} channel={ch} />
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {c.status === "active" ? (
                      <span className="text-xs font-bold font-mono text-[#00B894]">
                        {c.creators} creators
                      </span>
                    ) : (
                      <span className="text-xs font-bold font-mono text-[#FF9F43]">
                        {c.pending} pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent submissions table */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3050]">
            <h2 className="text-sm font-bold text-[#E2E8F0]">Recent Submissions</h2>
            <button className="text-xs text-[#6C5CE7] hover:underline flex items-center gap-1">
              View All <ExternalLink size={11} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2A3050]">
                  {["Creator", "Campaign", "Channel", "Status", "Reach", "Actions"].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-[#8892A8] font-semibold uppercase tracking-widest text-[10px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#2A3050] last:border-0 hover:bg-[#0B0F1A] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {row.creator.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-[#E2E8F0]">{row.creator}</p>
                          <p className="text-[#8892A8] text-[10px]">{row.followers} followers</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#8892A8]">{row.campaign}</td>
                    <td className="px-5 py-3">
                      <ChannelChip channel={row.channel} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-5 py-3 font-mono text-[#E2E8F0]">{row.reach}</td>
                    <td className="px-5 py-3">
                      {row.status === "In Review" ? (
                        <button className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          Review
                        </button>
                      ) : (
                        <button className="border border-[#2A3050] hover:bg-[#1A2035] text-[#E2E8F0] font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
