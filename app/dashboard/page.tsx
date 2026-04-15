"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  Layers,
  Users,
  TrendingDown,
  Plus,
  Inbox,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"
import { DepositModal } from "@/components/deposit-modal"

interface Campaign {
  id: string
  title: string
  status: string
  type: "CLIPPING" | "STANDARD"
  channels: string[]
  total_budget: number
  remaining_budget: number
  created_at: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string | null
  created_at: string
}

interface BalancePayload {
  available: number
  pending: number
  currency: string
  lifetimeEarnings: number
  transactions: Transaction[]
}

function fmtMoney(n: number) {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<BalancePayload | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [br, cr] = await Promise.all([
        fetch("/api/users/me/balance", { cache: "no-store" }),
        fetch("/api/campaigns?mine=1&pageSize=50", { cache: "no-store" }),
      ])
      const [bj, cj] = await Promise.all([br.json(), cr.json()])
      if (!br.ok) throw new Error(bj?.error?.message || "Failed to load balance")
      if (!cr.ok) throw new Error(cj?.error?.message || "Failed to load campaigns")
      setBalance(bj)
      setCampaigns(cj.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const loading = !balance || !campaigns

  if (loading && !error) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav mode="brand" />
        <main className="flex-1 px-6 py-6 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[#6C5CE7]" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav mode="brand" />
        <main className="flex-1 px-6 py-6">
          <EmptyState icon={AlertCircle} title="Couldn't load dashboard" description={error} />
        </main>
      </div>
    )
  }

  const activeCampaigns = (campaigns ?? []).filter((c) => c.status === "ACTIVE")
  const totalBudget = (campaigns ?? []).reduce((s, c) => s + Number(c.total_budget), 0)
  const totalSpent = (campaigns ?? []).reduce(
    (s, c) => s + (Number(c.total_budget) - Number(c.remaining_budget)),
    0,
  )

  const channelSpend = new Map<string, number>()
  for (const c of campaigns ?? []) {
    const spent = Number(c.total_budget) - Number(c.remaining_budget)
    if (spent <= 0) continue
    const share = spent / Math.max(1, c.channels.length)
    for (const ch of c.channels) channelSpend.set(ch, (channelSpend.get(ch) ?? 0) + share)
  }
  const channelEntries = Array.from(channelSpend.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const channelMax = Math.max(1, ...channelEntries.map((e) => e[1]))

  const topStats = [
    {
      label: "Available Balance",
      value: fmtMoney(balance?.available ?? 0),
      sub: (balance?.available ?? 0) < 500 ? "Low balance. Top up to fund new campaigns." : "Ready to fund campaigns.",
      icon: DollarSign,
      iconColor: "#00B894",
    },
    {
      label: "Total Spent",
      value: fmtMoney(totalSpent),
      sub: "Across all campaigns",
      icon: TrendingDown,
      iconColor: "#6C5CE7",
    },
    {
      label: "Total Committed",
      value: fmtMoney(totalBudget),
      sub: "Budget committed to campaigns",
      icon: Layers,
      iconColor: "#4ECDC4",
    },
    {
      label: "Active Campaigns",
      value: String(activeCampaigns.length),
      sub: `${(campaigns ?? []).length} total`,
      icon: Users,
      iconColor: "#FF9F43",
    },
  ]

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="brand" />

      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Brand Dashboard</h1>
            <p className="text-sm text-[#8892A8]">Balance, campaigns, and spend at a glance.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDepositOpen(true)}
              className="bg-[#131825] border border-[#2A3050] hover:border-[#6C5CE7] text-[#E2E8F0] text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus size={14} /> Deposit
            </button>
            <Link
              href="/campaign-builder"
              className="bg-[#FF6B35] hover:bg-[#e55a25] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Layers size={14} />
              New Campaign
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Spend by Channel</h2>
            {channelEntries.length === 0 ? (
              <EmptyState
                icon={TrendingDown}
                title="No spend yet"
                description="Chart activates after your first campaign delivers."
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {channelEntries.map(([channel, amount]) => (
                  <div key={channel}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#E2E8F0] font-semibold">{channel}</span>
                      <span className="font-mono text-[#8892A8]">{fmtMoney(amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#2A3050] overflow-hidden">
                      <div
                        className="h-full bg-[#6C5CE7]"
                        style={{ width: `${Math.round((amount / channelMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#E2E8F0]">Active Campaigns</h2>
              <Link href="/campaigns" className="text-xs text-[#6C5CE7] hover:underline font-semibold">
                View all
              </Link>
            </div>
            {activeCampaigns.length === 0 ? (
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
            ) : (
              <div className="space-y-2">
                {activeCampaigns.slice(0, 5).map((c) => {
                  const spent = Number(c.total_budget) - Number(c.remaining_budget)
                  const pct = Number(c.total_budget) > 0 ? (spent / Number(c.total_budget)) * 100 : 0
                  return (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.id}/manage`}
                      className="block p-3 rounded-lg bg-[#0B0F1A] border border-[#2A3050] hover:border-[#6C5CE7] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-[#E2E8F0] truncate">{c.title}</p>
                        <span className="text-[10px] font-mono text-[#8892A8]">
                          {fmtMoney(spent)} / {fmtMoney(c.total_budget)}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-[#2A3050] overflow-hidden">
                        <div className="h-full bg-[#6C5CE7]" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Recent Transactions</h2>
          {(balance?.transactions ?? []).length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No transactions yet"
              description="Deposits, escrow holds, and payouts will appear here."
            />
          ) : (
            <div className="space-y-2">
              {(balance?.transactions ?? []).slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-[#2A3050]/50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6C5CE720] text-[#6C5CE7]">
                      {t.type.replace("_", " ")}
                    </span>
                    <span className="text-[#E2E8F0] truncate">{t.description ?? "-"}</span>
                  </div>
                  <span className="font-mono font-semibold text-[#E2E8F0]">
                    {fmtMoney(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DepositModal open={depositOpen} onOpenChange={setDepositOpen} onDone={load} />
      </main>
    </div>
  )
}
