"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, CheckCircle2, Zap, Loader2 } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"
import { ApplyModal } from "@/components/apply-modal"
import { VerifiedBadge } from "@/components/verified-badge"
import { createBrowserSupabase } from "@/lib/supabase-browser"

interface CampaignDetail {
  id: string
  brand_user_id: string
  title: string
  description: string
  type: "CLIPPING" | "STANDARD"
  status: string
  channels: string[]
  cpm: number | null
  min_followers: number | null
  min_views: number | null
  total_budget: number
  remaining_budget: number
  spots: number | null
  spots_remaining: number | null
  accent_color: string | null
  brand_asset_url: string | null
  percentBudgetUsed: number
  spotsRemaining: number | null
  owner: { name: string | null; avatar_url: string | null } | null
  brand: {
    company_name: string | null
    logo_url: string | null
    website: string | null
    industry: string | null
    is_verified: boolean | null
  } | null
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [meId, setMeId] = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [checkingApplication, setCheckingApplication] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/campaigns/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(json?.error?.message || "Failed to load campaign")
        return json
      })
      .then((json) => {
        if (cancelled) return
        setCampaign(json.campaign)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message || "Failed to load campaign")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    const supabase = createBrowserSupabase()
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setCheckingApplication(false)
        return
      }
      setMeId(user.id)
      const { data } = await supabase
        .from("campaign_applications")
        .select("id")
        .eq("campaign_id", id)
        .eq("creator_user_id", user.id)
        .maybeSingle()
      if (cancelled) return
      setAlreadyApplied(Boolean(data))
      setCheckingApplication(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  function handleApply() {
    if (!campaign) return
    if (campaign.type === "CLIPPING") {
      router.push(`/video-studio?campaignId=${campaign.id}`)
      return
    }
    setModalOpen(true)
  }

  const isOwner = meId && campaign && meId === campaign.brand_user_id

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-4xl">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Marketplace
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 bg-[#131825] border border-[#2A3050] rounded-xl animate-pulse" />
            <div className="h-48 bg-[#131825] border border-[#2A3050] rounded-2xl animate-pulse" />
            <div className="h-32 bg-[#131825] border border-[#2A3050] rounded-2xl animate-pulse" />
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load campaign"
            description={error}
            action={
              <Link
                href="/marketplace"
                className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Back to Marketplace
              </Link>
            }
          />
        ) : !campaign ? (
          <EmptyState
            icon={AlertCircle}
            title="Campaign not found"
            description="This campaign may have been removed or is no longer available."
            action={
              <Link
                href="/marketplace"
                className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Back to Marketplace
              </Link>
            }
          />
        ) : (
          <div className="space-y-5">
            <div
              className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden"
            >
              <div className="h-2" style={{ backgroundColor: campaign.accent_color || "#6C5CE7" }} />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {campaign.brand?.logo_url || campaign.owner?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={campaign.brand?.logo_url || campaign.owner?.avatar_url || ""}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-[#2A3050]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7] flex items-center justify-center text-sm font-bold">
                        {(campaign.brand?.company_name || campaign.owner?.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#E2E8F0] truncate">
                          {campaign.brand?.company_name || campaign.owner?.name || "Brand"}
                        </p>
                        <VerifiedBadge verified={campaign.brand?.is_verified} size={14} />

                      </div>
                      {campaign.brand?.industry && (
                        <p className="text-xs text-[#8892A8] truncate">{campaign.brand.industry}</p>
                      )}
                    </div>
                  </div>
                  {campaign.type === "CLIPPING" && (
                    <span className="shrink-0 text-[10px] font-bold font-mono px-2 py-1 rounded-full bg-[#00B894]/20 text-[#00B894] flex items-center gap-1">
                      <Zap size={10} />
                      CLIPPING {campaign.cpm != null && `· CPM $${campaign.cpm}`}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-[#E2E8F0] mb-2">{campaign.title}</h1>
                <p className="text-sm text-[#8892A8] whitespace-pre-wrap leading-relaxed">
                  {campaign.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {campaign.channels.map((ch) => (
                    <span
                      key={ch}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#6C5CE7]/15 text-[#6C5CE7]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8892A8] mb-1">
                  Total Budget
                </p>
                <p className="text-xl font-bold font-mono text-[#E2E8F0]">
                  ${Number(campaign.total_budget).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8892A8] mb-1">
                  Budget Remaining
                </p>
                <p className="text-xl font-bold font-mono text-[#E2E8F0]">
                  ${Number(campaign.remaining_budget).toLocaleString()}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-[#2A3050] overflow-hidden">
                  <div
                    className="h-full bg-[#6C5CE7] transition-all"
                    style={{ width: `${100 - campaign.percentBudgetUsed}%` }}
                  />
                </div>
              </div>
              <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8892A8] mb-1">
                  Spots Remaining
                </p>
                <p className="text-xl font-bold font-mono text-[#E2E8F0]">
                  {campaign.spotsRemaining ?? "Open"}
                </p>
              </div>
            </div>

            {(campaign.min_followers || campaign.min_views) && (
              <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#E2E8F0] mb-3">Requirements</h3>
                <ul className="space-y-2 text-sm text-[#8892A8]">
                  {campaign.min_followers != null && (
                    <li>
                      Minimum followers:{" "}
                      <span className="font-mono font-semibold text-[#E2E8F0]">
                        {campaign.min_followers.toLocaleString()}
                      </span>
                    </li>
                  )}
                  {campaign.min_views != null && (
                    <li>
                      Minimum avg views:{" "}
                      <span className="font-mono font-semibold text-[#E2E8F0]">
                        {campaign.min_views.toLocaleString()}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#E2E8F0]">Ready to apply?</p>
                <p className="text-xs text-[#8892A8] mt-0.5">
                  {campaign.type === "CLIPPING"
                    ? "Create a clip in the Video Studio to get started."
                    : "Send the brand a short note to apply."}
                </p>
              </div>
              {isOwner ? (
                <span className="text-xs text-[#8892A8] italic">This is your campaign</span>
              ) : alreadyApplied ? (
                <span className="inline-flex items-center gap-1.5 bg-[#00B894]/15 text-[#00B894] text-xs font-semibold px-4 py-2.5 rounded-xl">
                  <CheckCircle2 size={14} />
                  Applied
                </span>
              ) : checkingApplication ? (
                <span className="inline-flex items-center gap-2 text-xs text-[#8892A8] px-4 py-2.5">
                  <Loader2 size={14} className="animate-spin" />
                  Checking...
                </span>
              ) : (
                <button
                  onClick={handleApply}
                  className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {campaign.type === "CLIPPING" ? "Open Video Studio" : "Apply Now"}
                </button>
              )}
            </div>
          </div>
        )}

        {campaign && (
          <ApplyModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            onApplied={() => setAlreadyApplied(true)}
          />
        )}
      </main>
    </div>
  )
}
