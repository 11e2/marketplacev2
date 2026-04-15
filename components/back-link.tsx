"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { createBrowserSupabase } from "@/lib/supabase-browser"

export function BackLink() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createBrowserSupabase()
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthed(!!data.user)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const href = authed ? "/marketplace" : "/"
  const label = authed ? "Back to app" : "Back to home"

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors mb-8"
    >
      <ArrowLeft size={14} />
      {authed === null ? "Back" : label}
    </Link>
  )
}
