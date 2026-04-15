"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Handshake, DollarSign } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState, SkeletonCard } from "@/components/empty-state"

type DealStatus =
  | "NEGOTIATING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "APPROVED"
  | "DISPUTED"
  | "COMPLETED"
  | "CANCELLED"

interface Deal {
  id: string
  campaign_id: string | null
  brand_user_id: string
  creator_user_id: string
  status: DealStatus
  agreed_rate: number
  rate_type: "CPM" | "FLAT" | "DAILY"
  escrow_amount: number
  escrow_status: string | null
  deadline: string | null
  created_at: string
  completed_at: string | null
  campaign: { id: string; title: string; type: string; channels: string[] } | null
  brand: { id: string; name: string | null; avatar_url: string | null } | null
  creator: { id: string; name: string | null; avatar_url: string | null } | null
}

const STATUS_COLORS: Record<DealStatus, { bg: string; color: string }> = {
  NEGOTIATING: { bg: "#FF9F4320", color: "#FF9F43" },
  ACCEPTED: { bg: "#6C5CE720", color: "#6C5CE7" },
  IN_PROGRESS: { bg: "#6C5CE720", color: "#6C5CE7" },
  DELIVERED: { bg: "#4ECDC420", color: "#4ECDC4" },
  APPROVED: { bg: "#00B89420", color: "#00B894" },
  COMPLETED: { bg: "#00B89420", color: "#00B894" },
  DISPUTED: { bg: "#FF6B6B20", color: "#FF6B6B" },
  CANCELLED: { bg: "#8892A820", color: "#8892A8" },
}

const TABS: { key: "all" | DealStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "NEGOTIATING", label: "Negotiating" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "COMPLETED", label: "Completed" },
]

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"all" | DealStatus>("all")

  useEffect(() => {
    setError(null)
    fetch("/api/deals", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.error?.message || "Failed to load deals")
        return j
      })
      .then((j) => setDeals(j.items ?? []))
      .catch((e) => {
        setError(e.message || "Failed to load deals")
        setDeals([])
      })
  }, [])

  const filtered = useMemo(() => {
    if (!deals) return []
    if (tab === "all") return deals
    return deals.filter((d) => d.status === tab)
  }, [deals, tab])

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#E2E8F0]">Deals</h1>
          <p className="text-sm text-[#8892A8]">Track negotiations, escrow, and deliverables.</p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={
                tab === t.key
                  ? { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7", color: "#fff" }
                  : { backgroundColor: "#131825", borderColor: "#2A3050", color: "#8892A8" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {deals === null ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Couldn't load deals" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="No deals yet"
            description="Deals appear here when a brand accepts your application, or when you accept a creator."
            action={
              <Link
                href="/marketplace"
                className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => {
              const meta = STATUS_COLORS[d.status]
              const counterparty = d.brand?.name || d.creator?.name || "Unknown"
              return (
                <Link
                  key={d.id}
                  href={`/deals/${d.id}`}
                  className="block bg-[#131825] border border-[#2A3050] rounded-2xl p-5 hover:border-[#6C5CE7] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {d.status.replace("_", " ")}
                        </span>
                        {d.campaign?.type && (
                          <span className="text-[10px] font-mono text-[#8892A8]">{d.campaign.type}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#E2E8F0] mb-0.5 truncate">
                        {d.campaign?.title || "Direct offer"}
                      </h3>
                      <p className="text-xs text-[#8892A8] mb-2 truncate">with {counterparty}</p>
                      <div className="flex items-center gap-4 text-xs text-[#8892A8]">
                        <span className="inline-flex items-center gap-1">
                          <DollarSign size={12} />
                          <span className="font-mono font-semibold text-[#E2E8F0]">
                            ${Number(d.agreed_rate).toLocaleString()}
                          </span>
                          <span className="text-[#8892A8]">{d.rate_type}</span>
                        </span>
                        {d.deadline && (
                          <span className="text-[#8892A8]">
                            Due {new Date(d.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
