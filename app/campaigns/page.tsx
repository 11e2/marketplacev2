import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import { SidebarNav } from "@/components/sidebar-nav"
import { createServerSupabase } from "@/lib/supabase-server"
import { CampaignsList } from "./campaigns-list"

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin?redirectTo=/campaigns")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = profile?.role as "CREATOR" | "BRAND" | "ADMIN" | undefined
  if (role !== "BRAND" && role !== "ADMIN") redirect("/marketplace")

  const { status } = await searchParams

  return (
    <div className="dark flex min-h-screen bg-[#0B0F1A] text-[#E2E8F0]">
      <SidebarNav />
      <main className="flex-1 px-8 py-10 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Campaigns</h1>
            <p className="text-sm text-[#8892A8] mt-1">Manage your brand campaigns and applications</p>
          </div>
          <Link
            href="/campaign-builder"
            className="flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New campaign
          </Link>
        </div>
        <CampaignsList initialStatus={status ?? "ALL"} />
      </main>
    </div>
  )
}
