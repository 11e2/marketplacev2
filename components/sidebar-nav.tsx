"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Store,
  Layers,
  Handshake,
  FileText,
  Video,
  MessageSquare,
  BarChart2,
  Wallet,
  TrendingUp,
  Link2,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createBrowserSupabase } from "@/lib/supabase-browser"

const creatorNav = [
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "My Applications", href: "/applications", icon: FileText },
  { label: "Linked Accounts", href: "/linked-accounts", icon: Link2 },
  { label: "Active Deals", href: "/deals", icon: Handshake },
  { label: "Video Studio", href: "/video-studio", icon: Video },
  { label: "Messages", href: "/messaging", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Payouts", href: "/earnings", icon: Wallet },
]

const brandNav = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { label: "Campaigns", href: "/campaigns", icon: Layers },
  { label: "New Campaign", href: "/campaign-builder", icon: TrendingUp },
  { label: "Creators", href: "/marketplace", icon: Store },
  { label: "Deals", href: "/deals", icon: Handshake },
  { label: "Messages", href: "/messaging", icon: MessageSquare },
  { label: "Payouts", href: "/earnings", icon: Wallet },
]

interface SidebarUser {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: "CREATOR" | "BRAND" | "ADMIN"
}

// Module-level cache keeps the user stable across navigations so the sidebar
// doesn't flicker between creator and brand nav while re-fetching.
let cachedUser: SidebarUser | null | undefined = undefined
let inflight: Promise<SidebarUser | null> | null = null

function loadUser(): Promise<SidebarUser | null> {
  if (cachedUser !== undefined) return Promise.resolve(cachedUser)
  if (inflight) return inflight
  inflight = fetch("/api/users/me", { cache: "no-store", credentials: "same-origin" })
    .then(async (r) => (r.ok ? ((await r.json())?.user ?? null) : null))
    .catch(() => null)
    .then((u) => {
      cachedUser = u
      inflight = null
      return u
    })
  return inflight
}

export function SidebarNav(_: { mode?: "creator" | "brand" }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SidebarUser | null>(cachedUser ?? null)
  const [loaded, setLoaded] = useState<boolean>(cachedUser !== undefined)

  useEffect(() => {
    if (cachedUser !== undefined) {
      setUser(cachedUser)
      setLoaded(true)
      return
    }
    let cancelled = false
    loadUser().then((u) => {
      if (cancelled) return
      setUser(u)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const role: "CREATOR" | "BRAND" | null = user?.role === "BRAND" ? "BRAND" : user ? "CREATOR" : null
  const nav = role === "BRAND" ? brandNav : role === "CREATOR" ? creatorNav : []

  async function signOut() {
    const supabase = createBrowserSupabase()
    await supabase.auth.signOut()
    cachedUser = undefined
    toast.success("Signed out")
    router.push("/auth/signin")
    router.refresh()
  }

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-card">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-[#6C5CE7] text-white text-xs font-bold px-2 py-1 rounded">MP</span>
          <span className="font-bold text-sm tracking-wide text-foreground">MARKETINGPLACE</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {role === "CREATOR" && (
        <div className="mx-3 mb-3 p-4 rounded-xl bg-secondary border border-border">
          <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-1">This Month</p>
          <p className="text-2xl font-bold text-muted-foreground font-mono">$-</p>
          <p className="text-xs text-muted-foreground mt-0.5">Earnings available in Phase 6</p>
        </div>
      )}

      <div className="mx-3 mb-3 p-3 rounded-xl bg-secondary border border-border">
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center text-xs font-bold">
              {initials || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.name || (loaded ? "Guest" : "Loading...")}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user && role ? role.charAt(0) + role.slice(1).toLowerCase() : ""}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <Link
            href="/settings"
            className="flex-1 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Settings size={13} />
            Settings
          </Link>
          <button
            onClick={signOut}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B]/10 py-1.5 rounded-md transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
