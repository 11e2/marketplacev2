"use client"

import { useCallback, useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  BadgeCheck,
  Link2,
  Loader2,
  Plus,
  TrendingUp,
  Users,
  Eye,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

type Platform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "TWITTER" | "DISCORD" | "TWITCH" | "PODCAST"

interface LinkedAccount {
  id: string
  platform: Platform
  platform_user_id: string
  platform_username: string
  followers: number | null
  avg_views: number | null
  engagement_rate: number | null
  is_verified: boolean | null
  last_synced_at: string | null
  created_at: string
}

const ALL_PLATFORMS: { key: Platform; label: string; color: string }[] = [
  { key: "TIKTOK", label: "TikTok", color: "#000000" },
  { key: "INSTAGRAM", label: "Instagram", color: "#E91E8C" },
  { key: "YOUTUBE", label: "YouTube", color: "#FF0000" },
  { key: "TWITTER", label: "Twitter/X", color: "#1DA1F2" },
  { key: "DISCORD", label: "Discord", color: "#5865F2" },
  { key: "TWITCH", label: "Twitch", color: "#9146FF" },
  { key: "PODCAST", label: "Podcast", color: "#FF9F43" },
]

function fmtNum(n: number | null) {
  if (n == null) return "-"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function relativeTime(iso: string | null) {
  if (!iso) return "never"
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return "just now"
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function LinkedAccountsPage() {
  const [items, setItems] = useState<LinkedAccount[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [pendingDisconnect, setPendingDisconnect] = useState<{ id: string; label: string } | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const r = await fetch("/api/users/me/linked-accounts", { cache: "no-store" })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error?.message || "Failed to load accounts")
      setItems(j.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load accounts")
      setItems([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function disconnect(id: string) {
    setDisconnecting(id)
    try {
      const r = await fetch(`/api/users/me/linked-accounts?id=${id}`, { method: "DELETE" })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j?.error?.message || "Disconnect failed")
      }
      toast.success("Disconnected")
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    } finally {
      setDisconnecting(null)
    }
  }

  function connect(platform: Platform) {
    const label = ALL_PLATFORMS.find((p) => p.key === platform)?.label ?? platform
    toast.info(`Redirecting to ${label}...`)
    window.location.href = `/api/users/me/linked-accounts/${platform.toLowerCase()}/connect`
  }

  const connectedPlatforms = new Set((items ?? []).map((a) => a.platform))
  const available = ALL_PLATFORMS.filter((p) => !connectedPlatforms.has(p.key))

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Linked Accounts</h1>
          <p className="text-[#8892A8] mt-1 text-sm">
            Connect your social accounts to participate in clipping campaigns and track performance.
          </p>
        </div>

        {items === null ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#6C5CE7]" />
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Couldn't load accounts" description={error} />
        ) : (
          <>
            {items.length === 0 ? (
              <div className="mb-8">
                <EmptyState
                  icon={Link2}
                  title="No accounts linked"
                  description="Connect a social account to unlock campaigns that match your audience."
                />
              </div>
            ) : (
              <div className="grid gap-4 mb-8">
                {items.map((a) => {
                  const meta = ALL_PLATFORMS.find((p) => p.key === a.platform)
                  return (
                    <div
                      key={a.id}
                      className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden"
                    >
                      <div className="h-1" style={{ backgroundColor: meta?.color ?? "#6C5CE7" }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ backgroundColor: meta?.color ?? "#6C5CE7" }}
                            >
                              {(meta?.label ?? a.platform).charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[#E2E8F0] truncate">
                                  {meta?.label ?? a.platform}
                                </h3>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B89420] text-[#00B894]">
                                  <BadgeCheck size={10} />
                                  Connected
                                </span>
                              </div>
                              <p className="text-sm text-[#8892A8] truncate">
                                @{a.platform_username}
                              </p>
                              <p className="text-[10px] text-[#8892A8] mt-0.5">
                                Last synced {relativeTime(a.last_synced_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setPendingDisconnect({
                                id: a.id,
                                label: meta?.label ?? a.platform,
                              })
                            }
                            disabled={disconnecting === a.id}
                            aria-busy={disconnecting === a.id}
                            className="text-xs font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B]/10 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {disconnecting === a.id ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                Disconnecting
                              </>
                            ) : (
                              "Disconnect"
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[#0B0F1A] rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Users size={12} className="text-[#8892A8]" />
                              <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">
                                Followers
                              </p>
                            </div>
                            <p className="text-lg font-bold font-mono text-[#E2E8F0]">
                              {fmtNum(a.followers)}
                            </p>
                          </div>
                          <div className="bg-[#0B0F1A] rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Eye size={12} className="text-[#8892A8]" />
                              <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">
                                Avg Views
                              </p>
                            </div>
                            <p className="text-lg font-bold font-mono text-[#E2E8F0]">
                              {fmtNum(a.avg_views)}
                            </p>
                          </div>
                          <div className="bg-[#0B0F1A] rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <TrendingUp size={12} className="text-[#8892A8]" />
                              <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">
                                Engagement
                              </p>
                            </div>
                            <p className="text-lg font-bold font-mono text-[#E2E8F0]">
                              {a.engagement_rate != null ? `${a.engagement_rate.toFixed(1)}%` : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {available.length > 0 && (
              <>
                <h2 className="text-base font-bold text-[#E2E8F0] mb-4">Connect more accounts</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {available.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => connect(p.key)}
                      className="bg-[#131825] border border-dashed border-[#2A3050] rounded-xl p-6 text-center hover:border-[#6C5CE7]/50 hover:bg-[#6C5CE710] transition-all group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.label.charAt(0)}
                      </div>
                      <p className="font-medium text-[#E2E8F0] mb-1">{p.label}</p>
                      <p className="text-xs text-[#8892A8] flex items-center justify-center gap-1 group-hover:text-[#6C5CE7]">
                        <Plus size={12} />
                        Connect Account
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <ConfirmDialog
          open={!!pendingDisconnect}
          onOpenChange={(v) => !v && setPendingDisconnect(null)}
          title={`Disconnect ${pendingDisconnect?.label ?? "account"}?`}
          description="You can reconnect anytime. Stats will stop syncing and this platform's verification will be removed."
          confirmLabel="Disconnect"
          variant="destructive"
          onConfirm={async () => {
            if (pendingDisconnect) await disconnect(pendingDisconnect.id)
            setPendingDisconnect(null)
          }}
        />
      </main>
    </div>
  )
}
