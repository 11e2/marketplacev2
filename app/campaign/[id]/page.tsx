"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Clock, DollarSign, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip } from "@/components/channel-chip"
import { getCampaignById } from "@/lib/data"

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const campaign = getCampaignById(Number(id))

  if (!campaign) {
    return (
      <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
        <SidebarNav mode="creator" />
        <main className="flex-1 min-w-0 px-6 py-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-[#8892A8] text-sm mb-6">This campaign does not exist or has been removed.</p>
            <Link
              href="/marketplace"
              className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6 max-w-4xl">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Marketplace
        </Link>

        {/* Campaign header */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden mb-6">
          <div className="h-1.5" style={{ backgroundColor: campaign.accentColor }} />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{ backgroundColor: campaign.brandColor }}
                >
                  {campaign.brandInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[#E2E8F0]">{campaign.brand}</h1>
                    {campaign.verified && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00B89420] text-[#00B894] flex items-center gap-1">
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8892A8]">{campaign.title}</p>
                </div>
              </div>
              <span className="text-sm font-bold font-mono px-3 py-1.5 rounded-full bg-[#00B89420] text-[#00B894]">
                {campaign.rate}
              </span>
            </div>

            <p className="text-sm text-[#8892A8] leading-relaxed mb-5">{campaign.description}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {campaign.channels.map((ch) => (
                <ChannelChip key={ch} channel={ch} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#2A3050]">
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-[#6C5CE7]" />
                <div>
                  <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">Budget</p>
                  <p className="text-sm font-bold font-mono text-[#E2E8F0]">{campaign.budget}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#4ECDC4]" />
                <div>
                  <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">Spots Left</p>
                  <p className="text-sm font-bold font-mono text-[#E2E8F0]">{campaign.spots}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#FF9F43]" />
                <div>
                  <p className="text-[10px] text-[#8892A8] uppercase tracking-wide font-semibold">Rate Type</p>
                  <p className="text-sm font-bold text-[#E2E8F0] capitalize">{campaign.rateType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-bold text-[#E2E8F0] mb-4">Requirements</h2>
          <ul className="space-y-2 text-sm text-[#8892A8]">
            <li className="flex items-start gap-2">
              <span className="text-[#6C5CE7] mt-0.5">-</span>
              Must have engaged audience in relevant niche
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6C5CE7] mt-0.5">-</span>
              Content must be original and follow brand guidelines
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6C5CE7] mt-0.5">-</span>
              Delivery within 7 days of acceptance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6C5CE7] mt-0.5">-</span>
              FTC disclosure required where applicable
            </li>
          </ul>
        </div>

        {/* Apply */}
        <div className="flex gap-3">
          <button
            onClick={() => toast.success("Application submitted! The brand will review your profile.")}
            className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Apply to Campaign
          </button>
          <button
            onClick={() => toast.info("Offer form coming soon")}
            className="border border-[#2A3050] hover:bg-[#1A2035] text-[#E2E8F0] text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Send Custom Offer
          </button>
        </div>
      </main>
    </div>
  )
}
