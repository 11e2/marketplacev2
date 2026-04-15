import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin?redirectTo=/onboarding")

  if (user.user_metadata?.onboarded) redirect("/marketplace")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role, avatar_url")
    .eq("id", user.id)
    .single()

  const role = (profile?.role as "CREATOR" | "BRAND" | "ADMIN") || "CREATOR"

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <OnboardingForm
          role={role === "BRAND" ? "BRAND" : "CREATOR"}
          defaultName={profile?.name ?? ""}
          defaultAvatar={profile?.avatar_url ?? ""}
        />
      </div>
    </div>
  )
}
