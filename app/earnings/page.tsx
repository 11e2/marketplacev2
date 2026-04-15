"use client"

import { ArrowDownToLine, Wallet, TrendingUp, Clock, Receipt } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"

export default function EarningsPage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Earnings & Payouts</h1>
            <p className="text-sm text-[#8892A8]">Your financial overview</p>
          </div>
          <button
            disabled
            className="bg-[#FF6B35]/40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed"
          >
            <ArrowDownToLine size={14} />
            Withdraw
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={14} className="text-[#00B894]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Available Balance</p>
            </div>
            <p className="text-4xl font-bold font-mono text-[#E2E8F0]">$0.00</p>
            <p className="text-xs text-[#8892A8] mt-3">Balance activates when your first deal closes.</p>
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[#FF9F43]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">Pending</p>
            </div>
            <p className="text-3xl font-bold font-mono text-[#E2E8F0]">$0.00</p>
            <p className="text-xs text-[#8892A8] mt-2">No deals awaiting approval.</p>
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[#6C5CE7]" />
              <p className="text-xs font-semibold text-[#8892A8] uppercase tracking-widest">This Month</p>
            </div>
            <p className="text-3xl font-bold font-mono text-[#E2E8F0]">$0.00</p>
            <p className="text-xs text-[#8892A8] mt-2">No earnings this period.</p>
          </div>
        </div>

        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Revenue Over Time</h2>
          <EmptyState
            icon={TrendingUp}
            title="Chart unlocks with your first earning"
            description="We plot daily revenue once deals start paying out."
            className="py-8"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">By Channel</h2>
            <EmptyState icon={TrendingUp} title="No channel data" description="Connect a social account to begin tracking." className="py-6" />
          </div>
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Payout Settings</h2>
            <EmptyState
              icon={Wallet}
              title="No payout method"
              description="Connect Stripe to receive payouts."
              className="py-6"
            />
          </div>
        </div>

        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Transaction History</h2>
          <EmptyState icon={Receipt} title="No transactions yet" description="Earnings, payouts, and fees will appear here." />
        </div>
      </main>
    </div>
  )
}
