"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ArrowDownToLine,
  Wallet,
  TrendingUp,
  Clock,
  Receipt,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"
import { DepositModal } from "@/components/deposit-modal"
import { WithdrawModal } from "@/components/withdraw-modal"

interface Transaction {
  id: string
  type: "EARNING" | "PAYOUT" | "DEPOSIT" | "FEE" | "REFUND" | "ESCROW_HOLD" | "ESCROW_RELEASE"
  amount: number
  status: "PENDING" | "COMPLETED" | "FAILED"
  description: string | null
  reference: string | null
  related_deal_id: string | null
  created_at: string
}

interface BalancePayload {
  available: number
  pending: number
  currency: string
  lifetimeEarnings: number
  transactions: Transaction[]
}

const TYPE_COLORS: Record<Transaction["type"], string> = {
  EARNING: "#00B894",
  PAYOUT: "#6C5CE7",
  DEPOSIT: "#00B894",
  FEE: "#FF9F43",
  REFUND: "#4ECDC4",
  ESCROW_HOLD: "#8892A8",
  ESCROW_RELEASE: "#4ECDC4",
}

function fmtMoney(n: number) {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function exportCsv(transactions: Transaction[]) {
  const rows = [
    ["Date", "Type", "Amount", "Status", "Description", "Reference"],
    ...transactions.map((t) => [
      new Date(t.created_at).toISOString(),
      t.type,
      String(t.amount),
      t.status,
      (t.description ?? "").replace(/"/g, '""'),
      t.reference ?? "",
    ]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `transactions-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function EarningsPage() {
  const [data, setData] = useState<BalancePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const r = await fetch("/api/users/me/balance", { cache: "no-store" })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error?.message || "Failed to load balance")
      setData(j)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load balance")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav />
        <main className="flex-1 min-w-0 px-6 py-6 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[#6C5CE7]" />
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav />
        <main className="flex-1 min-w-0 px-6 py-6">
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load earnings"
            description={error ?? "Unknown error"}
          />
        </main>
      </div>
    )
  }

  const transactions = data.transactions ?? []

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Earnings and Payouts</h1>
            <p className="text-sm text-[#8892A8]">Your balance, transactions, and payouts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDepositOpen(true)}
              className="bg-[#131825] border border-[#2A3050] hover:border-[#6C5CE7] text-[#E2E8F0] text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus size={14} /> Deposit
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              disabled={data.available < 50}
              className="bg-[#6C5CE7] hover:bg-[#5a4dd4] disabled:bg-[#6C5CE7]/40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <ArrowDownToLine size={14} /> Withdraw
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={14} className="text-[#00B894]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Available Balance</p>
            </div>
            <p className="text-4xl font-bold font-mono text-[#E2E8F0]">{fmtMoney(data.available)}</p>
            <p className="text-xs text-[#8892A8] mt-3">
              {data.available >= 50
                ? "Ready to withdraw. Min $50."
                : "Minimum withdrawal: $50."}
            </p>
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[#FF9F43]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Pending</p>
            </div>
            <p className="text-3xl font-bold font-mono text-[#E2E8F0]">{fmtMoney(data.pending)}</p>
            <p className="text-xs text-[#8892A8] mt-2">Held in escrow or awaiting approval.</p>
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[#6C5CE7]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Lifetime Earnings</p>
            </div>
            <p className="text-3xl font-bold font-mono text-[#E2E8F0]">{fmtMoney(data.lifetimeEarnings)}</p>
            <p className="text-xs text-[#8892A8] mt-2">Across all completed deals.</p>
          </div>
        </div>

        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#E2E8F0]">Transaction History</h2>
            {transactions.length > 0 && (
              <button
                onClick={() => exportCsv(transactions)}
                className="text-xs text-[#6C5CE7] hover:underline font-semibold"
              >
                Export CSV
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Earnings, payouts, and fees will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[#8892A8] border-b border-[#2A3050]">
                    <th className="py-2 pr-4 font-semibold">Date</th>
                    <th className="py-2 pr-4 font-semibold">Type</th>
                    <th className="py-2 pr-4 font-semibold">Description</th>
                    <th className="py-2 pr-4 font-semibold text-right">Amount</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const color = TYPE_COLORS[t.type]
                    const signed =
                      t.type === "PAYOUT" || t.type === "FEE" || t.type === "ESCROW_HOLD"
                        ? `-${fmtMoney(t.amount)}`
                        : fmtMoney(t.amount)
                    return (
                      <tr key={t.id} className="border-b border-[#2A3050]/60 text-xs">
                        <td className="py-3 pr-4 text-[#8892A8] font-mono">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {t.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-[#E2E8F0]">{t.description ?? "-"}</td>
                        <td className="py-3 pr-4 font-mono font-semibold text-right text-[#E2E8F0]">
                          {signed}
                        </td>
                        <td className="py-3 text-[#8892A8] text-[11px]">{t.status}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DepositModal open={depositOpen} onOpenChange={setDepositOpen} onDone={load} />
        <WithdrawModal
          open={withdrawOpen}
          onOpenChange={setWithdrawOpen}
          available={data.available}
          onDone={load}
        />
      </main>
    </div>
  )
}
