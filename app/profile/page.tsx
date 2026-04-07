"use client"

import Link from "next/link"
import { Star, MessageSquare, Send, CheckCircle, Users, Clock, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"

const services = [
  {
    platform: "TikTok",
    handle: "@alexk_gaming",
    accentColor: "#6C5CE7",
    stat1: "385K followers",
    stat2: "8.4% engagement",
    offerings: [
      { name: "Product Demo (30-60s)", price: "$200" },
      { name: "Brand Integration Clip", price: "$350" },
      { name: "Dedicated Review", price: "$500" },
      { name: "Clip with Overlay", price: "$0.15/100K views" },
    ],
  },
  {
    platform: "Discord",
    handle: "AlexK Gaming",
    accentColor: "#4ECDC4",
    stat1: "28K members",
    stat2: "42% daily active",
    offerings: [
      { name: "Pinned Post (24hr)", price: "$100" },
      { name: "Weekly Sponsorship", price: "$400" },
      { name: "Server Branding (monthly)", price: "$1,200" },
      { name: "Bot Integration", price: "Custom" },
    ],
  },
  {
    platform: "YouTube",
    handle: "@AlexKowalski",
    accentColor: "#FF4444",
    stat1: "142K subscribers",
    stat2: "5.1% avg view rate",
    offerings: [
      { name: "Preroll (60-90s)", price: "$600" },
      { name: "Mid-Roll Integration", price: "$800" },
      { name: "Dedicated Video", price: "$2,500" },
      { name: "YouTube Shorts", price: "$250" },
    ],
  },
  {
    platform: "Twitter/X",
    handle: "@alexk",
    accentColor: "#94A3B8",
    stat1: "67K followers",
    stat2: "3.2% engagement",
    offerings: [
      { name: "Single Tweet", price: "$120" },
      { name: "Thread (5-7 tweets)", price: "$350" },
      { name: "Retweet + Quote", price: "$75" },
    ],
  },
  {
    platform: "Podcast",
    handle: "GamerTalk",
    accentColor: "#FF9F43",
    stat1: "22K listeners/ep",
    stat2: "Top 5% gaming",
    offerings: [
      { name: "Pre-Roll Read (30s)", price: "$300" },
      { name: "Mid-Roll Read (60s)", price: "$500" },
      { name: "Dedicated Episode", price: "$2,000" },
    ],
  },
  {
    platform: "Instagram",
    handle: "@alexk_",
    accentColor: "#E91E8C",
    stat1: "95K followers",
    stat2: "6.8% engagement",
    offerings: [
      { name: "Story (3 slides)", price: "$180" },
      { name: "Reel", price: "$300" },
      { name: "Carousel Post", price: "$250" },
    ],
  },
]

const reviews = [
  {
    brand: "NordVPN",
    brandInitial: "N",
    brandColor: "#6C5CE7",
    rating: 5,
    text: "Alex delivered an incredibly natural TikTok integration. The engagement on the post was 3x our benchmark -- we'll definitely work together again.",
    date: "2 weeks ago",
  },
  {
    brand: "Shopify",
    brandInitial: "S",
    brandColor: "#00B894",
    rating: 5,
    text: "Highly professional, fast turnaround, and the Discord community response was phenomenal. The bot integration was beyond what we expected.",
    date: "1 month ago",
  },
  {
    brand: "Athletic Greens",
    brandInitial: "A",
    brandColor: "#FF9F43",
    rating: 4,
    text: "The podcast read felt authentic and the listener response was strong. Would recommend for any health-adjacent brand in the gaming space.",
    date: "6 weeks ago",
  },
]

export default function ProfilePage() {
  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-5xl">
        {/* Profile header */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#E2E8F0]">Alex Kowalski</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00B89420] text-[#00B894]">
                  <CheckCircle size={10} className="inline mr-1" />
                  Verified
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#6C5CE720] text-[#6C5CE7]">
                  Top 5%
                </span>
              </div>
              <p className="text-[#8892A8] text-sm mb-4">Gaming, Tech &amp; Crypto Creator</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: CheckCircle, label: "Completed Deals", value: "127", color: "#00B894" },
                  { icon: Star, label: "Avg Rating", value: "4.9/5.0", color: "#FF9F43" },
                  { icon: Clock, label: "Response Time", value: "< 2 hrs", color: "#4ECDC4" },
                  { icon: Users, label: "Total Reach", value: "840K", color: "#6C5CE7" },
                ].map((s) => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="bg-[#0B0F1A] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={12} style={{ color: s.color }} />
                        <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">{s.label}</p>
                      </div>
                      <p className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toast.info("Offer form coming soon")}
                className="flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Send size={14} />
                Send Offer
              </button>
              <Link
                href="/messaging"
                className="flex items-center gap-2 border border-[#2A3050] hover:bg-[#1A2035] text-[#E2E8F0] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <MessageSquare size={14} />
                Message
              </Link>
            </div>
          </div>
        </div>

        {/* Services */}
        <h2 className="text-base font-bold text-[#E2E8F0] mb-4">Available Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {services.map((svc) => (
            <div
              key={svc.platform}
              className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden hover:border-[#6C5CE7]/40 hover:shadow-lg transition-all"
            >
              <div className="h-1" style={{ backgroundColor: svc.accentColor }} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#E2E8F0]">{svc.platform}</span>
                  <span className="text-xs font-semibold" style={{ color: svc.accentColor }}>{svc.handle}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8892A8] mb-3">
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {svc.stat1}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={11} /> {svc.stat2}
                  </span>
                </div>
                <div className="border-t border-[#2A3050] pt-3 space-y-2">
                  {svc.offerings.map((o) => (
                    <div key={o.name} className="flex items-center justify-between text-xs">
                      <span className="text-[#8892A8]">{o.name}</span>
                      <span className="font-bold font-mono" style={{ color: "#00B894" }}>{o.price}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("Booking request sent!")}
                  className="w-full mt-4 py-2 rounded-lg text-xs font-bold text-white transition-colors"
                  style={{ backgroundColor: svc.accentColor }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <h2 className="text-base font-bold text-[#E2E8F0] mb-4">Brand Reviews</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div key={r.brand} className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: r.brandColor }}
                >
                  {r.brandInitial}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#E2E8F0]">{r.brand}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={10} fill="#FF9F43" stroke="none" />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-[10px] text-[#8892A8]">{r.date}</span>
              </div>
              <p className="text-xs text-[#8892A8] leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
