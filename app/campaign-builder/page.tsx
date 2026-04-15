"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, Smartphone, Video, MessageCircle, BookOpen, Headphones, Sparkles, Eye, Upload, X, Zap, DollarSign, Users } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip } from "@/components/channel-chip"
import { channelColors } from "@/lib/data"
import { createBrowserSupabase } from "@/lib/supabase-browser"

const steps = ["Campaign Type", "Details", "Requirements", "Asset", "Review"]

const channelGroups = [
  {
    category: "Short-Form Video (Clipping)",
    icon: Smartphone,
    color: "#6C5CE7",
    channels: ["TikTok", "Reels", "Shorts"],
    isClipping: true,
    description: "Creators overlay your brand asset on their videos",
  },
  {
    category: "Long-Form Video",
    icon: Video,
    color: "#FF4444",
    channels: ["YouTube Preroll", "Dedicated Video", "Mid-Roll", "Twitch"],
    isClipping: false,
    description: "Traditional sponsorship integrations",
  },
  {
    category: "Social Posts",
    icon: MessageCircle,
    color: "#94A3B8",
    channels: ["Tweet Thread", "IG Story", "Carousel"],
    isClipping: false,
    description: "Sponsored social media content",
  },
  {
    category: "Community",
    icon: MessageCircle,
    color: "#4ECDC4",
    channels: ["Discord Post", "Discord Server", "Telegram", "Reddit"],
    isClipping: false,
    description: "Community sponsorships and posts",
  },
  {
    category: "Written Content",
    icon: BookOpen,
    color: "#4A9EFF",
    channels: ["Newsletter Placement", "Newsletter Dedicated", "Blog Post"],
    isClipping: false,
    description: "Newsletter and blog sponsorships",
  },
  {
    category: "Audio",
    icon: Headphones,
    color: "#FF9F43",
    channels: ["Podcast Pre-Roll", "Podcast Mid-Roll", "Dedicated Episode"],
    isClipping: false,
    description: "Podcast ad reads and sponsorships",
  },
]

interface FormData {
  campaignType: "clipping" | "standard" | null
  title: string
  description: string
  channels: string[]
  cpm: number
  minFollowers: number
  minViews: number
  totalBudget: number
  brandAssetUrl: string | null
  brandAssetFile: File | null
}

export default function CampaignBuilderPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [formData, setFormData] = useState<FormData>({
    campaignType: null,
    title: "",
    description: "",
    channels: [],
    cpm: 8,
    minFollowers: 5000,
    minViews: 1000,
    totalBudget: 10000,
    brandAssetUrl: null,
    brandAssetFile: null,
  })

  const assetInputRef = useRef<HTMLInputElement>(null)

  const selectCampaignType = (type: "clipping" | "standard") => {
    setFormData((prev) => ({
      ...prev,
      campaignType: type,
      channels: type === "clipping" ? ["TikTok", "Reels", "Shorts"] : [],
    }))
  }

  const toggleChannel = (ch: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }))
  }

  const handleAssetSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    setFormData((prev) => ({
      ...prev,
      brandAssetFile: file,
      brandAssetUrl: url,
    }))
  }

  const clearAsset = () => {
    if (formData.brandAssetUrl) {
      URL.revokeObjectURL(formData.brandAssetUrl)
    }
    setFormData((prev) => ({
      ...prev,
      brandAssetFile: null,
      brandAssetUrl: null,
    }))
  }

  const goToStep = (step: number) => {
    if (step < activeStep || step === activeStep + 1) {
      setActiveStep(step)
    }
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  async function uploadBrandAsset(): Promise<string | null> {
    if (!formData.brandAssetFile) return null
    const supabase = createBrowserSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error("You must be signed in")
      return null
    }
    const ext = formData.brandAssetFile.name.split(".").pop() || "png"
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from("campaign-assets")
      .upload(path, formData.brandAssetFile, { upsert: true })
    if (error) {
      toast.error(error.message)
      return null
    }
    const { data } = supabase.storage.from("campaign-assets").getPublicUrl(path)
    return data.publicUrl
  }

  function validatePayload(publish: boolean): string | null {
    if (!formData.campaignType) return "Pick a campaign type first"
    if (formData.title.trim().length < 1) return "Give your campaign a title before saving"
    if (!publish) return null
    if (formData.title.trim().length < 3) return "Title must be at least 3 characters"
    if (formData.description.trim().length < 10) return "Description must be at least 10 characters"
    if (formData.channels.length === 0) return "Pick at least one channel"
    if (formData.totalBudget <= 0) return "Set a budget before publishing"
    return null
  }

  async function save(publish: boolean) {
    if (formData.campaignType === "standard") {
      toast.info("Standard campaigns are coming soon")
      return
    }
    const err = validatePayload(publish)
    if (err) return toast.error(err)

    setSaving(publish ? "publish" : "draft")

    let assetUrl = formData.brandAssetUrl
    if (formData.brandAssetFile && (!assetUrl || assetUrl.startsWith("blob:"))) {
      const uploaded = await uploadBrandAsset()
      if (!uploaded) {
        setSaving(null)
        return
      }
      assetUrl = uploaded
      setFormData((prev) => ({ ...prev, brandAssetUrl: uploaded }))
    }

    const body = {
      title: formData.title,
      description: formData.description,
      type: "CLIPPING" as const,
      channels: formData.channels,
      totalBudget: formData.totalBudget,
      cpm: formData.cpm,
      minFollowers: formData.minFollowers,
      minViews: formData.minViews,
      brandAssetUrl: assetUrl && !assetUrl.startsWith("blob:") ? assetUrl : undefined,
      publish,
    }

    let res: Response
    try {
      res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      })
    } catch (fetchErr) {
      console.error("[campaign-builder] network error:", fetchErr)
      setSaving(null)
      toast.error("Network error. Check your connection and try again.")
      return
    }
    setSaving(null)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      console.error("[campaign-builder] save failed", res.status, j)
      toast.error(j?.error?.message || `Failed to save campaign (${res.status})`)
      return
    }
    const { id } = await res.json()
    toast.success(publish ? "Campaign published" : "Draft saved")
    router.push(publish ? `/campaigns/${id}/manage` : "/campaigns")
  }

  const handlePublish = () => save(true)
  const handleSaveDraft = () => save(false)

  const isClipping = formData.campaignType === "clipping"
  const estimatedReach = Math.floor(formData.totalBudget / formData.cpm * 1000)

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="brand" />

      <main className="flex-1 min-w-0 px-6 py-6">
        {/* Stepper */}
        <div className="bg-[#131825] border border-[#2A3050] rounded-2xl px-6 py-5 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => goToStep(i)}
                  className="flex flex-col items-center gap-1.5"
                  disabled={i > activeStep + 1}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={
                      i < activeStep
                        ? { backgroundColor: "#00B894", color: "#fff", cursor: "pointer" }
                        : i === activeStep
                        ? { backgroundColor: "#6C5CE7", color: "#fff" }
                        : { backgroundColor: "#1A2035", color: "#8892A8", border: "1px solid #2A3050" }
                    }
                  >
                    {i < activeStep ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide hidden md:block"
                    style={{ color: i === activeStep ? "#6C5CE7" : i < activeStep ? "#00B894" : "#8892A8" }}
                  >
                    {step}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-px mx-2 mb-5"
                    style={{ backgroundColor: i < activeStep ? "#00B894" : "#2A3050" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Left: Step content */}
          <div className="flex-1 min-w-0">
            {/* Step 1: Campaign Type */}
            {activeStep === 0 && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Choose Campaign Type</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Select how you want creators to promote your brand
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Clipping Campaign */}
                  <button
                    onClick={() => selectCampaignType("clipping")}
                    className="p-6 rounded-xl border-2 text-left transition-all"
                    style={
                      formData.campaignType === "clipping"
                        ? { borderColor: "#6C5CE7", backgroundColor: "#6C5CE710" }
                        : { borderColor: "#2A3050", backgroundColor: "#131825" }
                    }
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#6C5CE720] flex items-center justify-center">
                        <Zap size={24} className="text-[#6C5CE7]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#E2E8F0]">Clipping Campaign</h3>
                        <p className="text-xs text-[#6C5CE7] font-semibold">Recommended</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#8892A8] mb-4">
                      Upload your brand asset and creators will overlay it on their TikTok, Reels, and Shorts content. Pay per 1,000 views (CPM).
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ChannelChip channel="TikTok" />
                      <ChannelChip channel="Reels" />
                      <ChannelChip channel="Shorts" />
                    </div>
                  </button>

                  {/* Standard Campaign */}
                  <button
                    onClick={() => selectCampaignType("standard")}
                    className="p-6 rounded-xl border-2 text-left transition-all opacity-60"
                    style={
                      formData.campaignType === "standard"
                        ? { borderColor: "#8892A8", backgroundColor: "#8892A810" }
                        : { borderColor: "#2A3050", backgroundColor: "#131825" }
                    }
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#8892A820] flex items-center justify-center">
                        <Sparkles size={24} className="text-[#8892A8]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#E2E8F0]">Standard Campaign</h3>
                        <p className="text-xs text-[#8892A8] font-semibold">Traditional Sponsorship</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#8892A8] mb-4">
                      Traditional sponsorships for YouTube, Discord, newsletters, podcasts, and more. Negotiate directly with creators.
                    </p>
                    <span className="text-xs text-[#8892A8] bg-[#8892A820] px-3 py-1 rounded-full">
                      Coming Soon - Template Only
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details (Clipping) */}
            {activeStep === 1 && isClipping && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Campaign Details</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Set your campaign name and description
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-2">Campaign Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Summer Brand Awareness"
                      className="w-full bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your campaign goals, target audience, content guidelines..."
                      rows={4}
                      className="w-full bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-2">Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {["TikTok", "Reels", "Shorts"].map((ch) => {
                        const isSelected = formData.channels.includes(ch)
                        return (
                          <button
                            key={ch}
                            onClick={() => toggleChannel(ch)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all"
                            style={
                              isSelected
                                ? { borderColor: channelColors[ch] || "#6C5CE7", backgroundColor: `${channelColors[ch] || "#6C5CE7"}20` }
                                : { borderColor: "#2A3050", backgroundColor: "#131825" }
                            }
                          >
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center border"
                              style={
                                isSelected
                                  ? { backgroundColor: channelColors[ch] || "#6C5CE7", borderColor: channelColors[ch] || "#6C5CE7" }
                                  : { borderColor: "#2A3050" }
                              }
                            >
                              {isSelected && <Check size={10} stroke="#fff" strokeWidth={3} />}
                            </div>
                            <span className="text-sm" style={{ color: isSelected ? "#E2E8F0" : "#8892A8" }}>{ch}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details (Standard - Template) */}
            {activeStep === 1 && !isClipping && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Campaign Details</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Standard campaign configuration
                  </p>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#8892A820] flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-[#8892A8]" />
                  </div>
                  <p className="font-bold text-[#E2E8F0] mb-2">Standard Campaign Builder</p>
                  <p className="text-sm text-[#8892A8]">
                    This feature is coming soon. Continue to see a preview of the review step.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Requirements (Clipping) */}
            {activeStep === 2 && isClipping && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Campaign Requirements</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Set your CPM, creator requirements, and budget
                  </p>
                </div>

                <div className="space-y-6">
                  {/* CPM */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#00B89420] flex items-center justify-center">
                        <DollarSign size={20} className="text-[#00B894]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#E2E8F0]">CPM (Cost per 1,000 views)</h3>
                        <p className="text-xs text-[#8892A8]">How much you pay per 1,000 video views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="2"
                        max="25"
                        value={formData.cpm}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cpm: Number(e.target.value) }))}
                        className="flex-1"
                      />
                      <div className="w-24 bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-center">
                        <span className="text-lg font-bold font-mono text-[#00B894]">${formData.cpm}</span>
                      </div>
                    </div>
                  </div>

                  {/* Min Followers */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#6C5CE720] flex items-center justify-center">
                        <Users size={20} className="text-[#6C5CE7]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#E2E8F0]">Minimum Followers</h3>
                        <p className="text-xs text-[#8892A8]">Creator must have at least this many followers</p>
                      </div>
                    </div>
                    <select
                      value={formData.minFollowers}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minFollowers: Number(e.target.value) }))}
                      className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#6C5CE7]"
                    >
                      <option value={1000}>1,000+ followers</option>
                      <option value={5000}>5,000+ followers</option>
                      <option value={10000}>10,000+ followers</option>
                      <option value={25000}>25,000+ followers</option>
                      <option value={50000}>50,000+ followers</option>
                      <option value={100000}>100,000+ followers</option>
                    </select>
                  </div>

                  {/* Min Views */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#FF6B3520] flex items-center justify-center">
                        <Eye size={20} className="text-[#FF6B35]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#E2E8F0]">Minimum Views per Video</h3>
                        <p className="text-xs text-[#8892A8]">Only pay for videos that reach this view count</p>
                      </div>
                    </div>
                    <select
                      value={formData.minViews}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minViews: Number(e.target.value) }))}
                      className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#6C5CE7]"
                    >
                      <option value={500}>500+ views</option>
                      <option value={1000}>1,000+ views</option>
                      <option value={5000}>5,000+ views</option>
                      <option value={10000}>10,000+ views</option>
                      <option value={25000}>25,000+ views</option>
                    </select>
                  </div>

                  {/* Total Budget */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#4ECDC420] flex items-center justify-center">
                        <DollarSign size={20} className="text-[#4ECDC4]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#E2E8F0]">Total Budget</h3>
                        <p className="text-xs text-[#8892A8]">Maximum spend for this campaign</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={formData.totalBudget}
                      onChange={(e) => setFormData((prev) => ({ ...prev, totalBudget: Number(e.target.value) }))}
                      className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-4 py-3 text-sm text-[#E2E8F0] outline-none focus:border-[#6C5CE7]"
                    />
                    <p className="text-xs text-[#8892A8] mt-2">
                      Estimated reach: <span className="font-mono font-semibold text-[#E2E8F0]">{estimatedReach.toLocaleString()}</span> views
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Requirements (Standard - Template) */}
            {activeStep === 2 && !isClipping && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Requirements</h2>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#8892A820] flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-[#8892A8]" />
                  </div>
                  <p className="font-bold text-[#E2E8F0] mb-2">Requirements Configuration</p>
                  <p className="text-sm text-[#8892A8]">Coming soon for standard campaigns.</p>
                </div>
              </div>
            )}

            {/* Step 4: Asset Upload (Clipping) */}
            {activeStep === 3 && isClipping && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Upload Brand Asset</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Upload the logo or image that creators will overlay on their videos
                  </p>
                </div>

                <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                  {!formData.brandAssetUrl ? (
                    <div
                      onClick={() => assetInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const file = e.dataTransfer.files[0]
                        if (file) handleAssetSelect(file)
                      }}
                      className="border-2 border-dashed border-[#2A3050] rounded-xl p-10 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[#6C5CE710] transition-colors"
                    >
                      <Upload className="mx-auto h-12 w-12 text-[#8892A8] mb-4" />
                      <p className="text-base text-[#E2E8F0] font-medium mb-1">
                        Drop your brand asset here
                      </p>
                      <p className="text-sm text-[#8892A8]">
                        PNG, JPG, or WebP with transparent background recommended
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-[#0B0F1A] rounded-xl">
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-3">
                        <Image
                          src={formData.brandAssetUrl}
                          alt="Brand asset preview"
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#E2E8F0]">{formData.brandAssetFile?.name}</p>
                        <p className="text-xs text-[#00B894]">Ready to use</p>
                      </div>
                      <button
                        onClick={clearAsset}
                        className="p-2 rounded-lg hover:bg-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                  <input
                    ref={assetInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleAssetSelect(file)
                    }}
                  />
                </div>

                <div className="mt-4 bg-[#6C5CE710] border border-[#6C5CE730] rounded-xl p-4">
                  <h4 className="font-semibold text-[#6C5CE7] text-sm mb-2">Tips for best results:</h4>
                  <ul className="text-xs text-[#8892A8] space-y-1">
                    <li>Use a PNG with transparent background</li>
                    <li>Keep it simple - logos work best</li>
                    <li>Recommended size: 400x200 pixels or larger</li>
                    <li>High contrast colors for visibility</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Asset (Standard - Template) */}
            {activeStep === 3 && !isClipping && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Assets</h2>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#8892A820] flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-[#8892A8]" />
                  </div>
                  <p className="font-bold text-[#E2E8F0] mb-2">Asset Management</p>
                  <p className="text-sm text-[#8892A8]">Coming soon for standard campaigns.</p>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {activeStep === 4 && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Review Campaign</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Review your campaign details before publishing
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Campaign type */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Campaign Type</h3>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isClipping ? "bg-[#6C5CE720]" : "bg-[#8892A820]"}`}>
                        {isClipping ? <Zap size={20} className="text-[#6C5CE7]" /> : <Sparkles size={20} className="text-[#8892A8]" />}
                      </div>
                      <span className="font-semibold text-[#E2E8F0]">
                        {isClipping ? "Clipping Campaign" : "Standard Campaign"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Campaign Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8892A8]">Title</span>
                        <span className="text-[#E2E8F0] font-semibold">{formData.title || "Untitled Campaign"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[#8892A8]">Description</span>
                        <p className="text-[#E2E8F0] mt-1 text-xs leading-relaxed">{formData.description || "No description provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Channels */}
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Channels</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.channels.length > 0 ? (
                        formData.channels.map((ch) => (
                          <ChannelChip key={ch} channel={ch in channelColors ? ch : "TikTok"} />
                        ))
                      ) : (
                        <span className="text-sm text-[#8892A8]">No channels selected</span>
                      )}
                    </div>
                  </div>

                  {/* Requirements (Clipping only) */}
                  {isClipping && (
                    <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                      <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Requirements</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-[#8892A8]">CPM</span>
                          <p className="font-mono font-bold text-[#00B894]">${formData.cpm}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[#8892A8]">Total Budget</span>
                          <p className="font-mono font-bold text-[#E2E8F0]">${formData.totalBudget.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[#8892A8]">Min Followers</span>
                          <p className="font-mono font-bold text-[#E2E8F0]">{formData.minFollowers.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[#8892A8]">Min Views</span>
                          <p className="font-mono font-bold text-[#E2E8F0]">{formData.minViews.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Asset preview */}
                  {isClipping && formData.brandAssetUrl && (
                    <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                      <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Brand Asset</h3>
                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-3">
                        <Image
                          src={formData.brandAssetUrl}
                          alt="Brand asset"
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving !== null}
                      className="flex-1 border border-[#2A3050] text-[#E2E8F0] hover:bg-[#1A2035] text-sm font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {saving === "draft" ? "Saving..." : "Save as Draft"}
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={saving !== null}
                      className="flex-1 bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Zap size={18} />
                      {saving === "publish" ? "Publishing..." : "Publish Campaign"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="border border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Back{activeStep > 0 ? `: ${steps[activeStep - 1]}` : ""}
              </button>
              <div className="flex items-center gap-2">
                {formData.campaignType === "clipping" && formData.title.trim().length > 0 && (
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving !== null}
                    className="border border-[#2A3050] text-[#E2E8F0] hover:bg-[#1A2035] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving === "draft" ? "Saving..." : "Save Draft"}
                  </button>
                )}
                {activeStep < steps.length - 1 && (
                  <button
                    onClick={handleNext}
                    disabled={activeStep === 0 && !formData.campaignType}
                    className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue: {steps[activeStep + 1]}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={14} className="text-[#8892A8]" />
                <span className="text-xs font-bold text-[#8892A8] uppercase tracking-widest">Live Preview</span>
              </div>
              <div className="bg-[#131825] border border-[#2A3050] rounded-xl overflow-hidden shadow-xl">
                <div className="h-1.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF6B35]" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {formData.brandAssetUrl ? (
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1">
                          <Image
                            src={formData.brandAssetUrl}
                            alt="Brand"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] flex items-center justify-center text-white text-xs font-bold">
                          ?
                        </div>
                      )}
                      <span className="text-xs font-bold text-[#E2E8F0]">
                        {formData.title || "Your Brand"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-1 rounded-full bg-[#00B89420] text-[#00B894]">
                      CPM ${formData.cpm}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#E2E8F0] mb-1">
                    {formData.title || "Campaign Title"}
                  </h4>
                  <p className="text-[10px] text-[#8892A8] leading-relaxed line-clamp-2 mb-3">
                    {formData.description || "Your campaign description will appear here..."}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {formData.channels.slice(0, 3).map((ch) => (
                      <span
                        key={ch}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${channelColors[ch] || "#6C5CE7"}30`, color: channelColors[ch] || "#6C5CE7" }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[#2A3050] flex items-center justify-between">
                    <span className="text-[10px] text-[#8892A8]">
                      Budget: <span className="font-mono font-semibold text-[#E2E8F0]">${formData.totalBudget.toLocaleString()}</span>
                    </span>
                    <span className="bg-[#6C5CE7] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                      Apply
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
