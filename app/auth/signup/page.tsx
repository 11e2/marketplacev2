"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createBrowserSupabase } from "@/lib/supabase"
import { AuthShell, authInput, authButton, authLabel } from "@/components/auth-shell"

type Role = "CREATOR" | "BRAND"

export default function SignUpPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("CREATOR")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    const supabase = createBrowserSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    if (data.session) {
      router.push("/onboarding")
      router.refresh()
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Marketingplace as a creator or brand"
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-[#6C5CE7] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex gap-2 mb-5 p-1 bg-[#0B0F1A] rounded-lg border border-[#2A3050]">
        {(["CREATOR", "BRAND"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              role === r ? "bg-[#6C5CE7] text-white" : "text-[#8892A8] hover:text-white"
            }`}
          >
            {r === "CREATOR" ? "I'm a Creator" : "I'm a Brand"}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={authLabel}>{role === "CREATOR" ? "Display name" : "Contact name"}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={authInput} />
        </div>
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
          <label className={authLabel}>Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInput}
          />
          <p className="text-xs text-[#8892A8] mt-1">At least 8 characters</p>
        </div>
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  )
}
