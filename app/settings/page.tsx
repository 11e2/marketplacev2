import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase"
import { SidebarNav } from "@/components/sidebar-nav"
import { SettingsTabs } from "./settings-tabs"

export default async function SettingsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin?redirectTo=/settings")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role")
    .eq("id", user.id)
    .single()

  const role = (profile?.role as "CREATOR" | "BRAND" | "ADMIN") || "CREATOR"
  let creator = null
  let brand = null
  if (role === "CREATOR") {
    const { data } = await supabase
      .from("creator_profiles")
      .select("bio, niches")
      .eq("user_id", user.id)
      .maybeSingle()
    creator = data
  } else if (role === "BRAND") {
    const { data } = await supabase
      .from("brand_profiles")
      .select("company_name, logo_url, website, industry")
      .eq("user_id", user.id)
      .maybeSingle()
    brand = data
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 px-8 py-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Manage your account, security, and notification preferences.
          </p>
          <SettingsTabs
            profile={{
              email: profile?.email ?? user.email ?? "",
              name: profile?.name ?? "",
              avatarUrl: profile?.avatar_url ?? "",
              role,
              bio: creator?.bio ?? "",
              niches: creator?.niches ?? [],
              companyName: brand?.company_name ?? "",
              logoUrl: brand?.logo_url ?? "",
              website: brand?.website ?? "",
              industry: brand?.industry ?? "",
            }}
          />
        </div>
      </main>
    </div>
  )
}
