"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, Film, ImageIcon, Sparkles, Loader2, Play, Download, X, AlertCircle, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { SidebarNav } from "@/components/sidebar-nav"

type Status = "idle" | "uploading" | "processing" | "success" | "error"

const POSITION_LABELS = [
  "top-left", "top-center", "top-right",
  "middle-left", "center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
]

const POSITION_DISPLAY: Record<string, string> = {
  "top-left": "Top-Left",
  "top-center": "Top-Center",
  "top-right": "Top-Right",
  "middle-left": "Middle-Left",
  "center": "Center",
  "middle-right": "Middle-Right",
  "bottom-left": "Bottom-Left",
  "bottom-center": "Bottom-Center",
  "bottom-right": "Bottom-Right",
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoStudioPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [overlayFile, setOverlayFile] = useState<File | null>(null)
  const [position, setPosition] = useState("bottom-right")
  const [size, setSize] = useState(15)
  const [opacity, setOpacity] = useState(85)
  const [status, setStatus] = useState<Status>("idle")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const videoInputRef = useRef<HTMLInputElement>(null)
  const overlayInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewUrl = videoFile ? URL.createObjectURL(videoFile) : null
  const overlayPreviewUrl = overlayFile ? URL.createObjectURL(overlayFile) : null

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetVideo(file)
  }, [])

  const handleOverlayDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetOverlay(file)
  }, [])

  function validateAndSetVideo(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const validExts = ["mp4", "mov", "webm"]
    if (!file.type.startsWith("video/") && !validExts.includes(ext || "")) {
      toast.error("Invalid file type. Please upload MP4, MOV, or WebM.")
      return
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 500MB.")
      return
    }
    setVideoFile(file)
    toast.success(`Video selected: ${file.name}`)
  }

  function validateAndSetOverlay(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const validExts = ["png", "jpg", "jpeg", "gif", "webp"]
    if (!file.type.startsWith("image/") && !validExts.includes(ext || "")) {
      toast.error("Invalid file type. Please upload PNG, JPG, GIF, or WebP.")
      return
    }
    setOverlayFile(file)
    toast.success(`Overlay selected: ${file.name}`)
  }

  async function loadDemoAsset() {
    try {
      const response = await fetch("/demo-overlay.png")
      const blob = await response.blob()
      const file = new File([blob], "demo-overlay.png", { type: "image/png" })
      setOverlayFile(file)
      toast.success("Demo overlay loaded!")
    } catch {
      toast.error("Failed to load demo asset")
    }
  }

  async function handleProcess() {
    if (!videoFile || !overlayFile) return

    setStatus("uploading")
    setErrorMessage("")

    const formData = new FormData()
    formData.append("video", videoFile)
    formData.append("overlay", overlayFile)
    formData.append("position", position)
    formData.append("size", String(size))
    formData.append("opacity", String(opacity))

    try {
      setStatus("processing")

      const response = await fetch("/api/composite", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        // Clone response before reading to avoid "body stream already read" error
        const text = await response.text()
        let errorText = "Processing failed"
        try {
          const json = JSON.parse(text)
          errorText = json.error || errorText
        } catch {
          errorText = text || errorText
        }
        throw new Error(errorText)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Clean up previous result URL
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl)
      }

      setResultUrl(url)
      setResultBlob(blob)
      setStatus("success")
      toast.success("Video processed successfully!")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      setStatus("error")
      toast.error("Processing failed")
    }
  }

  function handleDownload() {
    if (!resultUrl || !resultBlob) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "composited.mp4"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Download started!")
  }

  function handleProcessAgain() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl)
    }
    setResultUrl(null)
    setResultBlob(null)
    setStatus("idle")
    setErrorMessage("")
  }

  const canProcess = videoFile !== null && overlayFile !== null && status !== "uploading" && status !== "processing"

  return (
    <div className="dark min-h-screen bg-[#0B0F1A] text-[#E2E8F0] flex">
      <SidebarNav mode="creator" />

      <main className="flex-1 min-w-0 px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#E2E8F0]">Video Studio</h1>
          <p className="text-sm text-[#8892A8]">Composite brand overlays onto your videos with FFmpeg</p>
        </div>

        <div className="flex gap-6">
          {/* LEFT PANEL: Upload & Configure (60%) */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Section 1: Video Upload */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#E2E8F0] mb-3 flex items-center gap-2">
                <Film size={16} className="text-[#6C5CE7]" />
                Your Video
              </h3>

              {!videoFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleVideoDrop}
                  className="border-2 border-dashed border-[#2A3050] rounded-xl p-8 text-center hover:border-[#6C5CE7]/60 transition-colors cursor-pointer group"
                >
                  <Upload size={36} className="mx-auto mb-3 text-[#8892A8] group-hover:text-[#6C5CE7] transition-colors" />
                  <p className="text-sm font-semibold text-[#E2E8F0] mb-1">Drag your video here or click to browse</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#8892A8] mt-2">
                    <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">MP4</span>
                    <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">MOV</span>
                    <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">WebM</span>
                    <span>up to 500MB</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-32 h-20 bg-[#0B0F1A] rounded-lg overflow-hidden shrink-0 relative">
                    <video
                      src={videoPreviewUrl || undefined}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        const vid = e.currentTarget
                        vid.currentTime = 1
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={16} className="text-white/80" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#E2E8F0] truncate">{videoFile.name}</p>
                    <p className="text-xs text-[#8892A8] mt-0.5">{formatFileSize(videoFile.size)}</p>
                  </div>
                  <button
                    onClick={() => setVideoFile(null)}
                    className="text-[#8892A8] hover:text-[#FF6B6B] transition-colors p-1"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) validateAndSetVideo(file)
                  e.target.value = ""
                }}
              />
            </div>

            {/* Section 2: Brand Asset Upload */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#E2E8F0] mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-[#FF6B35]" />
                Brand Asset (Overlay)
              </h3>

              {!overlayFile ? (
                <div>
                  <div
                    onClick={() => overlayInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleOverlayDrop}
                    className="border-2 border-dashed border-[#2A3050] rounded-xl p-6 text-center hover:border-[#6C5CE7]/60 transition-colors cursor-pointer group"
                  >
                    <Upload size={28} className="mx-auto mb-2 text-[#8892A8] group-hover:text-[#FF6B35] transition-colors" />
                    <p className="text-sm font-semibold text-[#E2E8F0] mb-1">Upload brand asset</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-[#8892A8] mt-1">
                      <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">PNG</span>
                      <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">JPG</span>
                      <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">GIF</span>
                      <span className="px-2 py-0.5 bg-[#0B0F1A] rounded border border-[#2A3050]">WebP</span>
                    </div>
                  </div>
                  <button
                    onClick={loadDemoAsset}
                    className="mt-3 w-full text-xs font-semibold text-[#6C5CE7] hover:text-[#5a4dd4] border border-[#6C5CE7]/30 hover:border-[#6C5CE7]/60 rounded-lg py-2 transition-colors"
                  >
                    No brand asset? Use Demo Asset
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-20 h-14 bg-[#0B0F1A] rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 border border-[#2A3050]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={overlayPreviewUrl || undefined}
                      alt="Overlay preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#E2E8F0] truncate">{overlayFile.name}</p>
                    <p className="text-xs text-[#8892A8] mt-0.5">{formatFileSize(overlayFile.size)}</p>
                  </div>
                  <button
                    onClick={() => setOverlayFile(null)}
                    className="text-[#8892A8] hover:text-[#FF6B6B] transition-colors p-1"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                ref={overlayInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) validateAndSetOverlay(file)
                  e.target.value = ""
                }}
              />
            </div>

            {/* Section 3: Overlay Configuration */}
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#E2E8F0] mb-4">Overlay Settings</h3>

              {/* Position Grid */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide block mb-2">
                  Position
                </label>
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-3 gap-1.5">
                    {POSITION_LABELS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className="w-8 h-8 rounded-md border transition-all"
                        style={
                          position === pos
                            ? { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7" }
                            : { backgroundColor: "#1A2035", borderColor: "#2A3050" }
                        }
                        title={POSITION_DISPLAY[pos]}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#E2E8F0]">{POSITION_DISPLAY[position]}</span>
                </div>
              </div>

              {/* Size Slider */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide">
                    Size
                  </label>
                  <span className="text-xs font-mono font-bold text-[#6C5CE7]">{size}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6C5CE7 0%, #6C5CE7 ${((size - 5) / 45) * 100}%, #2A3050 ${((size - 5) / 45) * 100}%, #2A3050 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[#8892A8] mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#8892A8] uppercase tracking-wide">
                    Opacity
                  </label>
                  <span className="text-xs font-mono font-bold text-[#6C5CE7]">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6C5CE7 0%, #6C5CE7 ${opacity}%, #2A3050 ${opacity}%, #2A3050 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[#8892A8] mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={!canProcess}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              style={
                canProcess
                  ? { backgroundColor: "#6C5CE7", color: "#fff" }
                  : { backgroundColor: "#1A2035", color: "#8892A8", cursor: "not-allowed" }
              }
            >
              {status === "uploading" || status === "processing" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Process Video
                </>
              )}
            </button>
          </div>

          {/* RIGHT PANEL: Preview & Download (40%) */}
          <div className="w-[420px] shrink-0">
            <div className="bg-[#131825] border border-[#2A3050] rounded-xl min-h-[500px] flex flex-col">
              {/* Idle state */}
              {status === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#2A3050] flex items-center justify-center mb-4">
                    <Play size={32} className="text-[#8892A8]/50" />
                  </div>
                  <p className="text-sm font-semibold text-[#8892A8] mb-2">
                    Your composited video will appear here
                  </p>
                  <p className="text-xs text-[#8892A8]/70 max-w-xs leading-relaxed">
                    Upload a video and brand asset, configure the overlay settings, then click Process Video.
                  </p>
                </div>
              )}

              {/* Processing state */}
              {(status === "uploading" || status === "processing") && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <Loader2 size={48} className="text-[#6C5CE7] animate-spin mb-4" />
                  <p className="text-sm font-semibold text-[#E2E8F0] mb-2">
                    {status === "uploading" ? "Uploading files..." : "Processing your video..."}
                  </p>
                  <p className="text-xs text-[#8892A8]">
                    This usually takes 30-60 seconds depending on video length
                  </p>
                </div>
              )}

              {/* Success state */}
              {status === "success" && resultUrl && (
                <div className="flex flex-col">
                  {/* Video player */}
                  <div className="relative bg-black rounded-t-xl overflow-hidden">
                    <video
                      src={resultUrl}
                      controls
                      className="w-full max-h-[320px]"
                      autoPlay={false}
                      playsInline
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="p-5 space-y-3">
                    <button
                      onClick={handleDownload}
                      className="w-full bg-[#00B894] hover:bg-[#009b7e] text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download MP4
                      {resultBlob && (
                        <span className="text-xs opacity-75">({formatFileSize(resultBlob.size)})</span>
                      )}
                    </button>

                    {/* Publish button (disabled) */}
                    <div className="relative">
                      <button
                        disabled
                        className="w-full bg-[#6C5CE7]/20 text-[#6C5CE7]/40 text-sm font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Publish to Platform
                      </button>
                      <p className="text-[10px] text-[#8892A8] text-center mt-1.5">Coming Soon</p>
                    </div>

                    {/* Process Again */}
                    <button
                      onClick={handleProcessAgain}
                      className="w-full text-xs font-semibold text-[#8892A8] hover:text-[#E2E8F0] py-2 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      Process Again
                    </button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {status === "error" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center mb-4">
                    <AlertCircle size={32} className="text-[#FF6B6B]" />
                  </div>
                  <p className="text-sm font-semibold text-[#FF6B6B] mb-2">Processing Failed</p>
                  <p className="text-xs text-[#8892A8] mb-4 max-w-xs leading-relaxed break-words">
                    {errorMessage}
                  </p>
                  <button
                    onClick={handleProcessAgain}
                    className="bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
