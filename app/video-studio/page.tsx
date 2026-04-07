"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
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
  Settings2,
  Grid3X3,
  Send,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]

type ProcessingState = "idle" | "processing" | "success" | "error"
type PositionMode = "grid" | "advanced"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function VideoStudioContent() {
  const searchParams = useSearchParams()

  const campaignId = searchParams.get("campaignId")
  const campaignBrand = searchParams.get("brand")
  const campaignAssetUrl = searchParams.get("assetUrl")
  const isFromCampaign = !!campaignId && !!campaignAssetUrl

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Overlay state
  const [overlayFile, setOverlayFile] = useState<File | null>(null)
  const [overlayPreviewUrl, setOverlayPreviewUrl] = useState<string | null>(null)
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const overlayInputRef = useRef<HTMLInputElement>(null)

  // Settings — defaults: bottom-center, 50%
  const [positionMode, setPositionMode] = useState<PositionMode>("grid")
  const [position, setPosition] = useState<Position>("bottom-center")
  const [customX, setCustomX] = useState(50)
  const [customY, setCustomY] = useState(90)
  const [size, setSize] = useState(50)
  const padding = 20

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load campaign asset
  useEffect(() => {
    if (isFromCampaign && campaignAssetUrl && !isPreloaded) {
      setOverlayPreviewUrl(campaignAssetUrl)
      setIsPreloaded(true)
    }
  }, [isFromCampaign, campaignAssetUrl, isPreloaded])

  // Load overlay image
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

  const getOverlayCoords = useCallback((
    videoWidth: number,
    videoHeight: number,
    overlayWidth: number,
    overlayHeight: number
  ): { x: number; y: number } => {
    if (positionMode === "advanced") {
      return {
        x: (customX / 100) * videoWidth - overlayWidth / 2,
        y: (customY / 100) * videoHeight - overlayHeight / 2,
      }
    }
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
  }, [positionMode, position, customX, customY, padding])

  const handleVideoMetadata = useCallback(() => {
    if (previewVideoRef.current) {
      setVideoDimensions({
        width: previewVideoRef.current.videoWidth,
        height: previewVideoRef.current.videoHeight,
      })
    }
  }, [])

  const handleVideoSelect = useCallback((file: File) => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Please select a valid video file (MP4, MOV, or WebM)")
      return
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Video file must be under 100MB for browser processing")
      return
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
    setVideoDimensions(null)
    setProcessingState("idle")
    setResultUrl(null)
  }, [videoPreviewUrl])

  const handleOverlaySelect = useCallback((file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a valid image file (PNG, JPG, GIF, or WebP)")
      return
    }
    if (overlayPreviewUrl && !isPreloaded) URL.revokeObjectURL(overlayPreviewUrl)
    setOverlayFile(file)
    setOverlayPreviewUrl(URL.createObjectURL(file))
    setIsPreloaded(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isPreloaded])

  const handleClearVideo = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setVideoDimensions(null)
    setProcessingState("idle")
    setResultUrl(null)
  }, [videoPreviewUrl])

  const handleClearOverlay = useCallback(() => {
    if (overlayPreviewUrl && !isPreloaded) URL.revokeObjectURL(overlayPreviewUrl)
    setOverlayFile(null)
    setOverlayPreviewUrl(null)
    setOverlayImage(null)
    setIsPreloaded(false)
    setProcessingState("idle")
    setResultUrl(null)
  }, [overlayPreviewUrl, isPreloaded])

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
      video.src = videoPreviewUrl!
      video.muted = true
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error("Failed to load video"))
        video.load()
      })

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const overlayWidth = (video.videoWidth * size) / 100
      const overlayHeight = (overlayImage.height / overlayImage.width) * overlayWidth
      const overlayPos = getOverlayCoords(video.videoWidth, video.videoHeight, overlayWidth, overlayHeight)

      const stream = canvas.captureStream(30)

      const videoWithAudio = document.createElement("video")
      videoWithAudio.src = videoPreviewUrl!
      videoWithAudio.muted = false
      await new Promise<void>((resolve) => {
        videoWithAudio.onloadedmetadata = () => resolve()
        videoWithAudio.load()
      })

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
      } catch { /* no audio */ }

      const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
      let mimeType = ""
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) { mimeType = type; break }
      }
      if (!mimeType) throw new Error("No supported video format found")

      const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 })
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

      const recordingComplete = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
        mediaRecorder.onerror = (e) => reject(e)
      })

      mediaRecorder.start(100)
      video.currentTime = 0

      const renderFrame = () => {
        if (video.paused || video.ended) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.drawImage(overlayImage, overlayPos.x, overlayPos.y, overlayWidth, overlayHeight)
        setProcessingProgress(Math.round((video.currentTime / video.duration) * 100))
        requestAnimationFrame(renderFrame)
      }

      video.onended = () => mediaRecorder.stop()
      await video.play()
      renderFrame()

      const outputBlob = await recordingComplete
      if (hasAudio) { videoWithAudio.pause(); videoWithAudio.src = "" }

      const url = URL.createObjectURL(outputBlob)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(url)
      setProcessingState("success")
      setProcessingProgress(100)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Video processing failed")
      setProcessingState("error")
    }
  }, [videoFile, videoPreviewUrl, overlayImage, size, getOverlayCoords, resultUrl])

  const handleProcessAgain = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setResultUrl(null)
    setProcessingState("idle")
    setProcessingProgress(0)
  }, [resultUrl])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = `branded-video-${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [resultUrl])

  const handlePublish = useCallback(() => {
    toast.success("Video ready to publish! Connect your account to post directly.")
  }, [])

  const canProcess = videoFile && overlayImage && processingState !== "processing"

  // Overlay preview styles — match actual processing coords
  const getPreviewOverlayStyles = useCallback(() => {
    if (!videoDimensions || !overlayImage) return {}
    const overlayWidth = (videoDimensions.width * size) / 100
    const overlayHeight = (overlayImage.height / overlayImage.width) * overlayWidth
    const coords = getOverlayCoords(videoDimensions.width, videoDimensions.height, overlayWidth, overlayHeight)
    return {
      left: `${(coords.x / videoDimensions.width) * 100}%`,
      top: `${(coords.y / videoDimensions.height) * 100}%`,
      width: `${size}%`,
    }
  }, [videoDimensions, overlayImage, size, getOverlayCoords])

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] dark">
      <SidebarNav mode="creator" />

      {/* Hidden processing elements */}
      <video ref={hiddenVideoRef} className="hidden" playsInline crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="hidden" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3050] shrink-0">
          <div className="flex items-center gap-3">
            {isFromCampaign && (
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors mr-2"
              >
                <ArrowLeft size={15} />
                Back
              </Link>
            )}
            <div className="w-8 h-8 rounded-lg bg-[#6C5CE720] flex items-center justify-center">
              <Zap size={16} className="text-[#6C5CE7]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#E2E8F0] leading-none">
                {isFromCampaign ? `${campaignBrand} — Video Studio` : "Video Studio"}
              </h1>
              <p className="text-xs text-[#8892A8] mt-0.5">
                {isFromCampaign ? "Apply brand overlay and submit your clip" : "Overlay brand assets onto your video"}
              </p>
            </div>
          </div>

          {/* Process button in topbar */}
          <Button
            onClick={processingState === "success" ? handleProcessAgain : handleProcess}
            disabled={processingState === "success" ? false : !canProcess}
            size="sm"
            className={cn(
              "font-semibold",
              processingState === "success"
                ? "bg-[#2A3050] hover:bg-[#363d5a] text-[#E2E8F0]"
                : "bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white"
            )}
          >
            {processingState === "processing" ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {processingProgress}%
              </>
            ) : processingState === "success" ? (
              <>
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Re-edit
              </>
            ) : (
              <>
                <Zap className="mr-1.5 h-4 w-4" />
                {isFromCampaign ? "Create & Submit" : "Process Video"}
              </>
            )}
          </Button>
        </div>

        {/* Main studio layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* === LEFT: Large Preview === */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[#080C14] p-6 overflow-hidden">
            <div
              ref={previewContainerRef}
              className="relative w-full max-w-lg"
              style={{ aspectRatio: videoDimensions ? `${videoDimensions.width}/${videoDimensions.height}` : "16/9" }}
            >
              {/* No video uploaded */}
              {!videoPreviewUrl && processingState !== "processing" && processingState !== "success" && (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleVideoSelect(file)
                  }}
                  className="absolute inset-0 rounded-xl border-2 border-dashed border-[#2A3050] bg-[#131825] flex flex-col items-center justify-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[#6C5CE708] transition-colors"
                >
                  <Upload size={36} className="text-[#8892A8] mb-3 opacity-60" />
                  <p className="text-sm font-semibold text-[#E2E8F0]">Drop your video here</p>
                  <p className="text-xs text-[#8892A8] mt-1">MP4, MOV, or WebM · Max 100MB</p>
                </div>
              )}

              {/* Video preview with overlay */}
              {videoPreviewUrl && processingState !== "success" && (
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-black">
                  <video
                    ref={previewVideoRef}
                    src={videoPreviewUrl}
                    className="w-full h-full object-contain"
                    controls={processingState === "idle"}
                    muted
                    onLoadedMetadata={handleVideoMetadata}
                  />
                  {/* Overlay preview */}
                  {overlayImage && videoDimensions && processingState === "idle" && (
                    <div
                      className="absolute pointer-events-none"
                      style={getPreviewOverlayStyles()}
                    >
                      <Image
                        src={overlayPreviewUrl || ""}
                        alt="Brand overlay"
                        width={300}
                        height={150}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                  {/* Processing overlay */}
                  {processingState === "processing" && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl">
                      <Loader2 size={40} className="text-[#6C5CE7] animate-spin mb-4" />
                      <p className="text-sm font-semibold text-white mb-3">Processing video...</p>
                      <div className="w-48 h-2 bg-[#2A3050] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6C5CE7] transition-all duration-200 rounded-full"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#8892A8] mt-2">{processingProgress}% complete</p>
                    </div>
                  )}
                </div>
              )}

              {/* Success result */}
              {processingState === "success" && resultUrl && (
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-black">
                  <video
                    src={resultUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                  {/* Success badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#00B89490] backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} />
                    Processed
                  </div>
                </div>
              )}

              {/* Error state */}
              {processingState === "error" && (
                <div className="absolute inset-0 rounded-xl bg-[#131825] border border-[#FF6B6B40] flex flex-col items-center justify-center">
                  <AlertCircle size={36} className="text-[#FF6B6B] mb-3" />
                  <p className="text-sm font-semibold text-[#E2E8F0] mb-1">Processing Failed</p>
                  <p className="text-xs text-[#8892A8] text-center max-w-xs px-4">{errorMessage}</p>
                  <Button
                    onClick={() => setProcessingState("idle")}
                    size="sm"
                    variant="outline"
                    className="mt-4 border-[#2A3050] text-[#8892A8] hover:text-[#E2E8F0]"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            {/* Download + Publish below preview on success */}
            {processingState === "success" && resultUrl && (
              <div className="flex gap-3 mt-5 w-full max-w-lg">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-[#00B894] hover:bg-[#00a383] text-white font-semibold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={handlePublish}
                  className="flex-1 bg-[#00B894] hover:bg-[#00a383] text-white font-semibold"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish (@YourChannelName)
                </Button>
              </div>
            )}
          </div>

          {/* === RIGHT: Controls Sidebar === */}
          <div className="w-72 xl:w-80 shrink-0 border-l border-[#2A3050] bg-[#0D1120] flex flex-col overflow-y-auto">

            {/* Video upload row */}
            <div className="p-4 border-b border-[#2A3050]">
              <p className="text-[10px] font-semibold text-[#8892A8] uppercase tracking-wider mb-2">
                {isFromCampaign ? "Your Video" : "Video"}
              </p>
              {!videoFile ? (
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-[#2A3050] hover:border-[#6C5CE7] hover:bg-[#6C5CE708] transition-colors text-left"
                >
                  <Upload size={16} className="text-[#8892A8] shrink-0" />
                  <span className="text-xs text-[#8892A8]">Click to upload video</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#131825]">
                  <div className="w-10 h-7 bg-[#0B0F1A] rounded overflow-hidden shrink-0">
                    {videoPreviewUrl && (
                      <video src={videoPreviewUrl} className="w-full h-full object-cover" muted />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#E2E8F0] truncate">{videoFile.name}</p>
                    <p className="text-[10px] text-[#8892A8]">{formatFileSize(videoFile.size)}</p>
                  </div>
                  <button onClick={handleClearVideo} className="text-[#8892A8] hover:text-[#E2E8F0] shrink-0">
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f) }}
              />
            </div>

            {/* Brand asset row */}
            <div className="p-4 border-b border-[#2A3050]">
              <p className="text-[10px] font-semibold text-[#8892A8] uppercase tracking-wider mb-2">Brand Asset</p>
              {!overlayPreviewUrl ? (
                <button
                  onClick={() => overlayInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-[#2A3050] hover:border-[#6C5CE7] hover:bg-[#6C5CE708] transition-colors text-left"
                >
                  <ImageIcon size={16} className="text-[#8892A8] shrink-0" />
                  <span className="text-xs text-[#8892A8]">Click to upload logo / asset</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#131825]">
                  <div className="w-10 h-7 bg-white rounded flex items-center justify-center p-0.5 shrink-0">
                    <Image
                      src={overlayPreviewUrl}
                      alt="Brand asset"
                      width={40}
                      height={28}
                      className="object-contain max-h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#E2E8F0] truncate">
                      {isPreloaded ? `${campaignBrand} Asset` : overlayFile?.name || "Brand Asset"}
                    </p>
                    {isPreloaded && <p className="text-[10px] text-[#6C5CE7]">From campaign</p>}
                  </div>
                  {!isPreloaded && (
                    <button onClick={handleClearOverlay} className="text-[#8892A8] hover:text-[#E2E8F0] shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
              <input
                ref={overlayInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOverlaySelect(f) }}
              />
            </div>

            {/* Overlay Settings */}
            <div className="p-4 flex-1 space-y-5">
              <p className="text-[10px] font-semibold text-[#8892A8] uppercase tracking-wider">Overlay Settings</p>

              {/* Position Mode Toggle */}
              <div>
                <div className="flex items-center bg-[#131825] rounded-lg p-0.5 w-fit mb-3">
                  <button
                    onClick={() => setPositionMode("grid")}
                    className={cn(
                      "flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md transition-all",
                      positionMode === "grid" ? "bg-[#6C5CE7] text-white" : "text-[#8892A8] hover:text-[#E2E8F0]"
                    )}
                  >
                    <Grid3X3 size={12} /> Grid
                  </button>
                  <button
                    onClick={() => setPositionMode("advanced")}
                    className={cn(
                      "flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md transition-all",
                      positionMode === "advanced" ? "bg-[#6C5CE7] text-white" : "text-[#8892A8] hover:text-[#E2E8F0]"
                    )}
                  >
                    <Settings2 size={12} /> Advanced
                  </button>
                </div>

                {/* 3x3 Grid */}
                {positionMode === "grid" && (
                  <div>
                    <div className="grid grid-cols-3 gap-1.5 w-28">
                      {POSITION_GRID.flat().map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setPosition(pos)}
                          className={cn(
                            "w-8 h-8 rounded border-2 transition-colors",
                            position === pos
                              ? "bg-[#6C5CE7] border-[#6C5CE7]"
                              : "bg-[#131825] border-[#2A3050] hover:border-[#6C5CE7]/50"
                          )}
                          aria-label={POSITION_LABELS[pos]}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-[#6C5CE7] mt-1.5 font-medium">{POSITION_LABELS[position]}</p>
                  </div>
                )}

                {/* Advanced X/Y */}
                {positionMode === "advanced" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[#8892A8]">X (from left)</label>
                        <span className="text-xs font-mono text-[#E2E8F0]">{customX}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[customX]}
                          onValueChange={([v]) => setCustomX(v)}
                          min={0} max={100} step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={customX}
                          onChange={(e) => setCustomX(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-14 h-7 text-xs bg-[#131825] border-[#2A3050] text-[#E2E8F0]"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[#8892A8]">Y (from top)</label>
                        <span className="text-xs font-mono text-[#E2E8F0]">{customY}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[customY]}
                          onValueChange={([v]) => setCustomY(v)}
                          min={0} max={100} step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={customY}
                          onChange={(e) => setCustomY(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-14 h-7 text-xs bg-[#131825] border-[#2A3050] text-[#E2E8F0]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[#8892A8]">Size</label>
                  <span className="text-xs font-mono text-[#E2E8F0]">{size}%</span>
                </div>
                <Slider
                  value={[size]}
                  onValueChange={([v]) => setSize(v)}
                  min={5} max={80} step={1}
                  className="w-full"
                />
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
