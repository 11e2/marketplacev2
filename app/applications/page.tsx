"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Clock, CheckCircle2, XCircle, Inbox } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState, SkeletonCard } from "@/components/empty-state"

type Status = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"

interface ApplicationRow {
  id: string
  status: Status
  applied_at: string
  message: string | null
  campaign:
    | {
        id: string
        title: string
        type: "CLIPPING" | "STANDARD"
        channels: string[]
        accent_color: string | null
        status: string
        brand_user_id: string
      }
    | null
}

const STATUS_META: Record<Status, { label: string; color: string; bg: string; Icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "#FF9F43", bg: "#FF9F4320", Icon: Clock },
  ACCEPTED: { label: "Accepted", color: "#00B894", bg: "#00B89420", Icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "#FF6B6B", bg: "#FF6B6B20", Icon: XCircle },
  COMPLETED: { label: "Completed", color: "#6C5CE7", bg: "#6C5CE720", Icon: CheckCircle2 },
}

const TABS: (Status | "ALL")[] = ["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"]

export default function MyApplicationsPage() {
  const [apps, setApps] = useState<ApplicationRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Status | "ALL">("ALL")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const r = await fetch("/api/users/me/applications", { cache: "no-store" })
        const json = await r.json().catch(() => ({}))
        if (cancelled) return
        if (!r.ok) {
          setError(json?.error?.message || "Failed to load applications")
          setApps([])
          setLoading(false)
          return
        }
        setApps(json.items ?? [])
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load applications")
        setApps([])
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!apps) return []
    if (tab === "ALL") return apps
    return apps.filter((a) => a.status === tab)
  }, [apps, tab])

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: apps?.length ?? 0, PENDING: 0, ACCEPTED: 0, COMPLETED: 0, REJECTED: 0 }
    for (const a of apps ?? []) c[a.status] = (c[a.status] ?? 0) + 1
    return c
  }, [apps])

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#E2E8F0]">My Applications</h1>
          <p className="text-sm text-[#8892A8]">Track your campaign applications and status updates.</p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
              style={
                tab === t
                  ? { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7", color: "#fff" }
                  : { backgroundColor: "#131825", borderColor: "#2A3050", color: "#8892A8" }
              }
            >
              {t === "ALL" ? "All" : STATUS_META[t as Status].label}
              <span className="font-mono text-[10px] opacity-80">{counts[t] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Couldn't load applications" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={tab === "ALL" ? "No applications yet" : "No applications in this category"}
            description={
              tab === "ALL"
                ? "Browse the marketplace and apply to campaigns that fit your audience."
                : "Switch tabs to see applications in other states."
            }
            action={
              tab === "ALL" ? (
                <Link
                  href="/marketplace"
                  className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Browse Marketplace
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const meta = STATUS_META[a.status]
              const Icon = meta.Icon
              return (
                <Link
                  key={a.id}
                  href={a.campaign ? `/campaign/${a.campaign.id}` : "/marketplace"}
                  className={`block bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden hover:border-[#6C5CE7] transition-colors${!a.campaign || a.campaign.status !== "ACTIVE" ? " opacity-60" : ""}`}
                >
                  <div
                    className="h-1"
                    style={{ backgroundColor: a.campaign?.accent_color || "#6C5CE7" }}
                  />
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#E2E8F0] mb-1 truncate">
                        {a.campaign?.title || "Campaign unavailable"}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {a.campaign?.channels?.slice(0, 4).map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#6C5CE7]/15 text-[#6C5CE7]"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                      {a.message && (
                        <p className="text-xs text-[#8892A8] line-clamp-2 mb-2">{a.message}</p>
                      )}
                      <p className="text-[11px] text-[#8892A8] font-mono">
                        Applied {new Date(a.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      <Icon size={12} />
                      {meta.label}
                    </span>
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
