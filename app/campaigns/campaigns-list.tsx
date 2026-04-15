"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Circle } from "lucide-react"

type Status = "ALL" | "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED"

interface Campaign {
  id: string
  title: string
  description: string
  type: "CLIPPING" | "STANDARD"
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED"
  channels: string[]
  cpm: number | null
  total_budget: number
  remaining_budget: number
  spots: number | null
  spotsRemaining: number | null
  percentBudgetUsed: number
  brand_asset_url: string | null
  created_at: string
}

const TABS: Status[] = ["ALL", "ACTIVE", "DRAFT", "PAUSED", "COMPLETED"]

const statusStyle: Record<Campaign["status"], { bg: string; fg: string }> = {
  ACTIVE: { bg: "#00B89420", fg: "#00B894" },
  DRAFT: { bg: "#8892A820", fg: "#8892A8" },
  PAUSED: { bg: "#FF9F4320", fg: "#FF9F43" },
  COMPLETED: { bg: "#6C5CE720", fg: "#6C5CE7" },
}

export function CampaignsList({ initialStatus }: { initialStatus: string }) {
  const [tab, setTab] = useState<Status>(TABS.includes(initialStatus as Status) ? (initialStatus as Status) : "ALL")
  const [items, setItems] = useState<Campaign[] | null>(null)

  useEffect(() => {
    setItems(null)
    const qs = new URLSearchParams({ mine: "1" })
    if (tab !== "ALL") qs.set("status", tab)
    fetch(`/api/campaigns?${qs}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((j) => setItems(j.items ?? []))
      .catch(() => setItems([]))
  }, [tab])

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 border-b border-[#2A3050]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-[#6C5CE7] text-white"
                : "border-transparent text-[#8892A8] hover:text-white"
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {items === null ? (
        <p className="text-sm text-[#8892A8] py-8">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-12 text-center">
          <p className="text-sm text-[#8892A8]">
            No {tab === "ALL" ? "" : tab.toLowerCase() + " "}campaigns yet.{" "}
            <Link href="/campaign-builder" className="text-[#6C5CE7] font-semibold hover:underline">
              Create one
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((c) => {
            const st = statusStyle[c.status]
            return (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}/manage`}
                className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5 hover:border-[#6C5CE7] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5"
                    style={{ background: st.bg, color: st.fg }}
                  >
                    <Circle size={6} fill={st.fg} stroke="none" />
                    {c.status}
                  </span>
                  <span className="text-[10px] font-mono text-[#8892A8]">{c.type}</span>
                </div>
                <h3 className="font-bold text-white mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-xs text-[#8892A8] line-clamp-2 mb-4">{c.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8892A8]">Budget</span>
                    <span className="font-mono font-semibold text-white">
                      ${Number(c.total_budget).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#8892A8]">Spent</span>
                      <span className="font-mono text-[#00B894]">{c.percentBudgetUsed}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#2A3050] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00B894]"
                        style={{ width: `${c.percentBudgetUsed}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
