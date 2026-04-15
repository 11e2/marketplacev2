"use client"

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCheck,
  Check,
  Loader2,
  DollarSign,
  FileText,
  Upload,
  Lock,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"
import { ProposalModal } from "@/components/proposal-modal"
import { SubmissionModal } from "@/components/submission-modal"
import { createBrowserSupabase } from "@/lib/supabase-browser"

type DealStatus =
  | "NEGOTIATING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "APPROVED"
  | "DISPUTED"
  | "COMPLETED"
  | "CANCELLED"

interface Deal {
  id: string
  campaign_id: string | null
  brand_user_id: string
  creator_user_id: string
  status: DealStatus
  deliverables: { name: string; detail?: string }[] | null
  agreed_rate: number
  rate_type: "CPM" | "FLAT" | "DAILY"
  escrow_amount: number
  escrow_status: string | null
  deadline: string | null
  created_at: string
  completed_at: string | null
  campaign: { id: string; title: string; type: string; channels: string[] } | null
  brand: { id: string; name: string | null; avatar_url: string | null } | null
  creator: { id: string; name: string | null; avatar_url: string | null } | null
}

interface Message {
  id: string
  sender_id: string
  content: string
  is_proposal: boolean
  proposal_id: string | null
  read_at: string | null
  created_at: string
}

interface Proposal {
  id: string
  from_user_id: string
  proposed_rate: number
  deliverables: { name: string; detail?: string }[]
  timeline: string | null
  message: string | null
  status: "PENDING" | "ACCEPTED" | "COUNTERED" | "DECLINED"
  created_at: string
}

interface Submission {
  id: string
  deal_id: string
  creator_user_id: string
  video_url: string | null
  processed_video_url: string | null
  content_url: string | null
  platform_post_url: string | null
  views: number | null
  earnings: number | null
  status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED"
  submitted_at: string
  reviewed_at: string | null
}

const STATUS_COLORS: Record<DealStatus, { bg: string; color: string }> = {
  NEGOTIATING: { bg: "#FF9F4320", color: "#FF9F43" },
  ACCEPTED: { bg: "#6C5CE720", color: "#6C5CE7" },
  IN_PROGRESS: { bg: "#6C5CE720", color: "#6C5CE7" },
  DELIVERED: { bg: "#4ECDC420", color: "#4ECDC4" },
  APPROVED: { bg: "#00B89420", color: "#00B894" },
  COMPLETED: { bg: "#00B89420", color: "#00B894" },
  DISPUTED: { bg: "#FF6B6B20", color: "#FF6B6B" },
  CANCELLED: { bg: "#8892A820", color: "#8892A8" },
}

const BRAND_NEXT: Partial<Record<DealStatus, { next: DealStatus; label: string }[]>> = {
  NEGOTIATING: [
    { next: "ACCEPTED", label: "Accept" },
    { next: "CANCELLED", label: "Cancel" },
  ],
  ACCEPTED: [{ next: "IN_PROGRESS", label: "Start work" }],
  DELIVERED: [
    { next: "APPROVED", label: "Approve delivery" },
    { next: "DISPUTED", label: "Dispute" },
  ],
  APPROVED: [{ next: "COMPLETED", label: "Complete & release escrow" }],
}

const CREATOR_NEXT: Partial<Record<DealStatus, { next: DealStatus; label: string }[]>> = {
  NEGOTIATING: [{ next: "ACCEPTED", label: "Accept" }],
  ACCEPTED: [{ next: "IN_PROGRESS", label: "Start work" }],
  IN_PROGRESS: [{ next: "DELIVERED", label: "Mark delivered" }],
}

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [meId, setMeId] = useState<string | null>(null)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[] | null>(null)
  const [proposals, setProposals] = useState<Proposal[] | null>(null)
  const [submissions, setSubmissions] = useState<Submission[] | null>(null)

  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [submissionOpen, setSubmissionOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createBrowserSupabase()
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null))
  }, [])

  const load = useCallback(async () => {
    try {
      const [dr, mr, pr, sr] = await Promise.all([
        fetch(`/api/deals/${id}`, { cache: "no-store" }),
        fetch(`/api/deals/${id}/messages`, { cache: "no-store" }),
        fetch(`/api/deals/${id}/proposals`, { cache: "no-store" }),
        fetch(`/api/deals/${id}/submissions`, { cache: "no-store" }),
      ])
      const [dj, mj, pj, sj] = await Promise.all([
        dr.json().catch(() => ({})),
        mr.json().catch(() => ({})),
        pr.json().catch(() => ({})),
        sr.json().catch(() => ({})),
      ])
      if (!dr.ok) throw new Error(dj?.error?.message || "Failed to load deal")
      setDeal(dj.deal)
      setMessages(mr.ok ? (mj.messages ?? []) : [])
      setProposals(pr.ok ? (pj.proposals ?? []) : [])
      setSubmissions(sr.ok ? (sj.submissions ?? []) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deal")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (messages && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Supabase Realtime: subscribe to new messages on this deal's conversation.
  useEffect(() => {
    if (!deal || !meId) return
    const supabase = createBrowserSupabase()
    const channel = supabase
      .channel(`deal-${deal.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: { new: Record<string, unknown> }) => {
          const msg = payload.new as unknown as Message & { conversation_id: string }
          // Only accept messages whose payload is for this deal's participants.
          // We don't have conversation_id locally, so re-fetch messages to pick up context.
          if (msg.sender_id !== meId) {
            fetch(`/api/deals/${deal.id}/messages`, { cache: "no-store" })
              .then((r) => r.json())
              .then((j) => setMessages(j.messages ?? []))
              .catch(() => {})
          }
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [deal, meId])

  const role: "brand" | "creator" | null = useMemo(() => {
    if (!deal || !meId) return null
    if (meId === deal.brand_user_id) return "brand"
    if (meId === deal.creator_user_id) return "creator"
    return null
  }, [deal, meId])

  async function sendMessage() {
    const content = messageInput.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const r = await fetch(`/api/deals/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error?.message || "Failed to send")
      setMessageInput("")
      const r2 = await fetch(`/api/deals/${id}/messages`, { cache: "no-store" })
      const j2 = await r2.json()
      setMessages(j2.messages ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed")
    } finally {
      setSending(false)
    }
  }

  async function transition(next: DealStatus) {
    if (!deal || transitioning) return
    setTransitioning(true)
    try {
      const r = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error?.message || "Transition failed")
      toast.success(`Deal moved to ${next.replace("_", " ")}`)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transition failed")
    } finally {
      setTransitioning(false)
    }
  }

  if (loading) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav />
        <main className="flex-1 px-6 py-6 max-w-6xl">
          <div className="h-8 bg-[#131825] border border-[#2A3050] rounded animate-pulse mb-4 w-48" />
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <div className="h-96 bg-[#131825] border border-[#2A3050] rounded-2xl animate-pulse" />
            <div className="h-96 bg-[#131825] border border-[#2A3050] rounded-2xl animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav />
        <main className="flex-1 px-6 py-6 max-w-4xl">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] mb-6"
          >
            <ArrowLeft size={14} /> Back to Deals
          </Link>
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load deal"
            description={error ?? "Deal not found"}
          />
        </main>
      </div>
    )
  }

  const counterparty = role === "brand" ? deal.creator : deal.brand
  const meta = STATUS_COLORS[deal.status]
  const transitions = role === "brand" ? BRAND_NEXT[deal.status] : CREATOR_NEXT[deal.status]

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-6xl">
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] mb-4"
        >
          <ArrowLeft size={14} /> Back to Deals
        </Link>

        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {counterparty?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={counterparty.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center text-xs font-bold">
                  {(counterparty?.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#E2E8F0] truncate">
                  {counterparty?.name || "Unknown"}
                </p>
                <p className="text-xs text-[#8892A8] truncate">
                  {deal.campaign?.title || "Direct offer"}
                </p>
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {deal.status.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-[#8892A8] mb-1">Agreed Rate</p>
              <p className="font-mono font-bold text-[#E2E8F0]">
                ${Number(deal.agreed_rate).toLocaleString()}{" "}
                <span className="text-[10px] text-[#8892A8]">{deal.rate_type}</span>
              </p>
            </div>
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-[#8892A8] mb-1">Escrow</p>
              <p className="font-mono font-bold text-[#00B894] inline-flex items-center gap-1">
                <Lock size={10} />${Number(deal.escrow_amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-[#8892A8] mb-1">Deadline</p>
              <p className="font-mono text-[#E2E8F0] inline-flex items-center gap-1">
                <Calendar size={10} />
                {deal.deadline ? new Date(deal.deadline).toLocaleDateString() : "Open"}
              </p>
            </div>
            <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-[#8892A8] mb-1">Started</p>
              <p className="font-mono text-[#E2E8F0]">
                {new Date(deal.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {transitions && transitions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {transitions.map((t) => (
                <button
                  key={t.next}
                  onClick={() => transition(t.next)}
                  disabled={transitioning}
                  className={
                    t.next === "CANCELLED" || t.next === "DISPUTED"
                      ? "border border-[#FF6B6B]/40 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
                      : "bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
                  }
                >
                  {transitioning ? "Updating..." : t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Messages column */}
          <div className="bg-[#131825] border border-[#2A3050] rounded-2xl flex flex-col" style={{ minHeight: 500 }}>
            <div className="px-5 py-3 border-b border-[#2A3050]">
              <h2 className="text-sm font-bold text-[#E2E8F0]">Conversation</h2>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {!messages ? (
                <p className="text-sm text-[#8892A8]">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-[#8892A8]">No messages yet. Say hi.</p>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === meId
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-sm">
                        <div
                          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                          style={
                            isMe
                              ? { backgroundColor: "#6C5CE7", color: "#fff" }
                              : { backgroundColor: "#0B0F1A", color: "#E2E8F0", border: "1px solid #2A3050" }
                          }
                        >
                          {m.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-[#8892A8]">
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe &&
                            (m.read_at ? (
                              <CheckCheck size={12} className="text-[#6C5CE7]" />
                            ) : (
                              <Check size={12} className="text-[#8892A8]" />
                            ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="px-4 py-3 border-t border-[#2A3050]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={`Message ${counterparty?.name ?? ""}...`}
                  aria-label="Message"
                  className="flex-1 bg-[#0B0F1A] border border-[#2A3050] rounded-xl px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: messageInput.trim() ? "#6C5CE7" : "#1A2035",
                  }}
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <Send size={16} style={{ color: messageInput.trim() ? "#fff" : "#8892A8" }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: deliverables, proposals, submissions */}
          <div className="space-y-4">
            <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8892A8]">
                  Deliverables
                </h3>
              </div>
              {deal.deliverables && deal.deliverables.length > 0 ? (
                <ul className="space-y-2">
                  {deal.deliverables.map((d, i) => (
                    <li key={i} className="text-xs text-[#E2E8F0]">
                      <p className="font-semibold">{d.name}</p>
                      {d.detail && <p className="text-[#8892A8]">{d.detail}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#8892A8]">No deliverables specified.</p>
              )}
            </div>

            <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8892A8]">
                  Proposals
                </h3>
                <button
                  onClick={() => setProposalOpen(true)}
                  className="text-[10px] font-semibold text-[#6C5CE7] hover:underline"
                >
                  New
                </button>
              </div>
              {!proposals || proposals.length === 0 ? (
                <p className="text-xs text-[#8892A8]">No proposals yet.</p>
              ) : (
                <ul className="space-y-3">
                  {proposals.map((p) => (
                    <li key={p.id} className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold font-mono text-[#00B894] inline-flex items-center gap-1">
                          <DollarSign size={10} />
                          {Number(p.proposed_rate).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8892A820] text-[#8892A8]">
                          {p.status}
                        </span>
                      </div>
                      {p.timeline && (
                        <p className="text-[11px] text-[#8892A8] mb-1">Timeline: {p.timeline}</p>
                      )}
                      {p.message && <p className="text-[11px] text-[#E2E8F0]">{p.message}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {role === "creator" && (
              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#8892A8]">
                    Submissions
                  </h3>
                  {(deal.status === "IN_PROGRESS" || deal.status === "ACCEPTED") && (
                    <button
                      onClick={() => setSubmissionOpen(true)}
                      className="text-[10px] font-semibold text-[#6C5CE7] hover:underline inline-flex items-center gap-1"
                    >
                      <Upload size={10} /> Submit
                    </button>
                  )}
                </div>
                {!submissions || submissions.length === 0 ? (
                  <p className="text-xs text-[#8892A8]">No submissions yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {submissions.map((s) => (
                      <li key={s.id} className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#E2E8F0] inline-flex items-center gap-1">
                            <FileText size={12} /> Submission
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6C5CE720] text-[#6C5CE7]">
                            {s.status}
                          </span>
                        </div>
                        {s.platform_post_url && (
                          <a
                            href={s.platform_post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#6C5CE7] hover:underline break-all"
                          >
                            {s.platform_post_url}
                          </a>
                        )}
                        <p className="text-[10px] text-[#8892A8] mt-1">
                          {new Date(s.submitted_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {role === "brand" && submissions && submissions.length > 0 && (
              <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8892A8] mb-3">
                  Submissions
                </h3>
                <ul className="space-y-2">
                  {submissions.map((s) => (
                    <li key={s.id} className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#E2E8F0] inline-flex items-center gap-1">
                          <FileText size={12} /> Submission
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6C5CE720] text-[#6C5CE7]">
                          {s.status}
                        </span>
                      </div>
                      {s.platform_post_url && (
                        <a
                          href={s.platform_post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#6C5CE7] hover:underline break-all"
                        >
                          {s.platform_post_url}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <ProposalModal
          open={proposalOpen}
          onOpenChange={setProposalOpen}
          dealId={deal.id}
          onCreated={load}
        />
        <SubmissionModal
          open={submissionOpen}
          onOpenChange={setSubmissionOpen}
          dealId={deal.id}
          onCreated={load}
        />
      </main>
    </div>
  )
}
