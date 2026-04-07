"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
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
  Zap,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

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

function VideoStudioContent() {
  const searchParams = useSearchParams()
  
  // Campaign data from URL params
  const campaignId = searchParams.get("campaignId")
  const campaignBrand = searchParams.get("brand")
  const campaignAssetUrl = searchParams.get("assetUrl")
  const isFromCampaign = !!campaignId && !!campaignAssetUrl

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)

  // Overlay state
  const [overlayFile, setOverlayFile] = useState<File | null>(null)
  const [overlayPreviewUrl, setOverlayPreviewUrl] = useState<string | null>(null)
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null)
  const [isPreloaded, setIsPreloaded] = useState(false)
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

  // Load campaign asset if coming from marketplace
  useEffect(() => {
    if (isFromCampaign && campaignAssetUrl && !isPreloaded) {
      setOverlayPreviewUrl(campaignAssetUrl)
      setIsPreloaded(true)
    }
  }, [isFromCampaign, campaignAssetUrl, isPreloaded])

  // Load overlay image when file changes
  useEffect(() => {
    if (!overlayPreviewUrl) {
      setOverlayImage(null)
      return
    }

    const img = new window.Image()
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

    if (overlayPreviewUrl && !isPreloaded) URL.revokeObjectURL(overlayPreviewUrl)

    setOverlayFile(file)
    setOverlayPreviewUrl(URL.createObjectURL(file))
    setIsPreloaded(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isPreloaded])

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
    if (overlayPreviewUrl && !isPreloaded) URL.revokeObjectURL(overlayPreviewUrl)
    setOverlayFile(null)
    setOverlayPreviewUrl(null)
    setOverlayImage(null)
    setIsPreloaded(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isPreloaded])

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
    <div className="flex min-h-screen bg-[#0B0F1A] dark">
      <SidebarNav mode="creator" />

      {/* Hidden elements for processing */}
      <video ref={hiddenVideoRef} className="hidden" playsInline crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="hidden" />

      <main className="flex-1 p-6 lg:p-8">
        {/* Header with campaign context */}
        <div className="mb-6">
          {isFromCampaign ? (
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Marketplace
              </Link>
            </div>
          ) : null}
          
          <div className="flex items-center gap-3">
            {isFromCampaign && (
              <div className="w-10 h-10 rounded-xl bg-[#6C5CE720] flex items-center justify-center">
                <Zap size={20} className="text-[#6C5CE7]" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#E2E8F0]">
                {isFromCampaign ? `${campaignBrand} Campaign` : "Video Studio"}
              </h1>
              <p className="text-[#8892A8] mt-0.5 text-sm">
                {isFromCampaign
                  ? "Upload your video to apply the brand overlay and submit"
                  : "Overlay brand assets onto your video content"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Upload and Configure (60%) */}
          <div className="lg:w-[60%] space-y-6">
            {/* Video Upload */}
            <div className="bg-[#131825] rounded-xl border border-[#2A3050] p-5">
              <h2 className="text-sm font-semibold text-[#E2E8F0] mb-3">
                {isFromCampaign ? "Upload Your Video" : "Video Upload"}
              </h2>
              {!videoFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleVideoSelect(file)
                  }}
                  className="border-2 border-dashed border-[#2A3050] rounded-lg p-8 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[#6C5CE710] transition-colors"
                >
                  <Upload className="mx-auto h-10 w-10 text-[#8892A8] mb-3" />
                  <p className="text-sm text-[#E2E8F0] font-medium">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-xs text-[#8892A8] mt-1">
                    MP4, MOV, or WebM up to 100MB
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4 bg-[#0B0F1A] rounded-lg">
                  {videoPreviewUrl && (
                    <video
                      src={videoPreviewUrl}
                      className="w-24 h-16 object-cover rounded"
                      muted
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E2E8F0] truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-[#8892A8]">
                      {formatFileSize(videoFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearVideo}
                    className="shrink-0 text-[#8892A8] hover:text-[#E2E8F0]"
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

            {/* Brand Asset */}
            <div className="bg-[#131825] rounded-xl border border-[#2A3050] p-5">
              <h2 className="text-sm font-semibold text-[#E2E8F0] mb-3">Brand Asset</h2>
              {!overlayPreviewUrl ? (
                <div className="space-y-3">
                  <div
                    onClick={() => overlayInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleOverlaySelect(file)
                    }}
                    className="border-2 border-dashed border-[#2A3050] rounded-lg p-6 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[#6C5CE710] transition-colors"
                  >
                    <ImageIcon className="mx-auto h-8 w-8 text-[#8892A8] mb-2" />
                    <p className="text-sm text-[#E2E8F0] font-medium">
                      Drop your brand asset here
                    </p>
                    <p className="text-xs text-[#8892A8] mt-1">
                      PNG, JPG, GIF, or WebP
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-[#0B0F1A] rounded-lg">
                  <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                    <Image
                      src={overlayPreviewUrl}
                      alt="Overlay preview"
                      width={56}
                      height={40}
                      className="object-contain max-h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E2E8F0] truncate">
                      {isPreloaded ? `${campaignBrand} Brand Asset` : overlayFile?.name || "Brand Overlay"}
                    </p>
                    {isPreloaded && (
                      <p className="text-xs text-[#6C5CE7]">Preloaded from campaign</p>
                    )}
                  </div>
                  {!isPreloaded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearOverlay}
                      className="shrink-0 text-[#8892A8] hover:text-[#E2E8F0]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
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
            <div className="bg-[#131825] rounded-xl border border-[#2A3050] p-5 space-y-5">
              <h2 className="text-sm font-semibold text-[#E2E8F0]">Overlay Settings</h2>

              {/* Position Grid */}
              <div>
                <label className="text-xs font-medium text-[#8892A8] uppercase tracking-wider">
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
                          : "bg-[#0B0F1A] border-[#2A3050] hover:border-[#6C5CE7]/50"
                      )}
                      aria-label={POSITION_LABELS[pos]}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#8892A8] mt-2">
                  {POSITION_LABELS[position]}
                </p>
              </div>

              {/* Size Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#8892A8] uppercase tracking-wider">
                    Size
                  </label>
                  <span className="text-xs font-mono text-[#E2E8F0]">{size}%</span>
                </div>
                <Slider
                  value={[size]}
                  onValueChange={([val]) => setSize(val)}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#8892A8] uppercase tracking-wider">
                    Opacity
                  </label>
                  <span className="text-xs font-mono text-[#E2E8F0]">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={([val]) => setOpacity(val)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcess}
              disabled={!canProcess}
              className="w-full bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white py-6 text-base font-semibold disabled:opacity-50"
            >
              {processingState === "processing" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing... {processingProgress}%
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  {isFromCampaign ? "Create & Submit" : "Process Video"}
                </>
              )}
            </Button>
          </div>

          {/* Right Panel: Preview / Result (40%) */}
          <div className="lg:w-[40%]">
            <div className="sticky top-6">
              <div className="bg-[#131825] rounded-xl border border-[#2A3050] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#2A3050]">
                  <h2 className="text-sm font-semibold text-[#E2E8F0]">
                    {processingState === "success" ? "Result" : "Preview"}
                  </h2>
                </div>

                <div className="p-5">
                  {/* Idle state */}
                  {processingState === "idle" && !videoPreviewUrl && (
                    <div className="aspect-[9/16] bg-[#0B0F1A] rounded-lg flex flex-col items-center justify-center text-[#8892A8]">
                      <Upload size={32} className="mb-3 opacity-40" />
                      <p className="text-sm font-medium">Upload a video to preview</p>
                    </div>
                  )}

                  {/* Preview with video */}
                  {processingState === "idle" && videoPreviewUrl && (
                    <div className="aspect-[9/16] bg-[#0B0F1A] rounded-lg overflow-hidden relative">
                      <video
                        src={videoPreviewUrl}
                        className="w-full h-full object-contain"
                        controls
                        muted
                      />
                      {overlayImage && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            [position.includes("top") ? "top" : position.includes("bottom") ? "bottom" : "top"]: position.includes("middle") ? "50%" : "12px",
                            [position.includes("left") ? "left" : position.includes("right") ? "right" : "left"]: position.includes("center") ? "50%" : "12px",
                            transform: `${position.includes("center") && !position.includes("top") && !position.includes("bottom") ? "translateX(-50%)" : ""} ${position === "center" || position.includes("middle") ? "translateY(-50%)" : ""}`,
                            width: `${size}%`,
                            opacity: opacity / 100,
                          }}
                        >
                          <Image
                            src={overlayPreviewUrl || ""}
                            alt="Overlay"
                            width={200}
                            height={100}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Processing state */}
                  {processingState === "processing" && (
                    <div className="aspect-[9/16] bg-[#0B0F1A] rounded-lg flex flex-col items-center justify-center">
                      <Loader2 size={48} className="text-[#6C5CE7] animate-spin mb-4" />
                      <p className="text-sm font-medium text-[#E2E8F0] mb-2">Processing video...</p>
                      <div className="w-48 h-2 bg-[#2A3050] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6C5CE7] transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#8892A8] mt-2">{processingProgress}% complete</p>
                    </div>
                  )}

                  {/* Success state */}
                  {processingState === "success" && resultUrl && (
                    <div className="space-y-4">
                      <div className="aspect-[9/16] bg-[#0B0F1A] rounded-lg overflow-hidden">
                        <video
                          src={resultUrl}
                          className="w-full h-full object-contain"
                          controls
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleDownload}
                          className="flex-1 bg-[#00B894] hover:bg-[#00a383] text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          onClick={handleProcessAgain}
                          variant="outline"
                          className="border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0]"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                      {isFromCampaign && (
                        <p className="text-xs text-[#8892A8] text-center">
                          Download your video and upload it to {campaignBrand}&apos;s preferred platform
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error state */}
                  {processingState === "error" && (
                    <div className="aspect-[9/16] bg-[#0B0F1A] rounded-lg flex flex-col items-center justify-center p-6">
                      <AlertCircle size={48} className="text-[#FF6B6B] mb-4" />
                      <p className="text-sm font-medium text-[#E2E8F0] mb-2">Processing Failed</p>
                      <p className="text-xs text-[#8892A8] text-center mb-4">{errorMessage}</p>
                      <Button
                        onClick={() => setProcessingState("idle")}
                        variant="outline"
                        className="border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0]"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VideoStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#0B0F1A] dark items-center justify-center">
        <Loader2 size={32} className="text-[#6C5CE7] animate-spin" />
      </div>
    }>
      <VideoStudioContent />
    </Suspense>
  )
}
