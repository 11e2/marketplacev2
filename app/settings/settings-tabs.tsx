"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserSupabase } from "@/lib/supabase-browser"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface ProfileData {
  email: string
  name: string
  avatarUrl: string
  role: "CREATOR" | "BRAND" | "ADMIN"
  bio: string
  niches: string[]
  companyName: string
  logoUrl: string
  website: string
  industry: string
}

interface Prefs {
  emailDeals: boolean
  emailMessages: boolean
  emailPayouts: boolean
  emailMarketing: boolean
  pushDeals: boolean
  pushMessages: boolean
}

const inputCls =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6C5CE7] transition-colors"
const labelCls = "block text-xs font-semibold mb-1.5 uppercase tracking-wide text-muted-foreground"
const btnPrimary =
  "bg-[#6C5CE7] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#5a4dd4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
const btnDanger =
  "bg-[#FF6B6B] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#e55e5e] disabled:opacity-50 transition-colors"

export function SettingsTabs({ profile }: { profile: ProfileData }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-4 w-full mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileTab profile={profile} />
      </TabsContent>
      <TabsContent value="password">
        <PasswordTab />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
      <TabsContent value="account">
        <AccountTab email={profile.email} />
      </TabsContent>
    </Tabs>
  )
}

function Card({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}
      {children}
    </div>
  )
}

function ProfileTab({ profile }: { profile: ProfileData }) {
  const [name, setName] = useState(profile.name)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [bio, setBio] = useState(profile.bio)
  const [niches, setNiches] = useState<string[]>(profile.niches)
  const [companyName, setCompanyName] = useState(profile.companyName)
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl)
  const [website, setWebsite] = useState(profile.website)
  const [industry, setIndustry] = useState(profile.industry)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>, which: "avatar" | "logo") {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = createBrowserSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split(".").pop() || "png"
    const path = `${user.id}/${which}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (error) return toast.error(error.message)
    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    which === "avatar" ? setAvatarUrl(data.publicUrl) : setLogoUrl(data.publicUrl)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const body: Record<string, unknown> = { name, avatarUrl }
    if (profile.role === "CREATOR") {
      body.bio = bio
      body.niches = niches
    } else if (profile.role === "BRAND") {
      body.companyName = companyName
      body.logoUrl = logoUrl
      body.website = website || undefined
      body.industry = industry
    }
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return toast.error(j?.error?.message || "Failed to save")
    }
    toast.success("Profile updated")
    router.refresh()
  }

  return (
    <Card title="Profile" description="How you appear across Marketingplace.">
      <form onSubmit={onSave} className="space-y-5">
        <div>
          <label className={labelCls}>Email</label>
          <input disabled value={profile.email} className={inputCls + " opacity-60"} />
        </div>
        <div>
          <label className={labelCls}>{profile.role === "BRAND" ? "Contact name" : "Display name"}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{profile.role === "BRAND" ? "Logo" : "Avatar"}</label>
          <div className="flex items-center gap-3">
            {(profile.role === "BRAND" ? logoUrl : avatarUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.role === "BRAND" ? logoUrl : avatarUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-border"
              />
            )}
            <label className="text-sm text-[#6C5CE7] hover:underline cursor-pointer">
              Upload new image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onAvatar(e, profile.role === "BRAND" ? "logo" : "avatar")}
              />
            </label>
          </div>
        </div>

        {profile.role === "CREATOR" && (
          <>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className={labelCls}>Niches (comma separated)</label>
              <input
                value={niches.join(", ")}
                onChange={(e) =>
                  setNiches(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                className={inputCls}
              />
            </div>
          </>
        )}

        {profile.role === "BRAND" && (
          <>
            <div>
              <label className={labelCls}>Company name</label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} />
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </Card>
  )
}

function PasswordTab() {
  const [currentPassword, setCurrent] = useState("")
  const [newPassword, setNew] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters")
    if (newPassword !== confirm) return toast.error("Passwords don't match")
    setLoading(true)
    const res = await fetch("/api/users/me/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return toast.error(j?.error?.message || "Failed to update password")
    }
    setCurrent("")
    setNew("")
    setConfirm("")
    toast.success("Password updated")
  }

  return (
    <Card title="Password" description="Choose a strong, unique password.">
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className={labelCls}>Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Confirm new password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
          />
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </Card>
  )
}

const PREF_LABELS: Array<[keyof Prefs, string, string]> = [
  ["emailDeals", "Deal updates", "New proposals, accepted deals, status changes"],
  ["emailMessages", "Messages", "New messages from brands or creators"],
  ["emailPayouts", "Payouts", "Escrow releases, withdrawals, transaction confirmations"],
  ["emailMarketing", "Product updates", "Launches, tips, occasional newsletters"],
  ["pushDeals", "Push: deals", "Real-time deal activity in-app"],
  ["pushMessages", "Push: messages", "Real-time message alerts in-app"],
]

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/users/me/notifications")
      .then((r) => r.json())
      .then((j) => setPrefs(j.prefs))
      .catch(() => toast.error("Failed to load preferences"))
  }, [])

  async function onSave() {
    if (!prefs) return
    setLoading(true)
    const res = await fetch("/api/users/me/notifications", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(prefs),
    })
    setLoading(false)
    if (!res.ok) return toast.error("Failed to save preferences")
    toast.success("Preferences saved")
  }

  return (
    <Card title="Notifications" description="Pick what we can bother you about.">
      {!prefs ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {PREF_LABELS.map(([key, label, desc]) => (
            <label key={key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                className="mt-1 accent-[#6C5CE7]"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </label>
          ))}
          <button onClick={onSave} disabled={loading} className={btnPrimary}>
            {loading ? "Saving..." : "Save preferences"}
          </button>
        </div>
      )}
    </Card>
  )
}

function AccountTab({ email }: { email: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [typedDelete, setTypedDelete] = useState("")

  async function onDelete() {
    setLoading(true)
    const res = await fetch("/api/users/me/delete", { method: "POST" })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      toast.error(j?.error?.message || "Failed to delete account")
      return
    }
    toast.success("Account deleted")
    router.push("/")
    router.refresh()
  }

  function requestDelete() {
    if (confirm !== email) {
      toast.error("Type your email exactly to confirm")
      return
    }
    setTypedDelete("")
    setDialogOpen(true)
  }

  return (
    <Card
      title="Delete account"
      description="Permanently remove your account, profile, and associated data. This cannot be undone."
    >
      <p className="text-sm text-muted-foreground mb-3">
        Type <span className="font-mono text-foreground">{email}</span> to confirm.
      </p>
      <div className="flex flex-col gap-3 max-w-md">
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={email}
          className={inputCls}
        />
        <button onClick={requestDelete} disabled={loading || confirm !== email} className={btnDanger}>
          {loading ? "Deleting..." : "Delete my account"}
        </button>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v)
          if (!v) setTypedDelete("")
        }}
        title="Delete your account?"
        description="This permanently removes your account, profile, deals, messages, submissions, and balances. This cannot be undone."
        confirmLabel="Permanently delete"
        variant="destructive"
        confirmDisabled={typedDelete !== "DELETE"}
        onConfirm={onDelete}
      >
        <div className="space-y-1.5">
          <p className="text-xs text-[#8892A8]">
            Type <span className="font-mono text-[#E2E8F0] font-semibold">DELETE</span> to enable the button.
          </p>
          <input
            value={typedDelete}
            onChange={(e) => setTypedDelete(e.target.value)}
            autoFocus
            placeholder="DELETE"
            className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#8892A8] outline-none focus:border-[#FF6B6B] transition-colors font-mono"
          />
        </div>
      </ConfirmDialog>
    </Card>
  )
}
