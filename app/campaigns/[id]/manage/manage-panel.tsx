"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Play, Pause, Trash2, Rocket } from "lucide-react"

interface Campaign {
  id: string
  brand_user_id: string
  title: string
  description: string
  type: "CLIPPING" | "STANDARD"
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED"
  channels: string[]
  cpm: number | null
  min_followers: number | null
  min_views: number | null
  total_budget: number
  remaining_budget: number
  spots: number | null
  spots_remaining: number | null
  brand_asset_url: string | null
  accent_color: string | null
  created_at: string
}

interface Application {
  id: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"
  message: string | null
  applied_at: string
  creator: { id: string; name: string | null; avatar_url: string | null } | null
  creator_detail: { bio: string | null; niches: string[] | null; total_reach: number | null; avg_rating: number | null } | null
}

const inputCls =
  "w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-sm text-[#E2E8F0] outline-none focus:border-[#6C5CE7] transition-colors"
const labelCls = "block text-xs font-semibold mb-1.5 uppercase tracking-wide text-[#8892A8]"

export function ManagePanel({ campaign: initial }: { campaign: Campaign }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState(initial)
  const [apps, setApps] = useState<Application[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: initial.title,
    description: initial.description,
    cpm: initial.cpm ?? 0,
    minFollowers: initial.min_followers ?? 0,
    minViews: initial.min_views ?? 0,
    totalBudget: Number(initial.total_budget),
    channels: initial.channels,
  })

  const isDraft = campaign.status === "DRAFT"
  const spent = Number(campaign.total_budget) - Number(campaign.remaining_budget)
  const pctUsed =
    Number(campaign.total_budget) > 0 ? Math.min(100, Math.round((spent / Number(campaign.total_budget)) * 100)) : 0

  useEffect(() => {
    fetch(`/api/campaigns/${campaign.id}/applications`)
      .then((r) => (r.ok ? r.json() : { applications: [] }))
      .then((j) => setApps(j.applications ?? []))
      .catch(() => setApps([]))
  }, [campaign.id])

  async function patch(update: Record<string, unknown>) {
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(update),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      toast.error(j?.error?.message || "Action failed")
      return false
    }
    return true
  }

  async function transition(status: Campaign["status"]) {
    setSaving(true)
    const ok = await patch({ status })
    setSaving(false)
    if (ok) {
      setCampaign((c) => ({ ...c, status }))
      toast.success(`Campaign ${status.toLowerCase()}`)
      router.refresh()
    }
  }

  async function saveEdits() {
    setSaving(true)
    const body: Record<string, unknown> = {
      description: form.description,
      channels: form.channels,
      minFollowers: form.minFollowers,
      minViews: form.minViews,
    }
    if (isDraft) {
      body.title = form.title
      body.cpm = form.cpm
      body.totalBudget = form.totalBudget
    }
    const ok = await patch(body)
    setSaving(false)
    if (ok) {
      setCampaign((c) => ({
        ...c,
        title: form.title,
        description: form.description,
        channels: form.channels,
        cpm: form.cpm,
        min_followers: form.minFollowers,
        min_views: form.minViews,
        total_budget: form.totalBudget,
        remaining_budget: isDraft ? form.totalBudget : c.remaining_budget,
      }))
      toast.success("Campaign updated")
      router.refresh()
    }
  }

  async function onDelete() {
    const confirmText = isDraft ? "Delete this draft?" : "Archive this campaign? It will stop accepting new applications."
    if (!window.confirm(confirmText)) return
    setSaving(true)
    const res = await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" })
    setSaving(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return toast.error(j?.error?.message || "Failed")
    }
    const j = await res.json()
    toast.success(j.deleted ? "Draft deleted" : "Campaign archived")
    router.push("/campaigns")
  }

  async function reviewApplication(appId: string, status: "ACCEPTED" | "REJECTED") {
    const res = await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return toast.error(j?.error?.message || "Failed")
    }
    setApps((prev) => prev?.map((a) => (a.id === appId ? { ...a, status } : a)) ?? null)
    toast.success(status === "ACCEPTED" ? "Creator accepted" : "Application rejected")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#6C5CE720] text-[#6C5CE7]">
                {campaign.status}
              </span>
              <span className="text-[10px] font-mono text-[#8892A8]">{campaign.type}</span>
            </div>
            <h1 className="text-2xl font-bold text-white truncate">{campaign.title}</h1>
            <p className="text-sm text-[#8892A8] mt-1 line-clamp-2">{campaign.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {campaign.status === "DRAFT" && (
              <button
                onClick={() => transition("ACTIVE")}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <Rocket size={14} /> Publish
              </button>
            )}
            {campaign.status === "ACTIVE" && (
              <button
                onClick={() => transition("PAUSED")}
                disabled={saving}
                className="flex items-center gap-1.5 border border-[#2A3050] text-[#E2E8F0] hover:bg-[#1A2035] text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <Pause size={14} /> Pause
              </button>
            )}
            {campaign.status === "PAUSED" && (
              <button
                onClick={() => transition("ACTIVE")}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <Play size={14} /> Resume
              </button>
            )}
            {campaign.status !== "COMPLETED" && (
              <button
                onClick={onDelete}
                disabled={saving}
                className="flex items-center gap-1.5 border border-[#FF6B6B]/40 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
              >
                <Trash2 size={14} /> {isDraft ? "Delete" : "Archive"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spend tracker */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[#8892A8] mb-1">Total Budget</p>
          <p className="text-2xl font-bold font-mono text-white">${Number(campaign.total_budget).toLocaleString()}</p>
        </div>
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[#8892A8] mb-1">Spent</p>
          <p className="text-2xl font-bold font-mono text-[#00B894]">${spent.toLocaleString()}</p>
          <div className="h-1.5 rounded-full bg-[#2A3050] overflow-hidden mt-2">
            <div className="h-full rounded-full bg-[#00B894]" style={{ width: `${pctUsed}%` }} />
          </div>
        </div>
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[#8892A8] mb-1">Remaining</p>
          <p className="text-2xl font-bold font-mono text-white">
            ${Number(campaign.remaining_budget).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Applications</h2>
        {apps === null ? (
          <p className="text-sm text-[#8892A8]">Loading...</p>
        ) : apps.length === 0 ? (
          <p className="text-sm text-[#8892A8]">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {apps.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 p-4 bg-[#0B0F1A] border border-[#2A3050] rounded-xl"
              >
                {a.creator?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.creator.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center text-xs font-bold">
                    {(a.creator?.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{a.creator?.name || "Unknown"}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8892A820] text-[#8892A8]">
                      {a.status}
                    </span>
                  </div>
                  {a.creator_detail?.bio && (
                    <p className="text-xs text-[#8892A8] mt-1 line-clamp-1">{a.creator_detail.bio}</p>
                  )}
                  {a.message && <p className="text-xs text-[#E2E8F0] mt-2">{a.message}</p>}
                </div>
                {a.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => reviewApplication(a.id, "ACCEPTED")}
                      className="bg-[#00B894] hover:bg-[#00a882] text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => reviewApplication(a.id, "REJECTED")}
                      className="border border-[#2A3050] text-[#8892A8] hover:text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit */}
      <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Edit campaign</h2>
        <p className="text-xs text-[#8892A8] mb-5">
          {isDraft
            ? "Drafts can be fully edited before publishing."
            : "While live, only description, channels, and creator requirements can be changed. Pause to edit everything."}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Title</label>
            <input
              disabled={!isDraft}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls + (isDraft ? "" : " opacity-60")}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputCls + " resize-none"}
            />
          </div>
          <div>
            <label className={labelCls}>CPM ($)</label>
            <input
              type="number"
              disabled={!isDraft}
              value={form.cpm}
              onChange={(e) => setForm((f) => ({ ...f, cpm: Number(e.target.value) }))}
              className={inputCls + (isDraft ? "" : " opacity-60")}
            />
          </div>
          <div>
            <label className={labelCls}>Total budget ($)</label>
            <input
              type="number"
              disabled={!isDraft}
              value={form.totalBudget}
              onChange={(e) => setForm((f) => ({ ...f, totalBudget: Number(e.target.value) }))}
              className={inputCls + (isDraft ? "" : " opacity-60")}
            />
          </div>
          <div>
            <label className={labelCls}>Min followers</label>
            <input
              type="number"
              value={form.minFollowers}
              onChange={(e) => setForm((f) => ({ ...f, minFollowers: Number(e.target.value) }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Min views</label>
            <input
              type="number"
              value={form.minViews}
              onChange={(e) => setForm((f) => ({ ...f, minViews: Number(e.target.value) }))}
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Channels</label>
            <input
              value={form.channels.join(", ")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  channels: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              className={inputCls}
            />
          </div>
        </div>
        <button
          onClick={saveEdits}
          disabled={saving}
          className="mt-5 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  )
}
