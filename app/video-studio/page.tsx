"use client"

import { useState } from "react"
import { Upload, Play, Monitor, Grid3X3, Eye, Download, Send, Clock, TrendingUp, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"

const positionLabels = [
  "Top-Left", "Top-Center", "Top-Right",
  "Middle-Left", "Center", "Middle-Right",
  "Bottom-Left", "Bottom-Center", "Bottom-Right",
]

const mockSubmissions = [
  { date: "Apr 3", platform: "TikTok", views: "142K", earnings: "$21.30" },
  { date: "Mar 28", platform: "Instagram Reels", views: "89K", earnings: "$13.35" },
  { date: "Mar 20", platform: "YouTube Shorts", views: "214K", earnings: "$32.10" },
]

export default function VideoStudioPage() {
  const [videoUploaded, setVideoUploaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedPlatform, setSelectedPlatform] = useState("TikTok")
  const [caption, setCaption] = useState("")

  const handleUpload = () => {
    setVideoUploaded(true)
    toast.success("Video uploaded successfully!")
  }

  const handleProcess = () => {
    setProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setProcessing(false)
          toast.success("Video processed! Ready to publish.")
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#E2E8F0]">Video Studio</h1>
          <p className="text-sm text-[#8892A8]">Clipping engine - overlay brand assets onto your videos</p>
        </div>

        <div className="flex gap-5">
          {/* Left: Video Area (60%) */}
          <div className="flex-1 min-w-0">
            {!videoUploaded ? (
              <button
                onClick={handleUpload}
                className="w-full bg-[#131825] border-2 border-dashed border-[#2A3050] rounded-2xl p-12 text-center hover:border-[#6C5CE7]/60 transition-colors group cursor-pointer"
              >
                <Upload size={48} className="mx-auto mb-4 text-[#8892A8] group-hover:text-[#6C5CE7] transition-colors" />
                <p className="text-base font-semibold text-[#E2E8F0] mb-1">Drag your video here or click to browse</p>
                <p className="text-sm text-[#8892A8] mb-4">Upload your short-form video to apply the brand overlay</p>
                <div className="flex items-center justify-center gap-3 text-xs text-[#8892A8]">
                  <span className="px-2 py-1 bg-[#0B0F1A] rounded-lg border border-[#2A3050]">MP4</span>
                  <span className="px-2 py-1 bg-[#0B0F1A] rounded-lg border border-[#2A3050]">MOV</span>
                  <span className="px-2 py-1 bg-[#0B0F1A] rounded-lg border border-[#2A3050]">WebM</span>
                  <span className="text-[#8892A8]">Max 500MB</span>
                </div>
              </button>
            ) : (
              <div>
                {/* Video preview */}
                <div className="bg-[#131825] border border-[#2A3050] rounded-2xl overflow-hidden mb-4">
                  <div className="relative aspect-video bg-[#0A0E18] flex items-center justify-center">
                    {/* Simulated video area */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1A2035] to-[#0B0F1A]" />

                    {/* Play button */}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-[#6C5CE7]/30 flex items-center justify-center border-2 border-[#6C5CE7]/50">
                      <Play size={24} className="text-[#6C5CE7] ml-1" fill="#6C5CE7" />
                    </div>

                    {/* Overlay watermark */}
                    {showOverlay && (
                      <div className="absolute bottom-4 right-4 z-20">
                        <div className="bg-[#6C5CE7] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-85 shadow-lg">
                          BRAND
                        </div>
                      </div>
                    )}

                    {/* Video duration bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2A3050]">
                      <div className="h-full bg-[#6C5CE7] w-1/3 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Toggle tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowOverlay(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={
                      !showOverlay
                        ? { backgroundColor: "#6C5CE7", color: "#fff" }
                        : { backgroundColor: "#131825", color: "#8892A8", border: "1px solid #2A3050" }
                    }
                  >
                    <Monitor size={14} />
                    Original
                  </button>
                  <button
                    onClick={() => setShowOverlay(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={
                      showOverlay
                        ? { backgroundColor: "#6C5CE7", color: "#fff" }
                        : { backgroundColor: "#131825", color: "#8892A8", border: "1px solid #2A3050" }
                    }
                  >
                    <Eye size={14} />
                    With Overlay
                  </button>
                  <button
                    onClick={handleUpload}
                    className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold border border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0] transition-colors"
                  >
                    Re-upload Video
                  </button>
                </div>

                {/* Progress bar */}
                {processing && (
                  <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#E2E8F0]">Processing video...</span>
                      <span className="text-xs font-mono text-[#6C5CE7]">{progress}%</span>
                    </div>
                    <div className="h-2 bg-[#0B0F1A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6C5CE7] rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#8892A8] mt-2 flex items-center gap-1">
                      <Clock size={10} />
                      Estimated time: ~45 seconds
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Configuration Panel (40%) */}
          <div className="w-[380px] shrink-0 space-y-4">
            {/* Campaign Info */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Campaign Info</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-sm font-bold">
                  N
                </div>
                <div>
                  <p className="text-sm font-bold text-[#E2E8F0]">NordVPN Summer Campaign</p>
                  <p className="text-xs text-[#8892A8]">Clipping campaign</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <DollarSign size={12} className="text-[#00B894]" />
                <span className="text-[#8892A8]">Rate:</span>
                <span className="font-bold font-mono text-[#00B894]">$0.15 per 100K views</span>
              </div>
              <p className="text-xs text-[#8892A8] mt-2 leading-relaxed">
                Looking for gaming & tech creators to feature our branded overlay on short-form content across TikTok, Reels, and Shorts.
              </p>
            </div>

            {/* Overlay Settings (read-only) */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Overlay Settings</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-[#8892A8] block mb-1.5">Position</span>
                  <div className="flex items-center gap-3">
                    <div className="grid grid-cols-3 gap-1 w-16">
                      {positionLabels.map((pos, i) => (
                        <div
                          key={pos}
                          className="w-4 h-4 rounded-sm border transition-all"
                          style={
                            i === 8 // Bottom-Right
                              ? { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7" }
                              : { backgroundColor: "#0B0F1A", borderColor: "#2A3050" }
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#E2E8F0]">Bottom-Right</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8892A8]">Size</span>
                  <span className="font-semibold text-[#E2E8F0]">15% of video width</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8892A8]">Opacity</span>
                  <span className="font-semibold text-[#E2E8F0]">85%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8892A8]">Timing</span>
                  <span className="font-semibold text-[#E2E8F0]">Full video</span>
                </div>
              </div>
            </div>

            {/* Asset Preview */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Overlay Asset</h3>
              <div className="bg-[#0B0F1A] border border-[#2A3050] rounded-lg p-4 flex items-center justify-center">
                <div className="bg-[#6C5CE7] text-white text-xs font-bold px-4 py-2 rounded-lg">
                  BRAND
                </div>
              </div>
              <p className="text-[10px] text-[#8892A8] mt-2">brand-logo.png - 128x48px</p>
            </div>

            {/* Publish Section */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Publish</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#8892A8] block mb-1.5">Platform</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-xs text-[#E2E8F0] outline-none focus:border-[#6C5CE7]"
                  >
                    <option>TikTok</option>
                    <option>Instagram Reels</option>
                    <option>YouTube Shorts</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#8892A8] block mb-1.5">Caption</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption for your post..."
                    className="w-full bg-[#0B0F1A] border border-[#2A3050] rounded-lg px-3 py-2 text-xs text-[#E2E8F0] placeholder-[#8892A8] outline-none focus:border-[#6C5CE7]"
                  />
                </div>
                <button
                  onClick={videoUploaded ? handleProcess : () => toast.info("Upload a video first")}
                  className="w-full bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Process & Publish
                </button>
                <button
                  onClick={() => videoUploaded ? toast.success("MP4 downloaded!") : toast.info("Upload a video first")}
                  className="w-full border border-[#2A3050] hover:bg-[#1A2035] text-[#E2E8F0] text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Download MP4
                </button>
              </div>
            </div>

            {/* Submission History */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide mb-3">Submission History</h3>
              <div className="space-y-3">
                {mockSubmissions.map((sub) => (
                  <div key={sub.date} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#E2E8F0]">{sub.platform}</p>
                      <p className="text-[10px] text-[#8892A8]">{sub.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[#8892A8] flex items-center gap-1">
                        <TrendingUp size={10} />
                        {sub.views}
                      </p>
                      <p className="font-mono font-bold text-[#00B894]">{sub.earnings}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
