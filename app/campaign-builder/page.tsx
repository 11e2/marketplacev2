"use client"

import { useState } from "react"
import { Check, Smartphone, Video, MessageCircle, BookOpen, Headphones, Sparkles, Eye } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"
import { ChannelChip } from "@/components/channel-chip"
import { channelColors } from "@/lib/data"

const steps = ["Brief", "Channels", "Budget", "Requirements", "Assets", "Review"]

const channelGroups = [
  {
    category: "Short-Form Video",
    icon: Smartphone,
    color: "#6C5CE7",
    channels: ["TikTok", "Reels", "Shorts"],
  },
  {
    category: "Long-Form Video",
    icon: Video,
    color: "#FF4444",
    channels: ["YouTube Preroll", "Dedicated Video", "Mid-Roll", "Twitch"],
  },
  {
    category: "Social Posts",
    icon: MessageCircle,
    color: "#94A3B8",
    channels: ["Tweet Thread", "IG Story", "Carousel"],
  },
  {
    category: "Community",
    icon: MessageCircle,
    color: "#4ECDC4",
    channels: ["Discord Post", "Discord Server", "Telegram", "Reddit"],
  },
  {
    category: "Written Content",
    icon: BookOpen,
    color: "#4A9EFF",
    channels: ["Newsletter Placement", "Newsletter Dedicated", "Blog Post"],
  },
  {
    category: "Audio",
    icon: Headphones,
    color: "#FF9F43",
    channels: ["Podcast Pre-Roll", "Podcast Mid-Roll", "Dedicated Episode"],
  },
  {
    category: "Custom",
    icon: Sparkles,
    color: "#FF6B35",
    channels: ["Product Seeding", "Co-Creation", "Whitelisting"],
  },
]

interface FormData {
  title: string
  description: string
  template: string
  channels: string[]
}

export default function CampaignBuilderPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    template: "",
    channels: ["TikTok", "Discord Server"],
  })

  const toggleChannel = (ch: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
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
            {/* Step 1: Brief */}
            {activeStep === 0 && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Campaign Brief</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Define the basics of your campaign.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-2">Campaign Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Summer Product Launch"
                      className="w-full bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what you're looking for, target audience, key messages..."
                      rows={4}
                      className="w-full bg-[#131825] border border-[#2A3050] rounded-xl px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-2">Campaign Template</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Product Demo", "Brand Integration", "Sponsored Content", "Review/Unboxing", "Tutorial/How-To", "Custom"].map((tpl) => (
                        <button
                          key={tpl}
                          onClick={() => setFormData((prev) => ({ ...prev, template: tpl }))}
                          className="p-3 rounded-xl border text-xs font-semibold text-center transition-all"
                          style={
                            formData.template === tpl
                              ? { borderColor: "#6C5CE7", backgroundColor: "#6C5CE720", color: "#6C5CE7" }
                              : { borderColor: "#2A3050", backgroundColor: "#131825", color: "#8892A8" }
                          }
                        >
                          {tpl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Channels */}
            {activeStep === 1 && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Select Channels</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Choose the channel types for your campaign. You can configure each one after selecting.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
                  {channelGroups.map((group) => {
                    const Icon = group.icon
                    const selectedInGroup = group.channels.filter((ch) => formData.channels.includes(ch))
                    const hasSelected = selectedInGroup.length > 0

                    return (
                      <div
                        key={group.category}
                        className="bg-[#131825] border rounded-xl p-4 transition-all cursor-pointer"
                        style={{
                          borderColor: hasSelected ? `${group.color}60` : "#2A3050",
                          boxShadow: hasSelected ? `0 0 0 1px ${group.color}30` : "none",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${group.color}20` }}
                          >
                            <Icon size={14} style={{ color: group.color }} />
                          </div>
                          <span className="text-xs font-bold text-[#E2E8F0]">{group.category}</span>
                        </div>
                        <div className="space-y-1.5">
                          {group.channels.map((ch) => {
                            const isSelected = formData.channels.includes(ch)
                            return (
                              <label
                                key={ch}
                                className="flex items-center gap-2 cursor-pointer group/ch"
                                onClick={() => toggleChannel(ch)}
                              >
                                <div
                                  className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all border"
                                  style={
                                    isSelected
                                      ? { backgroundColor: group.color, borderColor: group.color }
                                      : { borderColor: "#2A3050" }
                                  }
                                >
                                  {isSelected && <Check size={10} stroke="#fff" strokeWidth={3} />}
                                </div>
                                <span
                                  className="text-xs transition-colors"
                                  style={{ color: isSelected ? "#E2E8F0" : "#8892A8" }}
                                >
                                  {ch}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {formData.channels.length > 0 && (
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-[#E2E8F0] mb-4">Channel Configuration</h3>
                    <div className="space-y-4">
                      {formData.channels.slice(0, 3).map((ch) => (
                        <div key={ch} className="flex items-center gap-4 p-3 bg-[#0B0F1A] rounded-xl">
                          <ChannelChip channel={ch in channelColors ? ch : "TikTok"} size="md" />
                          <div className="flex-1 flex items-center gap-3 flex-wrap">
                            {ch === "TikTok" || ch === "Reels" || ch === "Shorts" ? (
                              <>
                                <select className="bg-[#131825] border border-[#2A3050] rounded-lg px-3 py-1.5 text-xs text-[#E2E8F0] outline-none">
                                  <option>15-30 seconds</option>
                                  <option>30-60 seconds</option>
                                  <option>60-90 seconds</option>
                                </select>
                                <select className="bg-[#131825] border border-[#2A3050] rounded-lg px-3 py-1.5 text-xs text-[#E2E8F0] outline-none">
                                  <option>Any follower count</option>
                                  <option>10K+ followers</option>
                                  <option>50K+ followers</option>
                                  <option>100K+ followers</option>
                                </select>
                              </>
                            ) : ch.includes("Discord") ? (
                              <>
                                <select className="bg-[#131825] border border-[#2A3050] rounded-lg px-3 py-1.5 text-xs text-[#E2E8F0] outline-none">
                                  <option>Any server size</option>
                                  <option>5K+ members</option>
                                  <option>10K+ members</option>
                                  <option>25K+ members</option>
                                </select>
                                <select className="bg-[#131825] border border-[#2A3050] rounded-lg px-3 py-1.5 text-xs text-[#E2E8F0] outline-none">
                                  <option>Any niche</option>
                                  <option>Gaming</option>
                                  <option>Crypto/Web3</option>
                                  <option>Tech</option>
                                </select>
                              </>
                            ) : (
                              <select className="bg-[#131825] border border-[#2A3050] rounded-lg px-3 py-1.5 text-xs text-[#E2E8F0] outline-none">
                                <option>Any audience size</option>
                                <option>5K+ audience</option>
                                <option>25K+ audience</option>
                                <option>100K+ audience</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Steps 3-5: Coming Soon */}
            {(activeStep === 2 || activeStep === 3 || activeStep === 4) && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">{steps[activeStep]}</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Configure {steps[activeStep].toLowerCase()} for your campaign.
                  </p>
                </div>
                <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#6C5CE720] flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-[#6C5CE7]" />
                  </div>
                  <p className="font-bold text-[#E2E8F0] mb-2">{steps[activeStep]} Configuration</p>
                  <p className="text-sm text-[#8892A8]">
                    This step is coming soon. Continue to the next step to complete your campaign.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {activeStep === 5 && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#E2E8F0]">Review Campaign</h2>
                  <p className="text-sm text-[#8892A8] mt-0.5">
                    Review your campaign details before publishing.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Campaign Brief</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8892A8]">Title</span>
                        <span className="text-[#E2E8F0] font-semibold">{formData.title || "Untitled Campaign"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8892A8]">Template</span>
                        <span className="text-[#E2E8F0] font-semibold">{formData.template || "None selected"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[#8892A8]">Description</span>
                        <p className="text-[#E2E8F0] mt-1 text-xs leading-relaxed">{formData.description || "No description provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Selected Channels</h3>
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

                  <button
                    onClick={() => toast.success("Campaign published! It will appear in the marketplace shortly.")}
                    className="w-full bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-bold py-3.5 rounded-xl transition-colors"
                  >
                    Publish Campaign
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="border border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Back: {activeStep > 0 ? steps[activeStep - 1] : ""}
              </button>
              {activeStep < steps.length - 1 && (
                <button
                  onClick={handleNext}
                  className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Continue: {steps[activeStep + 1]}
                </button>
              )}
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
                <div className="h-1 bg-[#6C5CE7]" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-xs font-bold">
                        YB
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#E2E8F0]">Your Brand</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00B89420] text-[#00B894] font-semibold">
                          Verified
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-1 rounded-full bg-[#00B89420] text-[#00B894]">
                      $TBD
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#E2E8F0] mb-1">{formData.title || "Your Campaign Title"}</p>
                  <p className="text-[11px] text-[#8892A8] mb-3 leading-relaxed">
                    {formData.description || "Campaign description will appear here once you complete the Brief step."}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {formData.channels.length > 0 ? (
                      formData.channels.slice(0, 4).map((ch) => (
                        <ChannelChip key={ch} channel={ch in channelColors ? ch : "TikTok"} />
                      ))
                    ) : (
                      <span className="text-[11px] text-[#8892A8]">No channels selected yet</span>
                    )}
                    {formData.channels.length > 4 && (
                      <span className="text-[11px] text-[#8892A8]">+{formData.channels.length - 4} more</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#2A3050]">
                    <span className="text-[11px] text-[#8892A8]">
                      {formData.channels.length} channel{formData.channels.length !== 1 ? "s" : ""} selected
                    </span>
                    <button className="bg-[#6C5CE7] text-white text-[10px] font-bold px-3 py-1 rounded-lg">
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-[#131825] border border-[#2A3050] rounded-xl p-4">
                <p className="text-xs font-bold text-[#E2E8F0] mb-2">Tips</p>
                <ul className="space-y-2 text-[11px] text-[#8892A8]">
                  <li className="flex gap-2">
                    <span className="text-[#6C5CE7] mt-0.5 shrink-0">-</span>
                    Multi-channel campaigns see 3.2x more applications
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#6C5CE7] mt-0.5 shrink-0">-</span>
                    Discord + TikTok is the fastest-growing combo
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#6C5CE7] mt-0.5 shrink-0">-</span>
                    Adding a clipping component increases ROI by 40%
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
