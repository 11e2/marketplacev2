"use client"

import { useState } from "react"
import { Plus, Pause, Trash2, Pencil, Users, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"

const initialServices = [
  {
    id: 1,
    platform: "TikTok",
    handle: "@alexk_gaming",
    accentColor: "#6C5CE7",
    stat1: "385K followers",
    stat2: "8.4% engagement",
    active: true,
    offerings: [
      { name: "Product Demo (30-60s)", price: "$200" },
      { name: "Brand Integration Clip", price: "$350" },
      { name: "Dedicated Review", price: "$500" },
      { name: "Clip with Overlay", price: "$0.15/100K views" },
    ],
  },
  {
    id: 2,
    platform: "Discord",
    handle: "AlexK Gaming",
    accentColor: "#4ECDC4",
    stat1: "28K members",
    stat2: "42% daily active",
    active: true,
    offerings: [
      { name: "Pinned Post (24hr)", price: "$100" },
      { name: "Weekly Sponsorship", price: "$400" },
      { name: "Server Branding (monthly)", price: "$1,200" },
      { name: "Bot Integration", price: "Custom" },
    ],
  },
  {
    id: 3,
    platform: "YouTube",
    handle: "@AlexKowalski",
    accentColor: "#FF4444",
    stat1: "142K subscribers",
    stat2: "5.1% avg view rate",
    active: true,
    offerings: [
      { name: "Preroll (60-90s)", price: "$600" },
      { name: "Mid-Roll Integration", price: "$800" },
      { name: "Dedicated Video", price: "$2,500" },
      { name: "YouTube Shorts", price: "$250" },
    ],
  },
  {
    id: 4,
    platform: "Twitter/X",
    handle: "@alexk",
    accentColor: "#94A3B8",
    stat1: "67K followers",
    stat2: "3.2% engagement",
    active: true,
    offerings: [
      { name: "Single Tweet", price: "$120" },
      { name: "Thread (5-7 tweets)", price: "$350" },
      { name: "Retweet + Quote", price: "$75" },
    ],
  },
  {
    id: 5,
    platform: "Podcast",
    handle: "GamerTalk",
    accentColor: "#FF9F43",
    stat1: "22K listeners/ep",
    stat2: "Top 5% gaming",
    active: true,
    offerings: [
      { name: "Pre-Roll Read (30s)", price: "$300" },
      { name: "Mid-Roll Read (60s)", price: "$500" },
      { name: "Dedicated Episode", price: "$2,000" },
    ],
  },
  {
    id: 6,
    platform: "Instagram",
    handle: "@alexk_",
    accentColor: "#E91E8C",
    stat1: "95K followers",
    stat2: "6.8% engagement",
    active: true,
    offerings: [
      { name: "Story (3 slides)", price: "$180" },
      { name: "Reel", price: "$300" },
      { name: "Carousel Post", price: "$250" },
    ],
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState(initialServices)

  const togglePause = (id: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    )
    const svc = services.find((s) => s.id === id)
    if (svc) {
      toast.success(svc.active ? `${svc.platform} service paused` : `${svc.platform} service resumed`)
    }
  }

  const deleteService = (id: number) => {
    const svc = services.find((s) => s.id === id)
    setServices((prev) => prev.filter((s) => s.id !== id))
    if (svc) {
      toast.success(`${svc.platform} service deleted`)
    }
  }

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">My Services</h1>
            <p className="text-sm text-[#8892A8]">Manage your service listings across all platforms</p>
          </div>
          <button
            onClick={() => toast.info("Service creation form coming soon")}
            className="flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={14} />
            Add New Service
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden transition-all"
              style={{ opacity: svc.active ? 1 : 0.6 }}
            >
              <div className="h-1" style={{ backgroundColor: svc.accentColor }} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#E2E8F0]">{svc.platform}</span>
                  <div className="flex items-center gap-1">
                    {!svc.active && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF9F4320] text-[#FF9F43]">
                        Paused
                      </span>
                    )}
                    <span className="text-xs font-semibold" style={{ color: svc.accentColor }}>{svc.handle}</span>
                  </div>
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
                      <span className="font-bold font-mono text-[#00B894]">{o.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => toast.info("Edit form coming soon")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#2A3050] hover:bg-[#1A2035] text-xs font-semibold text-[#E2E8F0] transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => togglePause(svc.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#FF9F4340] hover:bg-[#FF9F4315] text-xs font-semibold text-[#FF9F43] transition-colors"
                  >
                    <Pause size={12} />
                    {svc.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#FF6B6B40] hover:bg-[#FF6B6B15] text-xs font-semibold text-[#FF6B6B] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
