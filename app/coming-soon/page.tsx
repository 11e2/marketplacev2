"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"

export default function ComingSoonPage() {
  const router = useRouter()

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />
      <main className="flex-1 min-w-0 px-6 py-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#6C5CE720] flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="text-[#6C5CE7]" />
          </div>
          <h1 className="text-2xl font-bold text-[#E2E8F0] mb-3">Coming Soon</h1>
          <p className="text-[#8892A8] text-sm leading-relaxed mb-8">
            This feature is currently under development. Check back soon for updates.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 border border-[#2A3050] hover:bg-[#1A2035] text-[#E2E8F0] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
            <Link
              href="/marketplace"
              className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
