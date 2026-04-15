"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, MessageSquare } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState, SkeletonCard } from "@/components/empty-state"
import { createBrowserSupabase } from "@/lib/supabase-browser"

interface Conversation {
  id: string
  deal_id: string
  campaign_id: string | null
  brand_user_id: string
  creator_user_id: string
  last_message_at: string | null
  created_at: string
  unread_count: number
  brand: { id: string; name: string | null; avatar_url: string | null } | null
  creator: { id: string; name: string | null; avatar_url: string | null } | null
  campaign: { id: string; title: string; channels: string[] } | null
}

function relativeTime(iso: string | null) {
  if (!iso) return ""
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function MessagingPage() {
  const [items, setItems] = useState<Conversation[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [meId, setMeId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const supabase = createBrowserSupabase()
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    setError(null)
    fetch("/api/messages/conversations", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.error?.message || "Failed to load messages")
        return j
      })
      .then((j) => setItems(j.items ?? []))
      .catch((e) => {
        setError(e.message || "Failed to load messages")
        setItems([])
      })
  }, [])

  // Realtime: refetch conversations when any new message arrives.
  useEffect(() => {
    const supabase = createBrowserSupabase()
    const channel = supabase
      .channel("messages-inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetch("/api/messages/conversations", { cache: "no-store" })
          .then((r) => r.json())
          .then((j) => setItems(j.items ?? []))
          .catch(() => {})
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!items) return []
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => {
      const counterparty = meId === c.brand_user_id ? c.creator?.name : c.brand?.name
      return (
        counterparty?.toLowerCase().includes(q) ||
        c.campaign?.title?.toLowerCase().includes(q)
      )
    })
  }, [items, search, meId])

  const totalUnread = useMemo(() => (items ?? []).reduce((s, c) => s + c.unread_count, 0), [items])

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Messages</h1>
            <p className="text-sm text-[#8892A8]">
              {totalUnread > 0 ? `${totalUnread} unread` : "Conversations tied to your deals."}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or campaign..."
            aria-label="Search conversations"
            className="w-full bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
          />
        </div>

        {items === null ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Couldn't load messages" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={search ? "No matches" : "No conversations yet"}
            description={
              search
                ? "Try a different search."
                : "Conversations appear here when a deal is created. Accept an applicant or offer a creator to start one."
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => {
              const counterparty = meId === c.brand_user_id ? c.creator : c.brand
              const name = counterparty?.name || "Unknown"
              return (
                <Link
                  key={c.id}
                  href={`/deals/${c.deal_id}`}
                  className="flex items-center gap-3 p-4 bg-[#131825] border border-[#2A3050] rounded-2xl hover:border-[#6C5CE7] transition-colors"
                >
                  {counterparty?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={counterparty.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center text-xs font-bold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#E2E8F0] truncate">{name}</p>
                      <span className="text-[10px] text-[#8892A8] shrink-0">
                        {relativeTime(c.last_message_at || c.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#8892A8] truncate">
                      {c.campaign?.title || "Direct deal"}
                    </p>
                  </div>
                  {c.unread_count > 0 && (
                    <div className="w-6 h-6 rounded-full bg-[#6C5CE7] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {c.unread_count}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
