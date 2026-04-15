"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { EmptyState } from "@/components/empty-state"

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // TODO(Phase 3): fetch from GET /api/campaigns/[id]
  void id

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

        <EmptyState
          icon={Sparkles}
          title="Campaign details unavailable"
          description="Live campaign data will load here once the API is wired up."
          action={
            <Link
              href="/marketplace"
              className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Back to Marketplace
            </Link>
          }
        />
      </main>
    </div>
  )
}
