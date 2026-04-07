"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Store,
  Layers,
  Handshake,
  Video,
  MessageSquare,
  BarChart2,
  Wallet,
  TrendingUp,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const creatorNav = [
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Linked Accounts", href: "/linked-accounts", icon: Link2 },
  { label: "Active Deals", href: "/messaging", icon: Handshake },
  { label: "Video Studio", href: "/video-studio", icon: Video },
  { label: "Messages", href: "/messaging", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Payouts", href: "/earnings", icon: Wallet },
]

const brandNav = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { label: "Campaigns", href: "/coming-soon", icon: Layers },
  { label: "New Campaign", href: "/campaign-builder", icon: TrendingUp },
  { label: "Creators", href: "/marketplace", icon: Store },
  { label: "Messages", href: "/messaging", icon: MessageSquare },
  { label: "Payouts", href: "/coming-soon", icon: Wallet },
]

interface SidebarNavProps {
  mode?: "creator" | "brand"
}

export function SidebarNav({ mode: initialMode = "creator" }: SidebarNavProps) {
  const pathname = usePathname()
  const [mode, setMode] = useState<"creator" | "brand">(initialMode)
  
  // Persist mode preference
  useEffect(() => {
    const stored = localStorage.getItem("marketingplace-mode")
    if (stored === "creator" || stored === "brand") {
      setMode(stored)
    }
  }, [])
  
  const handleModeChange = (newMode: "creator" | "brand") => {
    setMode(newMode)
    localStorage.setItem("marketingplace-mode", newMode)
  }
  
  const nav = mode === "creator" ? creatorNav : brandNav

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-card">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-[#6C5CE7] text-white text-xs font-bold px-2 py-1 rounded">MP</span>
          <span className="font-bold text-sm tracking-wide text-foreground">MARKETINGPLACE</span>
        </Link>
      </div>
      
      {/* Creator / Brand Toggle */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center bg-secondary rounded-lg p-1">
          <button
            onClick={() => handleModeChange("creator")}
            className={cn(
              "flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all",
              mode === "creator"
                ? "bg-[#6C5CE7] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Creator
          </button>
          <button
            onClick={() => handleModeChange("brand")}
            className={cn(
              "flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all",
              mode === "brand"
                ? "bg-[#6C5CE7] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Brand
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {nav.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[rgba(108,92,231,0.15)] text-[#6C5CE7]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Earnings card (creator only) */}
      {mode === "creator" && (
        <div className="mx-3 mb-4 p-4 rounded-xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-1">This Month</p>
          <p className="text-2xl font-bold text-[#00B894] font-mono">$4,280</p>
          <p className="text-xs text-[#00B894] mt-0.5">+23% from last month</p>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-[#00B894]" style={{ width: "68%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">68% of monthly goal</p>
        </div>
      )}
    </aside>
  )
}
