"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createBrowserSupabase } from "@/lib/supabase"
import { authInput, authButton, authLabel } from "@/components/auth-shell"

const NICHES = [
  "Gaming",
  "Tech",
  "Finance",
  "Fitness",
  "Beauty",
  "Fashion",
  "Food",
  "Travel",
  "Comedy",
  "Education",
  "Music",
  "Lifestyle",
]

const INDUSTRIES = [
  "SaaS",
  "Consumer Goods",
  "Gaming",
  "Fintech",
  "Crypto",
  "Fashion",
  "Food & Beverage",
  "Health",
  "Education",
  "Other",
]

type Role = "CREATOR" | "BRAND"

export function OnboardingForm({
  role,
  defaultName,
  defaultAvatar,
}: {
  role: Role
  defaultName: string
  defaultAvatar: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Shared
  const [name, setName] = useState(defaultName)
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar)

  // Creator
  const [bio, setBio] = useState("")
  const [niches, setNiches] = useState<string[]>([])

  // Brand
  const [companyName, setCompanyName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [website, setWebsite] = useState("")
  const [industry, setIndustry] = useState(INDUSTRIES[0])

  function toggleNiche(n: string) {
    setNiches((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]))
  }

  async function uploadImage(file: File, kind: "avatar" | "logo") {
    const supabase = createBrowserSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    const ext = file.name.split(".").pop() || "png"
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (error) {
      toast.error(error.message)
      return null
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    return data.publicUrl
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, "avatar")
    if (url) setAvatarUrl(url)
  }

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, "logo")
    if (url) setLogoUrl(url)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return toast.error("Name is required")
    if (role === "CREATOR" && niches.length === 0) return toast.error("Pick at least one niche")
    if (role === "BRAND" && !companyName.trim()) return toast.error("Company name is required")

    setLoading(true)
    const body =
      role === "CREATOR"
        ? { role, name, avatarUrl, bio, niches }
        : { role, name, avatarUrl, companyName, logoUrl, website, industry }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setLoading(false)
      toast.error(j?.error?.message || "Failed to save profile")
      return
    }

    const supabase = createBrowserSupabase()
    await supabase.auth.updateUser({ data: { onboarded: true, role, name } })
    toast.success("Welcome aboard")
    router.push(role === "CREATOR" ? "/marketplace" : "/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="bg-[#131825] border border-[#2A3050] rounded-2xl p-8 space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-widest mb-2">
          {role === "CREATOR" ? "Creator setup" : "Brand setup"}
        </p>
        <h1 className="text-2xl font-bold text-white">Tell us about {role === "CREATOR" ? "you" : "your brand"}</h1>
        <p className="text-sm text-[#8892A8] mt-1">
          {role === "CREATOR"
            ? "This shows up to brands browsing the marketplace."
            : "This shows up to creators considering your campaigns."}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {(role === "CREATOR" ? avatarUrl : logoUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={role === "CREATOR" ? avatarUrl : logoUrl}
            alt=""
            className="w-16 h-16 rounded-full object-cover border border-[#2A3050]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#0B0F1A] border border-[#2A3050] flex items-center justify-center text-[#8892A8] text-xs">
            {role === "CREATOR" ? "Avatar" : "Logo"}
          </div>
        )}
        <label className="text-sm text-[#6C5CE7] hover:underline cursor-pointer">
          Upload {role === "CREATOR" ? "avatar" : "logo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={role === "CREATOR" ? onAvatarChange : onLogoChange}
          />
        </label>
      </div>

      <div>
        <label className={authLabel}>{role === "CREATOR" ? "Display name" : "Contact name"}</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={authInput} />
      </div>

      {role === "CREATOR" ? (
        <>
          <div>
            <label className={authLabel}>Bio</label>
            <textarea
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What do you create? Who's your audience?"
              className={authInput + " resize-none"}
            />
          </div>
          <div>
            <label className={authLabel}>Niches (pick at least one)</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => {
                const active = niches.includes(n)
                return (
                  <button
                    type="button"
                    key={n}
                    onClick={() => toggleNiche(n)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-[#6C5CE7] border-[#6C5CE7] text-white"
                        : "bg-[#0B0F1A] border-[#2A3050] text-[#8892A8] hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className={authLabel}>Company name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={authInput}
            />
          </div>
          <div>
            <label className={authLabel}>Website</label>
            <input
              type="url"
              placeholder="https://"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={authInput}
            />
          </div>
          <div>
            <label className={authLabel}>Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={authInput}
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <button type="submit" disabled={loading} className={authButton}>
        {loading ? "Saving..." : "Finish setup"}
      </button>
    </form>
  )
}
