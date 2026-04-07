"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  Upload,
  X,
  Loader2,
  Download,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react"

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

// Calculate overlay position on canvas
function getOverlayCoords(
  position: Position,
  videoWidth: number,
  videoHeight: number,
  overlayWidth: number,
  overlayHeight: number,
  padding = 20
): { x: number; y: number } {
  const positions: Record<Position, { x: number; y: number }> = {
    "top-left": { x: padding, y: padding },
    "top-center": { x: (videoWidth - overlayWidth) / 2, y: padding },
    "top-right": { x: videoWidth - overlayWidth - padding, y: padding },
    "middle-left": { x: padding, y: (videoHeight - overlayHeight) / 2 },
    "center": { x: (videoWidth - overlayWidth) / 2, y: (videoHeight - overlayHeight) / 2 },
    "middle-right": { x: videoWidth - overlayWidth - padding, y: (videoHeight - overlayHeight) / 2 },
    "bottom-left": { x: padding, y: videoHeight - overlayHeight - padding },
    "bottom-center": { x: (videoWidth - overlayWidth) / 2, y: videoHeight - overlayHeight - padding },
    "bottom-right": { x: videoWidth - overlayWidth - padding, y: videoHeight - overlayHeight - padding },
  }
  return positions[position]
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]

type ProcessingState = "idle" | "processing" | "success" | "error"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoStudioPage() {
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)

  // Overlay state
  const [overlayFile, setOverlayFile] = useState<File | null>(null)
  const [overlayPreviewUrl, setOverlayPreviewUrl] = useState<string | null>(null)
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const overlayInputRef = useRef<HTMLInputElement>(null)

  // Settings
  const [position, setPosition] = useState<Position>("bottom-right")
  const [size, setSize] = useState(15)
  const [opacity, setOpacity] = useState(85)

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  // Canvas ref for processing
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load overlay image when file changes
  useEffect(() => {
    if (!overlayPreviewUrl) {
      setOverlayImage(null)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setOverlayImage(img)
    img.onerror = () => {
      setErrorMessage("Failed to load overlay image")
      setProcessingState("error")
    }
    img.src = overlayPreviewUrl
  }, [overlayPreviewUrl])

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
  const handleUseDemo = useCallback(() => {
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
    setOverlayImage(null)
    setIsDemo(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isDemo])

  // Process video using Canvas + MediaRecorder
  const handleProcess = useCallback(async () => {
    if (!videoFile || !overlayImage || !hiddenVideoRef.current || !canvasRef.current) return

    const video = hiddenVideoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setProcessingState("processing")
    setProcessingProgress(0)
    setErrorMessage("")

    try {
      // Load video metadata
      video.src = videoPreviewUrl!
      video.muted = true
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error("Failed to load video"))
        video.load()
      })

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Calculate overlay dimensions
      const overlayWidth = (video.videoWidth * size) / 100
      const overlayHeight = (overlayImage.height / overlayImage.width) * overlayWidth
      const overlayPos = getOverlayCoords(position, video.videoWidth, video.videoHeight, overlayWidth, overlayHeight)

      // Set up MediaRecorder with canvas stream
      const stream = canvas.captureStream(30) // 30 FPS
      
      // Add audio track from video if it exists
      const videoWithAudio = document.createElement("video")
      videoWithAudio.src = videoPreviewUrl!
      videoWithAudio.muted = false
      await new Promise<void>((resolve) => {
        videoWithAudio.onloadedmetadata = () => resolve()
        videoWithAudio.load()
      })
      
      // Try to capture audio
      let hasAudio = false
      try {
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaElementSource(videoWithAudio)
        const dest = audioCtx.createMediaStreamDestination()
        source.connect(dest)
        source.connect(audioCtx.destination)
        
        const audioTrack = dest.stream.getAudioTracks()[0]
        if (audioTrack) {
          stream.addTrack(audioTrack)
          hasAudio = true
        }
      } catch {
        // No audio or audio capture not supported
      }

      // Choose best supported format
      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ]
      let mimeType = ""
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }
      if (!mimeType) {
        throw new Error("No supported video format found")
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      const recordingComplete = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType })
          resolve(blob)
        }
        mediaRecorder.onerror = (e) => reject(e)
      })

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms

      // Play and render video frames
      video.currentTime = 0
      
      const renderFrame = () => {
        if (video.paused || video.ended) return

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw overlay with opacity
        ctx.globalAlpha = opacity / 100
        ctx.drawImage(overlayImage, overlayPos.x, overlayPos.y, overlayWidth, overlayHeight)
        ctx.globalAlpha = 1

        // Update progress
        const progress = (video.currentTime / video.duration) * 100
        setProcessingProgress(Math.round(progress))

        requestAnimationFrame(renderFrame)
      }

      // Start playback and rendering
      video.onended = () => {
        mediaRecorder.stop()
      }

      await video.play()
      renderFrame()

      // Wait for recording to complete
      const outputBlob = await recordingComplete

      // Clean up
      if (hasAudio) {
        videoWithAudio.pause()
        videoWithAudio.src = ""
      }

      // Create download URL
      const url = URL.createObjectURL(outputBlob)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(url)
      setProcessingState("success")
      setProcessingProgress(100)

    } catch (err) {
      console.error("Video processing error:", err)
      setErrorMessage(err instanceof Error ? err.message : "Video processing failed")
      setProcessingState("error")
    }
  }, [videoFile, videoPreviewUrl, overlayImage, position, size, opacity, resultUrl])

  // Reset for re-processing
  const handleProcessAgain = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setResultUrl(null)
    setProcessingState("idle")
    setProcessingProgress(0)
  }, [resultUrl])

  // Download result
  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = `branded-video-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [resultUrl])

  const canProcess = videoFile && overlayImage && processingState !== "processing"

  return (
    <div className="flex min-h-screen bg-background dark">
      <SidebarNav mode="creator" />

      {/* Hidden elements for processing */}
      <video ref={hiddenVideoRef} className="hidden" playsInline crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="hidden" />

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
              {processingState === "processing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing... {processingProgress}%
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

              {processingState === "idle" && !resultUrl && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a video and brand asset, then click Process to see your result
                  </p>
                </div>
              )}

              {processingState === "processing" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="h-12 w-12 text-[#6C5CE7] animate-spin mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    Processing your video...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {processingProgress}% complete
                  </p>
                  <div className="w-full max-w-xs mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6C5CE7] transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
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
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-[#00B894] hover:bg-[#00A885] text-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleProcessAgain}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Edit Settings
                    </Button>
                  </div>
                </div>
              )}

              {processingState === "error" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-[rgba(255,107,107,0.1)] flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-[#FF6B6B]" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Processing Failed
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {errorMessage || "An error occurred while processing your video"}
                  </p>
                  <Button
                    variant="outline"
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
