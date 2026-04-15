"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, Zap, Sparkles, TrendingUp } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState, SkeletonCard } from "@/components/empty-state"

const filterPills = ["All", "Clipping", "TikTok", "Reels", "Shorts", "YouTube", "Twitter/X", "Discord", "Newsletter", "Podcast"]

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")
  // TODO(Phase 3): fetch from GET /api/campaigns
  const isLoading = false
  const campaigns: unknown[] = []

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
                <span className="text-sm text-[#8892A8]">{campaigns.length} available</span>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="No campaigns yet"
                  description="Campaigns will appear here as brands publish them. Check back soon."
                />
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
