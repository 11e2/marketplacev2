"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Zap, Sparkles, TrendingUp, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState, SkeletonCard } from "@/components/empty-state"
import { VerifiedBadge } from "@/components/verified-badge"

const filterPills = ["All", "Clipping", "TikTok", "Reels", "Shorts", "YouTube", "Twitter/X", "Discord", "Newsletter", "Podcast"]
const PAGE_SIZE = 12

interface Campaign {
  id: string
  title: string
  description: string
  type: "CLIPPING" | "STANDARD"
  status: "ACTIVE"
  channels: string[]
  cpm: number | null
  total_budget: number
  remaining_budget: number
  brand_asset_url: string | null
  accent_color: string | null
  owner: { name: string | null; avatar_url: string | null } | null
  spotsRemaining: number | null
  percentBudgetUsed: number
  brand_is_verified?: boolean | null
}

function MarketplaceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlFilter = searchParams.get("filter") ?? "All"
  const urlSearch = searchParams.get("q") ?? ""

  const [activeFilter, setActiveFilter] = useState(urlFilter)
  const [searchInput, setSearchInput] = useState(urlSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)

  const [items, setItems] = useState<Campaign[] | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const sp = new URLSearchParams()
    if (activeFilter !== "All") sp.set("filter", activeFilter)
    if (debouncedSearch) sp.set("q", debouncedSearch)
    const qs = sp.toString()
    router.replace(qs ? `/marketplace?${qs}` : "/marketplace", { scroll: false })
  }, [activeFilter, debouncedSearch, router])

  const buildParams = useCallback(
    (pageNum: number) => {
      const qs = new URLSearchParams()
      if (activeFilter === "Clipping") qs.set("type", "CLIPPING")
      else if (activeFilter !== "All") qs.set("channels", activeFilter)
      if (debouncedSearch) qs.set("search", debouncedSearch)
      qs.set("page", String(pageNum))
      qs.set("pageSize", String(PAGE_SIZE))
      return qs
    },
    [activeFilter, debouncedSearch],
  )


  const reqIdRef = useRef(0)

  useEffect(() => {
    const id = ++reqIdRef.current
    setLoading(true)
    setError(null)
    setItems(null)
    setPage(1)

    fetch(`/api/campaigns?${buildParams(1)}`, { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(json?.error?.message || "Failed to load campaigns")
        return json
      })
      .then((json) => {
        if (reqIdRef.current !== id) return
        setItems(json.items ?? [])
        setTotal(json.pagination?.total ?? (json.items?.length ?? 0))
        setHasMore(Boolean(json.pagination?.hasMore))
      })
      .catch((e) => {
        if (reqIdRef.current !== id) return
        setError(e.message || "Failed to load campaigns")
        setItems([])
      })
      .finally(() => {
        if (reqIdRef.current === id) setLoading(false)
      })
  }, [buildParams, retryNonce])

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const next = page + 1
    try {
      const r = await fetch(`/api/campaigns?${buildParams(next)}`, { cache: "no-store" })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(json?.error?.message || "Failed to load more")
      setItems((prev) => [...(prev ?? []), ...(json.items ?? [])])
      setPage(next)
      setHasMore(Boolean(json.pagination?.hasMore))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more")
    } finally {
      setLoadingMore(false)
    }
  }

  const list = useMemo(() => items ?? [], [items])

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#0B0F1A]/90 backdrop-blur border-b border-[#2A3050] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892A8]" />
              <input
                type="text"
                placeholder="Search campaigns, brands, channels..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search campaigns"
                className="w-full bg-[#131825] border border-[#2A3050] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                aria-pressed={activeFilter === pill}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
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
                <span className="text-sm text-[#8892A8]">
                  {loading
                    ? "Loading..."
                    : total > 0
                      ? `Showing ${list.length} of ${total}`
                      : "0 available"}
                </span>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : error ? (
                <EmptyState
                  icon={AlertCircle}
                  title="Couldn't load campaigns"
                  description={error}
                  action={
                    <button
                      onClick={() => setRetryNonce((n) => n + 1)}
                      className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  }
                />
              ) : list.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No campaigns found"
                  description={
                    debouncedSearch || activeFilter !== "All"
                      ? "Try a different search or filter."
                      : "Campaigns will appear here as brands publish them."
                  }
                  action={
                    debouncedSearch || activeFilter !== "All" ? (
                      <button
                        onClick={() => {
                          setSearchInput("")
                          setDebouncedSearch("")
                          setActiveFilter("All")
                        }}
                        className="bg-[#131825] border border-[#2A3050] hover:border-[#6C5CE7] text-[#E2E8F0] text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Clear filters
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {list.map((c) => (
                      <Link
                        key={c.id}
                        href={`/campaign/${c.id}`}
                        className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden hover:border-[#6C5CE7] transition-colors"
                      >
                        <div className="h-1" style={{ backgroundColor: c.accent_color || "#6C5CE7" }} />
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
                              <span className="text-xs font-semibold text-[#E2E8F0] truncate inline-flex items-center gap-1">
                                {c.owner?.name || "Brand"}
                                <VerifiedBadge verified={c.brand_is_verified} size={11} />
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
                            <ArrowRight size={16} className="text-[#6C5CE7]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="bg-[#131825] border border-[#2A3050] hover:border-[#6C5CE7] text-sm font-semibold text-[#E2E8F0] px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60"
                      >
                        {loadingMore && <Loader2 size={14} className="animate-spin" />}
                        {loadingMore ? "Loading..." : "Load more"}
                      </button>
                    </div>
                  )}
                </>
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

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[#6C5CE7]" />
        </div>
      }
    >
      <MarketplaceInner />
    </Suspense>
  )
}
