"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createBrowserSupabase } from "@/lib/supabase-browser"
import { AuthShell, authInput, authButton, authLabel } from "@/components/auth-shell"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords don't match")
      return
    }
    setLoading(true)
    const supabase = createBrowserSupabase()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Password updated")
    router.push("/marketplace")
    router.refresh()
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={authLabel}>New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInput}
          />
        </div>
        <div>
          <label className={authLabel}>Confirm password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authInput}
          />
        </div>
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  )
}
