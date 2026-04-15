"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createBrowserSupabase } from "@/lib/supabase-browser"
import { AuthShell, authInput, authButton, authLabel } from "@/components/auth-shell"

export default function SignInPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get("redirectTo") || "/marketplace"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createBrowserSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Signed in")
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Marketingplace account"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-[#6C5CE7] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={authLabel}>Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInput}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={authLabel + " mb-0"}>Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-[#6C5CE7] hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInput}
          />
        </div>
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  )
}
