"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { createBrowserSupabase } from "@/lib/supabase-browser"
import { AuthShell, authInput, authButton, authLabel } from "@/components/auth-shell"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createBrowserSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <p>
          Remember it?{" "}
          <Link href="/auth/signin" className="text-[#6C5CE7] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <p className="text-sm text-[#8892A8] py-4">
          If an account exists for <span className="text-white font-semibold">{email}</span>, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={authLabel}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInput}
            />
          </div>
          <button type="submit" disabled={loading} className={authButton}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
