"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip } from "@/components/channel-chip"
import { campaigns, trendingChannels, matchScores } from "@/lib/data"

const filterPills = ["All", "TikTok", "YouTube", "Twitter/X", "Discord", "Newsletter", "Podcast", "Twitch", "Instagram", "More"]

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      search === "" ||
      c.brand.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      activeFilter === "All" ||
      c.channels.some((ch) => ch.toLowerCase().includes(activeFilter.toLowerCase()))
    return matchSearch && matchFilter
  })

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
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
            <button className="flex items-center gap-2 bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-2.5 text-sm text-[#8892A8] hover:border-[#6C5CE7] transition-colors">
              <Filter size={14} />
              Filters
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Channel filter pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                style={
                  activeFilter === pill
                    ? { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7", color: "#fff" }
                    : { backgroundColor: "#131825", borderColor: "#2A3050", color: "#8892A8" }
                }
              >
                {pill}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-1 min-w-0">
          {/* Main feed */}
          <main className="flex-1 px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-lg font-bold text-[#E2E8F0]">Brand Campaigns</h1>
              <span className="text-sm text-[#8892A8]">{filtered.length} available</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#8892A8]">
                <Search size={32} className="mb-3 opacity-40" />
                <p className="font-medium">No campaigns found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </main>

          {/* Right sidebar */}
          <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-[#2A3050] px-5 py-6 gap-6">
            {/* Trending */}
            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Trending Channels</h2>
              <div className="space-y-2">
                {trendingChannels.map((ch) => (
                  <div key={ch.name} className="bg-[#131825] border border-[#2A3050] rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#E2E8F0]">{ch.name}</span>
                    <span className="text-xs font-bold font-mono" style={{ color: "#00B894" }}>{ch.growth}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Match scores */}
            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Your Match Score</h2>
              <div className="space-y-3">
                {matchScores.map((m) => (
                  <div key={m.campaign} className="bg-[#131825] border border-[#2A3050] rounded-xl p-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold font-mono border-2"
                      style={{ borderColor: m.color, color: m.color }}
                    >
                      {m.score}
                    </div>
                    <p className="text-xs text-[#8892A8] leading-snug">{m.campaign}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Your Stats</h2>
              <div className="space-y-2">
                {[
                  { label: "Completed Deals", value: "127" },
                  { label: "Avg Rating", value: "4.9/5.0" },
                  { label: "Response Time", value: "< 2 hrs" },
                  { label: "Total Reach", value: "840K" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-xs">
                    <span className="text-[#8892A8]">{s.label}</span>
                    <span className="font-semibold font-mono text-[#E2E8F0]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: (typeof campaigns)[0] }) {
  return (
    <div className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden hover:border-[#6C5CE7]/40 hover:shadow-lg hover:shadow-black/30 transition-all group cursor-pointer">
      {/* Accent bar */}
      <div className="h-1" style={{ backgroundColor: campaign.accentColor }} />

      <div className="p-5">
        {/* Brand header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: campaign.brandColor }}
            >
              {campaign.brandInitial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#E2E8F0]">{campaign.brand}</span>
                {campaign.verified && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#00B89420] text-[#00B894]">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Rate badge */}
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-[#00B89420] text-[#00B894] shrink-0">
            {campaign.rate}
          </span>
        </div>

        {/* Title & description */}
        <h3 className="text-sm font-bold text-[#E2E8F0] mb-1.5">{campaign.title}</h3>
        <p className="text-xs text-[#8892A8] leading-relaxed line-clamp-2 mb-3">{campaign.description}</p>

        {/* Channel chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {campaign.channels.map((ch) => (
            <ChannelChip key={ch} channel={ch} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2A3050]">
          <div className="flex items-center gap-4 text-xs text-[#8892A8]">
            <span>Budget: <span className="font-mono font-semibold text-[#E2E8F0]">{campaign.budget}</span></span>
            <span>{campaign.spots} spots left</span>
          </div>
          <button className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
