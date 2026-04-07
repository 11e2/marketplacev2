"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  Upload,
  X,
  Play,
  Loader2,
  Download,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL, fetchFile } from "@ffmpeg/util"

const POSITION_GRID = [
  ["top-left", "top-center", "top-right"],
  ["middle-left", "center", "middle-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
] as const

type Position = (typeof POSITION_GRID)[number][number]

const POSITION_LABELS: Record<Position, string> = {
  "top-left": "Top Left",
  "top-center": "Top Center",
  "top-right": "Top Right",
  "middle-left": "Middle Left",
  "center": "Center",
  "middle-right": "Middle Right",
  "bottom-left": "Bottom Left",
  "bottom-center": "Bottom Center",
  "bottom-right": "Bottom Right",
}

// Position to FFmpeg overlay expression
function getOverlayPosition(position: Position, padding = 20): string {
  const map: Record<Position, string> = {
    "top-left": `${padding}:${padding}`,
    "top-center": `(W-w)/2:${padding}`,
    "top-right": `W-w-${padding}:${padding}`,
    "middle-left": `${padding}:(H-h)/2`,
    "center": `(W-w)/2:(H-h)/2`,
    "middle-right": `W-w-${padding}:(H-h)/2`,
    "bottom-left": `${padding}:H-h-${padding}`,
    "bottom-center": `(W-w)/2:H-h-${padding}`,
    "bottom-right": `W-w-${padding}:H-h-${padding}`,
  }
  return map[position]
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB for client-side processing
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]

type ProcessingState = "idle" | "loading-ffmpeg" | "processing" | "success" | "error"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoStudioPage() {
  // FFmpeg instance
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Overlay state
  const [overlayFile, setOverlayFile] = useState<File | null>(null)
  const [overlayPreviewUrl, setOverlayPreviewUrl] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const overlayInputRef = useRef<HTMLInputElement>(null)

  // Settings
  const [position, setPosition] = useState<Position>("bottom-right")
  const [size, setSize] = useState(15)
  const [opacity, setOpacity] = useState(85)

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [processingProgress, setProcessingProgress] = useState("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  // Load FFmpeg on mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (ffmpegRef.current) return

      const ffmpeg = new FFmpeg()
      ffmpegRef.current = ffmpeg

      ffmpeg.on("progress", ({ progress }) => {
        setProcessingProgress(`Processing: ${Math.round(progress * 100)}%`)
      })

      try {
        setProcessingState("loading-ffmpeg")
        
        // Load FFmpeg core from CDN with CORS-enabled URLs
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        })

        setFfmpegLoaded(true)
        setProcessingState("idle")
      } catch (err) {
        console.error("Failed to load FFmpeg:", err)
        setErrorMessage("Failed to load video processing engine. Please refresh the page.")
        setProcessingState("error")
      }
    }

    loadFFmpeg()
  }, [])

  // Handle video selection
  const handleVideoSelect = useCallback((file: File) => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setErrorMessage("Please select a valid video file (MP4, MOV, or WebM)")
      setProcessingState("error")
      return
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setErrorMessage("Video file must be under 100MB for browser processing")
      setProcessingState("error")
      return
    }

    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)

    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
    setProcessingState("idle")
    setResultUrl(null)
  }, [videoPreviewUrl])

  // Handle overlay selection
  const handleOverlaySelect = useCallback((file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage("Please select a valid image file (PNG, JPG, GIF, or WebP)")
      setProcessingState("error")
      return
    }

    if (overlayPreviewUrl && !isDemo) URL.revokeObjectURL(overlayPreviewUrl)

    setOverlayFile(file)
    setOverlayPreviewUrl(URL.createObjectURL(file))
    setIsDemo(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isDemo])

  // Use demo asset
  const handleUseDemo = useCallback(async () => {
    const canvas = document.createElement("canvas")
    canvas.width = 200
    canvas.height = 60
    const ctx = canvas.getContext("2d")!
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.beginPath()
    ctx.roundRect(0, 0, 200, 60, 8)
    ctx.fill()
    
    ctx.fillStyle = "#6C5CE7"
    ctx.font = "bold 20px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("BRAND DEMO", 100, 30)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "demo-overlay.png", { type: "image/png" })
        if (overlayPreviewUrl && !isDemo) URL.revokeObjectURL(overlayPreviewUrl)
        setOverlayFile(file)
        setOverlayPreviewUrl(URL.createObjectURL(file))
        setIsDemo(true)
        setProcessingState("idle")
        setResultUrl(null)
      }
    }, "image/png")
  }, [overlayPreviewUrl, isDemo])

  // Clear video
  const handleClearVideo = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setProcessingState("idle")
    setResultUrl(null)
  }, [videoPreviewUrl])

  // Clear overlay
  const handleClearOverlay = useCallback(() => {
    if (overlayPreviewUrl && !isDemo) URL.revokeObjectURL(overlayPreviewUrl)
    setOverlayFile(null)
    setOverlayPreviewUrl(null)
    setIsDemo(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isDemo])

  // Process video using client-side FFmpeg
  const handleProcess = useCallback(async () => {
    if (!videoFile || !overlayFile || !ffmpegRef.current || !ffmpegLoaded) return

    const ffmpeg = ffmpegRef.current
    setProcessingState("processing")
    setProcessingProgress("Preparing files...")
    setErrorMessage("")

    try {
      // Write input files to FFmpeg virtual filesystem
      const videoData = await fetchFile(videoFile)
      const overlayData = await fetchFile(overlayFile)
      
      await ffmpeg.writeFile("input.mp4", videoData)
      await ffmpeg.writeFile("overlay.png", overlayData)

      setProcessingProgress("Processing video...")

      // Build FFmpeg command
      // Scale overlay relative to video width, apply opacity, position it
      const overlayPos = getOverlayPosition(position)
      const scaleExpr = `iw*${size / 100}:-1`
      
      // FFmpeg filter: scale overlay, apply opacity, overlay on video
      const filterComplex = opacity < 100
        ? `[1:v]scale=${scaleExpr},format=rgba,colorchannelmixer=aa=${opacity / 100}[ov];[0:v][ov]overlay=${overlayPos}`
        : `[1:v]scale=${scaleExpr}[ov];[0:v][ov]overlay=${overlayPos}`

      await ffmpeg.exec([
        "-i", "input.mp4",
        "-i", "overlay.png",
        "-filter_complex", filterComplex,
        "-c:a", "copy",
        "-preset", "ultrafast",
        "output.mp4"
      ])

      setProcessingProgress("Finalizing...")

      // Read output file
      const outputData = await ffmpeg.readFile("output.mp4")
      const outputBlob = new Blob([outputData], { type: "video/mp4" })
      const url = URL.createObjectURL(outputBlob)

      // Cleanup FFmpeg filesystem
      await ffmpeg.deleteFile("input.mp4")
      await ffmpeg.deleteFile("overlay.png")
      await ffmpeg.deleteFile("output.mp4")

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(url)
      setProcessingState("success")
    } catch (err) {
      console.error("FFmpeg processing error:", err)
      setErrorMessage(err instanceof Error ? err.message : "Video processing failed")
      setProcessingState("error")
    }
  }, [videoFile, overlayFile, ffmpegLoaded, position, size, opacity, resultUrl])

  // Reset for re-processing
  const handleProcessAgain = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setResultUrl(null)
    setProcessingState("idle")
  }, [resultUrl])

  // Download result
  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = `composited-${Date.now()}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [resultUrl])

  const canProcess = videoFile && overlayFile && ffmpegLoaded && processingState !== "processing" && processingState !== "loading-ffmpeg"

  return (
    <div className="flex min-h-screen bg-background dark">
      <SidebarNav mode="creator" />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Video Studio</h1>
          <p className="text-muted-foreground mt-1">
            Overlay brand assets onto your video content
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Upload and Configure (60%) */}
          <div className="lg:w-[60%] space-y-6">
            {/* Video Upload */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Video Upload</h2>
              {!videoFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleVideoSelect(file)
                  }}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[rgba(108,92,231,0.05)] transition-colors"
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-foreground font-medium">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, or WebM up to 100MB
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4 bg-secondary rounded-lg">
                  {videoPreviewUrl && (
                    <video
                      src={videoPreviewUrl}
                      className="w-24 h-16 object-cover rounded"
                      muted
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(videoFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearVideo}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleVideoSelect(file)
                }}
              />
            </div>

            {/* Brand Asset Upload */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Brand Asset</h2>
              {!overlayFile ? (
                <div className="space-y-3">
                  <div
                    onClick={() => overlayInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleOverlaySelect(file)
                    }}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[rgba(108,92,231,0.05)] transition-colors"
                  >
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      Drop your brand asset here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF, or WebP
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleUseDemo}
                  >
                    Use Demo Asset
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                  {overlayPreviewUrl && (
                    <img
                      src={overlayPreviewUrl}
                      alt="Overlay preview"
                      className="h-12 object-contain rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {isDemo ? "Demo Overlay" : overlayFile.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearOverlay}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={overlayInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleOverlaySelect(file)
                }}
              />
            </div>

            {/* Overlay Settings */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <h2 className="text-sm font-semibold text-foreground">Overlay Settings</h2>

              {/* Position Grid */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Position
                </label>
                <div className="mt-2 grid grid-cols-3 gap-1.5 w-36">
                  {POSITION_GRID.flat().map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={cn(
                        "w-10 h-10 rounded border-2 transition-colors",
                        position === pos
                          ? "bg-[#6C5CE7] border-[#6C5CE7]"
                          : "bg-secondary border-border hover:border-[#6C5CE7]/50"
                      )}
                      aria-label={POSITION_LABELS[pos]}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {POSITION_LABELS[position]}
                </p>
              </div>

              {/* Size Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Size
                  </label>
                  <span className="text-xs font-mono text-foreground">{size}%</span>
                </div>
                <Slider
                  value={[size]}
                  onValueChange={([v]) => setSize(v)}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of video width
                </p>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Opacity
                  </label>
                  <span className="text-xs font-mono text-foreground">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={([v]) => setOpacity(v)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcess}
              disabled={!canProcess}
              className="w-full h-12 bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white font-semibold"
            >
              {processingState === "loading-ffmpeg" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading video engine...
                </>
              ) : processingState === "processing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingProgress || "Processing..."}
                </>
              ) : (
                "Process Video"
              )}
            </Button>
          </div>

          {/* Right Panel: Preview and Download (40%) */}
          <div className="lg:w-[40%]">
            <div className="bg-card rounded-xl border border-border p-5 min-h-[400px] flex flex-col">
              <h2 className="text-sm font-semibold text-foreground mb-4">Preview</h2>

              {(processingState === "idle" || processingState === "loading-ffmpeg") && !resultUrl && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Your composited video will appear here
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                    Upload a video and brand asset, then click Process Video
                  </p>
                  {processingState === "loading-ffmpeg" && (
                    <p className="text-xs text-[#6C5CE7] mt-3 flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading video engine...
                    </p>
                  )}
                </div>
              )}

              {processingState === "processing" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="h-10 w-10 text-[#6C5CE7] animate-spin mb-4" />
                  <p className="text-sm text-foreground font-medium">
                    {processingProgress || "Processing your video..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This may take a minute depending on video length
                  </p>
                </div>
              )}

              {processingState === "success" && resultUrl && (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      src={resultUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-[#00B894] hover:bg-[#00A884] text-white font-semibold"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Publish to Platform
                      <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded">
                        Coming Soon
                      </span>
                    </Button>
                    <button
                      onClick={handleProcessAgain}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <RefreshCw className="inline-block mr-1.5 h-3.5 w-3.5" />
                      Process Again
                    </button>
                  </div>
                </div>
              )}

              {processingState === "error" && (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <div className="bg-[rgba(255,107,107,0.1)] border border-[#FF6B6B]/30 rounded-lg p-4 text-center w-full">
                    <AlertCircle className="h-8 w-8 text-[#FF6B6B] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Processing Failed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {errorMessage}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setProcessingState("idle")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
