"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import { createBrowserSupabase } from "@/lib/supabase"
import { AuthShell, authButton } from "@/components/auth-shell"

export default function VerifyPage() {
  const email = useSearchParams().get("email") || ""
  const [loading, setLoading] = useState(false)

  async function resend() {
    if (!email) {
      toast.error("Missing email address")
      return
    }
    setLoading(true)
    const supabase = createBrowserSupabase()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success("Verification email sent")
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle={email ? `We sent a verification link to ${email}.` : "We sent you a verification link."}
      footer={
        <p>
          Wrong address?{" "}
          <Link href="/auth/signup" className="text-[#6C5CE7] font-semibold hover:underline">
            Sign up again
          </Link>
        </p>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-[#6C5CE7]/15 flex items-center justify-center mb-4">
          <Mail size={24} className="text-[#6C5CE7]" />
        </div>
        <p className="text-sm text-[#8892A8] mb-6">
          Click the link in the email to activate your account. Don&apos;t see it? Check your spam folder.
        </p>
        <button type="button" onClick={resend} disabled={loading} className={authButton}>
          {loading ? "Sending..." : "Resend verification email"}
        </button>
      </div>
    </AuthShell>
  )
}
