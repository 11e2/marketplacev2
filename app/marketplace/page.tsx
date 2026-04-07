"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Filter, ChevronDown, Zap, Users, Eye, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip } from "@/components/channel-chip"
import { campaigns, trendingChannels, matchScores } from "@/lib/data"
import type { Campaign } from "@/lib/types"

const filterPills = ["All", "Clipping", "TikTok", "Reels", "Shorts", "YouTube", "Twitter/X", "Discord", "Newsletter", "Podcast"]

export default function MarketplacePage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")

  // Separate clipping and non-clipping campaigns
  const clippingCampaigns = campaigns.filter((c) => c.isClipping)
  const otherCampaigns = campaigns.filter((c) => !c.isClipping)

  const filterCampaigns = (list: Campaign[]) => {
    return list.filter((c) => {
      const matchSearch =
        search === "" ||
        c.brand.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase())
      const matchFilter =
        activeFilter === "All" ||
        activeFilter === "Clipping" && c.isClipping ||
        c.channels.some((ch) => ch.toLowerCase().includes(activeFilter.toLowerCase()))
      return matchSearch && matchFilter
    })
  }

  const filteredClipping = filterCampaigns(clippingCampaigns)
  const filteredOther = filterCampaigns(otherCampaigns)

  const handleTrendingClick = (channelName: string) => {
    const channel = channelName.split(" ")[0]
    setActiveFilter(channel === "Podcast" ? "Podcast" : channel)
  }

  const handleMatchClick = (campaignName: string) => {
    const el = document.getElementById(`campaign-${campaignName}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add("ring-2", "ring-[#6C5CE7]")
      setTimeout(() => el.classList.remove("ring-2", "ring-[#6C5CE7]"), 2000)
    }
  }

  const handleApply = (campaign: Campaign) => {
    if (campaign.isClipping && campaign.brandAssetUrl) {
      // Navigate to video studio with campaign data
      const params = new URLSearchParams({
        campaignId: campaign.id.toString(),
        brand: campaign.brand,
        assetUrl: campaign.brandAssetUrl,
      })
      router.push(`/video-studio?${params.toString()}`)
    } else {
      // Non-clipping: just show toast (placeholder)
      toast.success("Application submitted! The brand will review your profile.")
    }
  }

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
            <button
              onClick={() => toast.info("Filters coming soon")}
              className="flex items-center gap-2 bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-2.5 text-sm text-[#8892A8] hover:border-[#6C5CE7] transition-colors"
            >
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
          {/* Main feed */}
          <main className="flex-1 px-6 py-6">
            {/* Clipping Campaigns Section */}
            {(activeFilter === "All" || activeFilter === "Clipping" || ["TikTok", "Reels", "Shorts"].includes(activeFilter)) && filteredClipping.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#6C5CE720] flex items-center justify-center">
                    <Zap size={16} className="text-[#6C5CE7]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#E2E8F0]">Clipping Campaigns</h2>
                    <p className="text-xs text-[#8892A8]">Upload your video, apply brand overlay, earn per view</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredClipping.map((campaign) => (
                    <ClippingCampaignCard key={campaign.id} campaign={campaign} onApply={handleApply} />
                  ))}
                </div>
              </section>
            )}

            {/* Other Campaigns Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#E2E8F0]">Other Campaigns</h2>
                <span className="text-sm text-[#8892A8]">{filteredOther.length} available</span>
              </div>

              {filteredOther.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#8892A8] bg-[#131825] border border-[#2A3050] rounded-xl">
                  <Search size={24} className="mb-2 opacity-40" />
                  <p className="text-sm">No campaigns found</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredOther.map((campaign) => (
                    <OtherCampaignCard key={campaign.id} campaign={campaign} onApply={handleApply} />
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Right sidebar */}
          <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-[#2A3050] px-5 py-6 gap-6">
            {/* Trending */}
            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Trending Channels</h2>
              <div className="space-y-2">
                {trendingChannels.map((ch) => (
                  <button
                    key={ch.name}
                    onClick={() => handleTrendingClick(ch.name)}
                    className="w-full bg-[#131825] border border-[#2A3050] rounded-xl p-3 flex items-center justify-between hover:border-[#6C5CE7]/40 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-[#E2E8F0]">{ch.name}</span>
                    <span className="text-xs font-bold font-mono" style={{ color: "#00B894" }}>{ch.growth}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Match scores */}
            <div>
              <h2 className="text-sm font-bold text-[#E2E8F0] mb-3">Your Match Score</h2>
              <div className="space-y-3">
                {matchScores.map((m) => (
                  <button
                    key={m.campaign}
                    onClick={() => handleMatchClick(m.campaign)}
                    className="w-full bg-[#131825] border border-[#2A3050] rounded-xl p-3 flex items-center gap-3 hover:border-[#6C5CE7]/40 transition-colors text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold font-mono border-2"
                      style={{ borderColor: m.color, color: m.color }}
                    >
                      {m.score}
                    </div>
                    <p className="text-xs text-[#8892A8] leading-snug">{m.campaign}</p>
                  </button>
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

function ClippingCampaignCard({ campaign, onApply }: { campaign: Campaign; onApply: (c: Campaign) => void }) {
  return (
    <div
      id={`campaign-${campaign.brand}`}
      className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden hover:border-[#6C5CE7]/60 hover:shadow-lg hover:shadow-[#6C5CE7]/10 transition-all group"
    >
      {/* Accent bar with gradient */}
      <div className="h-1.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF6B35]" />

      <div className="p-5">
        {/* Brand header with logo preview */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {campaign.brandAssetUrl ? (
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm">
                <Image
                  src={campaign.brandAssetUrl}
                  alt={campaign.brand}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                style={{ backgroundColor: campaign.brandColor }}
              >
                {campaign.brandInitial}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[#E2E8F0]">{campaign.brand}</span>
                {campaign.verified && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#00B89420] text-[#00B894]">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap size={12} className="text-[#6C5CE7]" />
                <span className="text-xs text-[#6C5CE7] font-semibold">Clipping Campaign</span>
              </div>
            </div>
          </div>
          {/* Rate badge */}
          <span className="text-sm font-bold font-mono px-3 py-1.5 rounded-lg bg-[#00B89420] text-[#00B894] shrink-0">
            {campaign.rate}
          </span>
        </div>

        {/* Title & description */}
        <h3 className="text-sm font-bold text-[#E2E8F0] mb-1.5">{campaign.title}</h3>
        <p className="text-xs text-[#8892A8] leading-relaxed line-clamp-2 mb-4">{campaign.description}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs">
            <Users size={12} className="text-[#8892A8]" />
            <span className="text-[#8892A8]">Min:</span>
            <span className="font-mono font-semibold text-[#E2E8F0]">{(campaign.minFollowers || 0).toLocaleString()} followers</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Eye size={12} className="text-[#8892A8]" />
            <span className="text-[#8892A8]">Min:</span>
            <span className="font-mono font-semibold text-[#E2E8F0]">{(campaign.minViews || 0).toLocaleString()} views</span>
          </div>
        </div>

        {/* Channel chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {campaign.channels.map((ch) => (
            <ChannelChip key={ch} channel={ch} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2A3050]">
          <div className="flex items-center gap-3 text-xs text-[#8892A8]">
            <span className="flex items-center gap-1">
              <DollarSign size={12} />
              Budget: <span className="font-mono font-semibold text-[#E2E8F0]">{campaign.budget}</span>
            </span>
            <span>{campaign.spots} spots left</span>
          </div>
          <button
            onClick={() => onApply(campaign)}
            className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Zap size={12} />
            Apply & Create
          </button>
        </div>
      </div>
    </div>
  )
}

function OtherCampaignCard({ campaign, onApply }: { campaign: Campaign; onApply: (c: Campaign) => void }) {
  return (
    <div
      id={`campaign-${campaign.brand}`}
      className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden hover:border-[#6C5CE7]/40 transition-all opacity-80 hover:opacity-100"
    >
      {/* Accent bar */}
      <div className="h-1" style={{ backgroundColor: campaign.accentColor }} />

      <div className="p-5">
        {/* Template badge */}
        <div className="mb-3">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#8892A820] text-[#8892A8] uppercase tracking-wide">
            Standard Campaign
          </span>
        </div>

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
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-[#8892A820] text-[#8892A8] shrink-0">
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
          <button
            onClick={() => onApply(campaign)}
            className="border border-[#2A3050] hover:border-[#6C5CE7] text-[#8892A8] hover:text-[#E2E8F0] text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
