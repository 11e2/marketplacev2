"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowDownToLine, Wallet, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip, StatusPill } from "@/components/channel-chip"
import { earningsData, channelBreakdown, transactions } from "@/lib/data"

const timeRanges = ["7d", "30d", "90d", "12m", "All"]

const earningsDataByRange: Record<string, typeof earningsData> = {
  "7d": earningsData.slice(-5),
  "30d": earningsData,
  "90d": earningsData,
  "12m": earningsData,
  "All": earningsData,
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string; color: string }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((s, p) => s + p.value, 0)
    return (
      <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl px-3 py-2.5 text-xs text-[#E2E8F0] shadow-xl">
        <p className="font-bold mb-1.5">{label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[#8892A8] capitalize">{p.dataKey}</span>
            </div>
            <span className="font-mono font-bold" style={{ color: p.color }}>${p.value}</span>
          </div>
        ))}
        <div className="border-t border-[#2A3050] mt-1.5 pt-1.5 flex justify-between">
          <span className="text-[#8892A8]">Total</span>
          <span className="font-mono font-bold text-[#E2E8F0]">${total}</span>
        </div>
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2035] border border-[#2A3050] rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="font-bold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="font-mono text-[#E2E8F0]">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

function exportCSV() {
  const headers = ["Date", "Description", "Channel", "Type", "Amount", "Status"]
  const rows = transactions.map((t) => [t.date, t.description, t.channel, t.type, t.amount, t.status])
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "transactions.csv"
  link.click()
  URL.revokeObjectURL(url)
  toast.success("CSV downloaded!")
}

export default function EarningsPage() {
  const [activeRange, setActiveRange] = useState("30d")
  const chartData = earningsDataByRange[activeRange]

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Earnings & Payouts</h1>
            <p className="text-sm text-[#8892A8]">Your financial overview - April 2026</p>
          </div>
          <button
            onClick={() => toast.info("Withdrawal modal coming soon")}
            className="bg-[#FF6B35] hover:bg-[#e55a25] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <ArrowDownToLine size={14} />
            Withdraw
          </button>
        </div>

        {/* Balance cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5 col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={14} className="text-[#00B894]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Available Balance</p>
            </div>
            <p className="text-4xl font-bold font-mono text-[#00B894]">$4,280.50</p>
            <button
              onClick={() => toast.info("Withdrawal modal coming soon")}
              className="mt-4 w-full bg-[#00B894] hover:bg-[#009b7e] text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownToLine size={14} />
              Withdraw $4,280.50
            </button>
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[#FF9F43]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Pending</p>
            </div>
            <p className="text-3xl font-bold font-mono text-[#FF9F43]">$850.00</p>
            <p className="text-xs text-[#8892A8] mt-2">2 deals awaiting approval</p>
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[#6C5CE7]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">This Month</p>
            </div>
            <p className="text-3xl font-bold font-mono text-[#E2E8F0]">$3,420.00</p>
            <p className="text-xs text-[#00B894] mt-2">+23% from last month</p>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0]">Revenue Over Time</h2>
              <div className="flex items-center gap-4 mt-2">
                {[
                  { label: "Deal Payments", color: "#6C5CE7" },
                  { label: "Clipping", color: "#4ECDC4" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#8892A8]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
              {timeRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                  style={
                    activeRange === r
                      ? { backgroundColor: "#6C5CE7", color: "#fff" }
                      : { color: "#8892A8", backgroundColor: "transparent" }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="deals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clipping" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="deals"
                stackId="1"
                stroke="#6C5CE7"
                fill="url(#deals)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clipping"
                stackId="1"
                stroke="#4ECDC4"
                fill="url(#clipping)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Channel breakdown (donut) */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">By Channel</h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 flex-1">
                {channelBreakdown.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-xs text-[#8892A8]">{c.name}</span>
                    </div>
                    <span className="text-xs font-bold font-mono" style={{ color: c.color }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payout settings */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Payout Settings</h2>
            <div className="space-y-3">
              {[
                { label: "Method", value: "Solana (USDC)" },
                { label: "Wallet", value: "0x4a8b...f3c1" },
                { label: "Schedule", value: "Biweekly" },
                { label: "Min Threshold", value: "$100" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#2A3050] last:border-0">
                  <span className="text-xs text-[#8892A8]">{s.label}</span>
                  <span className="text-xs font-semibold font-mono text-[#E2E8F0]">{s.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast.info("Payout settings editor coming soon")}
              className="w-full mt-4 border border-[#2A3050] hover:bg-[#1A2035] text-sm font-semibold text-[#E2E8F0] py-2.5 rounded-xl transition-colors"
            >
              Edit Payout Settings
            </button>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2A3050] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#E2E8F0]">Transaction History</h2>
            <button onClick={exportCSV} className="text-xs text-[#6C5CE7] hover:underline">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2A3050]">
                  {["Date", "Description", "Channel", "Type", "Amount", "Status"].map((col) => (
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
                {transactions.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#2A3050] last:border-0 hover:bg-[#0B0F1A] transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-[#8892A8]">{t.date}</td>
                    <td className="px-5 py-3 text-[#E2E8F0] max-w-[200px] truncate">{t.description}</td>
                    <td className="px-5 py-3">
                      {t.channel === "-" ? (
                        <span className="text-[#8892A8]">-</span>
                      ) : (
                        <ChannelChip channel={t.channel} />
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#8892A8]">{t.type}</td>
                    <td className="px-5 py-3">
                      <span
                        className="font-bold font-mono"
                        style={{ color: t.amount.startsWith("+") ? "#00B894" : "#8892A8" }}
                      >
                        {t.amount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={t.status} />
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
