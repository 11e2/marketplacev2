"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { BarChart2, Users, Eye, TrendingUp } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip } from "@/components/channel-chip"

const reachData = [
  { date: "Mar 8", reach: 42000 },
  { date: "Mar 10", reach: 58000 },
  { date: "Mar 12", reach: 45000 },
  { date: "Mar 14", reach: 78000 },
  { date: "Mar 16", reach: 62000 },
  { date: "Mar 18", reach: 55000 },
  { date: "Mar 20", reach: 95000 },
  { date: "Mar 22", reach: 88000 },
  { date: "Mar 24", reach: 72000 },
  { date: "Mar 26", reach: 85000 },
  { date: "Mar 28", reach: 110000 },
  { date: "Mar 30", reach: 98000 },
  { date: "Apr 1", reach: 125000 },
  { date: "Apr 3", reach: 92000 },
  { date: "Apr 5", reach: 130000 },
]

const engagementByChannel = [
  { channel: "TikTok", engagement: 8.4, color: "#6C5CE7" },
  { channel: "Discord", engagement: 12.1, color: "#4ECDC4" },
  { channel: "YouTube", engagement: 5.1, color: "#FF4444" },
  { channel: "Twitter/X", engagement: 3.2, color: "#94A3B8" },
  { channel: "Podcast", engagement: 6.8, color: "#FF9F43" },
  { channel: "Instagram", engagement: 6.5, color: "#E91E8C" },
]

const campaignPerformance = [
  { name: "NordVPN TikTok Campaign", channel: "TikTok", views: "182K", engRate: "8.4%", earnings: "$150.00" },
  { name: "Raid Shadow Legends YouTube", channel: "YouTube", views: "94K", engRate: "5.1%", earnings: "$600.00" },
  { name: "DeFi Protocol X Discord", channel: "Discord", views: "22K", engRate: "12.1%", earnings: "$75.00" },
  { name: "Shopify Twitter Thread", channel: "Twitter/X", views: "38K", engRate: "3.2%", earnings: "$300.00" },
  { name: "Athletic Greens Podcast", channel: "Podcast", views: "22K", engRate: "6.8%", earnings: "$400.00" },
  { name: "Morning Brew Newsletter", channel: "Newsletter", views: "14.2K", engRate: "4.5%", earnings: "$500.00" },
]

const ReachTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl px-3 py-2 text-xs text-[#E2E8F0] shadow-lg">
        <p className="font-bold mb-0.5">{label}</p>
        <p className="font-mono text-[#6C5CE7]">{(payload[0].value / 1000).toFixed(1)}K reach</p>
      </div>
    )
  }
  return null
}

const EngTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl px-3 py-2 text-xs text-[#E2E8F0] shadow-lg">
        <p className="font-bold mb-0.5">{label}</p>
        <p className="font-mono text-[#00B894]">{payload[0].value}% engagement</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />
      <main className="flex-1 min-w-0 px-6 py-6">
        <h1 className="text-xl font-bold text-[#E2E8F0] mb-6">Analytics</h1>

        {/* Top stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
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

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Reach over time */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-1">Reach Over Time</h2>
            <p className="text-xs text-[#8892A8] mb-4">Last 30 days</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={reachData}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#8892A8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis hide />
                <Tooltip content={<ReachTooltip />} />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="#6C5CE7"
                  fill="url(#reachGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement by channel */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-1">Engagement by Channel</h2>
            <p className="text-xs text-[#8892A8] mb-4">Average engagement rate (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementByChannel} barSize={28}>
                <XAxis
                  dataKey="channel"
                  tick={{ fill: "#8892A8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<EngTooltip />} cursor={{ fill: "rgba(108,92,231,0.08)" }} />
                <Bar dataKey="engagement" radius={[4, 4, 0, 0]}>
                  {engagementByChannel.map((entry) => (
                    <Cell key={entry.channel} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign performance table */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2A3050]">
            <h2 className="text-sm font-bold text-[#E2E8F0]">Per-Campaign Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2A3050]">
                  {["Campaign", "Channel", "Views", "Eng. Rate", "Earnings"].map((col) => (
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
                {campaignPerformance.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-[#2A3050] last:border-0 hover:bg-[#0B0F1A] transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold text-[#E2E8F0]">{row.name}</td>
                    <td className="px-5 py-3">
                      <ChannelChip channel={row.channel} />
                    </td>
                    <td className="px-5 py-3 font-mono text-[#E2E8F0]">{row.views}</td>
                    <td className="px-5 py-3 font-mono text-[#00B894]">{row.engRate}</td>
                    <td className="px-5 py-3 font-mono font-bold text-[#00B894]">{row.earnings}</td>
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
