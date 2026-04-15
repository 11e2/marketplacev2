import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { createServerSupabase } from "@/lib/supabase-server"
import { ManagePanel } from "./manage-panel"

export default async function ManageCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/signin?redirectTo=/campaigns/${id}/manage`)

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, brand_user_id, title, description, type, status, channels, cpm, min_followers, min_views, total_budget, remaining_budget, spots, spots_remaining, brand_asset_url, accent_color, created_at",
    )
    .eq("id", id)
    .maybeSingle()
  if (!campaign) notFound()
  if (campaign.brand_user_id !== user.id) redirect("/campaigns")

  return (
    <div className="dark flex min-h-screen bg-[#0B0F1A] text-[#E2E8F0]">
      <SidebarNav />
      <main className="flex-1 px-8 py-10 min-w-0">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-xs text-[#8892A8] hover:text-white mb-4"
        >
          <ArrowLeft size={14} /> Back to campaigns
        </Link>
        <ManagePanel campaign={campaign} />
      </main>
    </div>
  )
}
