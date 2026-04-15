"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Search, Filter, ChevronDown, Zap, Sparkles, TrendingUp } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState, SkeletonCard } from "@/components/empty-state"

const filterPills = ["All", "Clipping", "TikTok", "Reels", "Shorts", "YouTube", "Twitter/X", "Discord", "Newsletter", "Podcast"]

interface Campaign {
  id: string
  title: string
  description: string
  type: "CLIPPING" | "STANDARD"
  status: "ACTIVE"
  channels: string[]
  cpm: number | null
  total_budget: number
  brand_asset_url: string | null
  accent_color: string | null
  owner: { name: string | null; avatar_url: string | null } | null
  spotsRemaining: number | null
}

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)

  useEffect(() => {
    const qs = new URLSearchParams()
    if (activeFilter === "Clipping") qs.set("type", "CLIPPING")
    else if (activeFilter !== "All") qs.set("channel", activeFilter)
    if (search.trim()) qs.set("search", search.trim())

    const ctrl = new AbortController()
    const t = setTimeout(() => {
      setCampaigns(null)
      fetch(`/api/campaigns?${qs}`, { signal: ctrl.signal, cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((j) => setCampaigns(j.items ?? []))
        .catch((e) => {
          if (e.name !== "AbortError") setCampaigns([])
        })
    }, 200)
    return () => {
      ctrl.abort()
      clearTimeout(t)
    }
  }, [activeFilter, search])

  const isLoading = campaigns === null
  const items = useMemo(() => campaigns ?? [], [campaigns])

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#0B0F1A]/90 backdrop-blur border-b border-[#2A3050] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892A8]" />
              <input
                type="text"
                placeholder="Search campaigns, brands, channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#131825] border border-[#2A3050] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
              />
            </div>
            <button
              className="flex items-center gap-2 bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-2.5 text-sm text-[#8892A8] hover:border-[#6C5CE7] transition-colors"
            >
              <Filter size={14} />
              Filters
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5"
                style={
                  activeFilter === pill
                    ? { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7", color: "#fff" }
                    : { backgroundColor: "#131825", borderColor: "#2A3050", color: "#8892A8" }
                }
              >
                {pill === "Clipping" && <Zap size={12} />}
                {pill}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-1 min-w-0">
          <main className="flex-1 px-6 py-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#E2E8F0]">Campaigns</h2>
                <span className="text-sm text-[#8892A8]">{items.length} available</span>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No campaigns yet"
                  description="Campaigns will appear here as brands publish them. Check back soon."
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {items.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaign/${c.id}`}
                      className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden hover:border-[#6C5CE7] transition-colors"
                    >
                      <div
                        className="h-1"
                        style={{ backgroundColor: c.accent_color || "#6C5CE7" }}
                      />
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {c.owner?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.owner.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center text-[10px] font-bold">
                                {(c.owner?.name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-[#E2E8F0] truncate">
                              {c.owner?.name || "Brand"}
                            </span>
                          </div>
                          {c.type === "CLIPPING" && c.cpm != null && (
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#00B894]/20 text-[#00B894]">
                              CPM ${c.cpm}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-[#E2E8F0] mb-1 line-clamp-1">{c.title}</h3>
                        <p className="text-xs text-[#8892A8] line-clamp-2 mb-3">{c.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {c.channels.slice(0, 4).map((ch) => (
                            <span
                              key={ch}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#6C5CE7]/15 text-[#6C5CE7]"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[#2A3050] text-xs">
                          <span className="text-[#8892A8]">
                            Budget:{" "}
                            <span className="font-mono font-semibold text-[#E2E8F0]">
                              ${Number(c.total_budget).toLocaleString()}
                            </span>
                          </span>
                          <span className="bg-[#6C5CE7] text-white font-semibold px-3 py-1 rounded-md">
                            View
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-[#2A3050] px-5 py-6 gap-6">
            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Trending Channels</h2>
              <EmptyState
                icon={TrendingUp}
                title="No trends yet"
                description="Trending data arrives with live campaigns."
                className="py-6"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Your Match Score</h2>
              <EmptyState
                icon={Sparkles}
                title="Link an account"
                description="Match scores activate once you link a social account and we have campaigns to compare."
                className="py-6"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
