"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  ArrowLeft,
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
  "top-left": "TL",
  "top-center": "TC",
  "top-right": "TR",
  "middle-left": "ML",
  "center": "C",
  "middle-right": "MR",
  "bottom-left": "BL",
  "bottom-center": "BC",
  "bottom-right": "BR",
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]

type ProcessingState = "idle" | "processing" | "success" | "error"
type PositionMode = "grid" | "advanced"

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

  // Overlay preview styles — positions the overlay relative to the actual
  // rendered video rect inside the object-contain preview container.
  // containerRef is set on the video wrapper div so we can measure it.
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const getPreviewOverlayStyles = useCallback((): React.CSSProperties => {
    if (!videoDimensions || !overlayImage || !previewContainerRef.current) return { display: "none" }

    const container = previewContainerRef.current
    const containerW = container.clientWidth
    const containerH = container.clientHeight

    // Compute the rendered video size inside the container (object-contain letterbox)
    const videoAR = videoDimensions.width / videoDimensions.height
    const containerAR = containerW / containerH

    let renderedW: number, renderedH: number
    if (videoAR > containerAR) {
      renderedW = containerW
      renderedH = containerW / videoAR
    } else {
      renderedH = containerH
      renderedW = containerH * videoAR
    }

    // Letterbox offsets (centred)
    const offsetX = (containerW - renderedW) / 2
    const offsetY = (containerH - renderedH) / 2

    // Overlay dimensions in video space
    const overlayW = (videoDimensions.width * size) / 100
    const overlayH = (overlayImage.height / overlayImage.width) * overlayW

    // Overlay position in video space
    const coords = getOverlayCoords(videoDimensions.width, videoDimensions.height, overlayW, overlayH)

    // Scale to rendered video space
    const scaleX = renderedW / videoDimensions.width
    const scaleY = renderedH / videoDimensions.height

    return {
      position: "absolute",
      left: offsetX + coords.x * scaleX,
      top: offsetY + coords.y * scaleY,
      width: overlayW * scaleX,
      height: "auto",
      pointerEvents: "none",
    }
  }, [videoDimensions, overlayImage, size, getOverlayCoords])

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] dark">
      <SidebarNav mode="creator" />

      {/* Hidden processing elements */}
      <video ref={hiddenVideoRef} className="hidden" playsInline crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="hidden" />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isFromCampaign && (
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 text-sm text-[#8892A8] hover:text-[#E2E8F0] transition-colors"
              >
                <ArrowLeft size={16} />
              </Link>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#E2E8F0]">
                {isFromCampaign ? `Apply to ${campaignBrand}` : "Video Studio"}
              </h1>
              <p className="text-sm text-[#8892A8]">
                Overlay brand assets onto your video
              </p>
            </div>
          </div>
          <Button
            onClick={processingState === "success" ? handleProcessAgain : handleProcess}
            disabled={processingState === "success" ? false : !canProcess}
            className={cn(
              "font-semibold",
              processingState === "success"
                ? "bg-[#2A3050] hover:bg-[#363d5a] text-[#E2E8F0]"
                : "bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white"
            )}
          >
            {processingState === "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {processingProgress}%
              </>
            ) : processingState === "success" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Edit Again
              </>
            ) : (
              "Process Video"
            )}
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Controls */}
          <div className="lg:w-[55%] space-y-4">
            {/* Video Upload */}
            <div className="bg-[#131825] rounded-xl border border-[#2A3050] p-4">
              <h3 className="text-sm font-semibold text-[#E2E8F0] mb-3">Video</h3>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
              />
              {!videoPreviewUrl ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleVideoSelect(file)
                  }}
                  className="h-24 border-2 border-dashed border-[#2A3050] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#6C5CE7] transition-colors"
                >
                  <Upload size={20} className="text-[#8892A8] mb-1" />
                  <span className="text-sm text-[#8892A8]">Upload video (max 100MB)</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-[#0B0F1A] rounded-lg">
                  <div className="w-10 h-10 bg-[#6C5CE720] rounded flex items-center justify-center">
                    <Upload size={16} className="text-[#6C5CE7]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E2E8F0] truncate">{videoFile?.name}</p>
                    <p className="text-xs text-[#8892A8]">{videoFile && (videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button onClick={handleClearVideo} className="text-[#8892A8] hover:text-[#FF6B6B]">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Brand Asset */}
            <div className="bg-[#131825] rounded-xl border border-[#2A3050] p-4">
              <h3 className="text-sm font-semibold text-[#E2E8F0] mb-3">Brand Asset</h3>
              <input
                ref={overlayInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleOverlaySelect(e.target.files[0])}
              />
              {!overlayPreviewUrl ? (
                <div
                  onClick={() => overlayInputRef.current?.click()}
                  className="h-24 border-2 border-dashed border-[#2A3050] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#6C5CE7] transition-colors"
                >
                  <ImageIcon size={20} className="text-[#8892A8] mb-1" />
                  <span className="text-sm text-[#8892A8]">Upload PNG or JPG</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-[#0B0F1A] rounded-lg">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden">
                    <img src={overlayPreviewUrl} alt="Overlay" className="object-contain w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E2E8F0] truncate">
                      {isFromCampaign ? `${campaignBrand} Asset` : overlayFile?.name}
                    </p>
                    {isFromCampaign && <p className="text-xs text-[#8892A8]">Campaign asset</p>}
                  </div>
                  {!isFromCampaign && (
                    <button onClick={handleClearOverlay} className="text-[#8892A8] hover:text-[#FF6B6B]">
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Overlay Settings */}
            <div className="bg-[#131825] rounded-xl border border-[#2A3050] p-4">
              <h3 className="text-sm font-semibold text-[#E2E8F0] mb-3">Overlay Settings</h3>

              {/* Position Mode Toggle */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setPositionMode("grid")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded transition-colors",
                    positionMode === "grid" ? "bg-[#6C5CE7] text-white" : "bg-[#1A2035] text-[#8892A8] hover:text-[#E2E8F0]"
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setPositionMode("advanced")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded transition-colors",
                    positionMode === "advanced" ? "bg-[#6C5CE7] text-white" : "bg-[#1A2035] text-[#8892A8] hover:text-[#E2E8F0]"
                  )}
                >
                  Advanced
                </button>
              </div>

              {positionMode === "grid" ? (
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {POSITION_GRID.flat().map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={cn(
                        "py-2 text-xs font-medium rounded transition-colors",
                        position === pos ? "bg-[#6C5CE7] text-white" : "bg-[#1A2035] text-[#8892A8] hover:text-[#E2E8F0]"
                      )}
                    >
                      {POSITION_LABELS[pos]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#8892A8]">X Position</span>
                      <Input
                        type="number"
                        value={customX}
                        onChange={(e) => setCustomX(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-14 h-6 text-xs bg-[#0B0F1A] border-[#2A3050] text-[#E2E8F0] text-center"
                      />
                    </div>
                    <Slider value={[customX]} onValueChange={([v]) => setCustomX(v)} max={100} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#8892A8]">Y Position</span>
                      <Input
                        type="number"
                        value={customY}
                        onChange={(e) => setCustomY(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-14 h-6 text-xs bg-[#0B0F1A] border-[#2A3050] text-[#E2E8F0] text-center"
                      />
                    </div>
                    <Slider value={[customY]} onValueChange={([v]) => setCustomY(v)} max={100} step={1} />
                  </div>
                </div>
              )}

              {/* Size */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[#8892A8]">Size</span>
                  <span className="text-xs text-[#E2E8F0]">{size}%</span>
                </div>
                <Slider value={[size]} onValueChange={([v]) => setSize(v)} min={10} max={100} step={5} />
              </div>
            </div>
          </div>

          {/* Right: Preview — portrait (9:16) to match short-form video */}
          <div className="lg:w-[45%] flex justify-center">
            <div className="w-full max-w-[340px]">
              <div className="bg-[#131825] rounded-xl border border-[#2A3050]">
                <div className="px-4 py-3 border-b border-[#2A3050]">
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">
                    {processingState === "success" ? "Result" : "Preview"}
                  </h3>
                </div>

                <div className="p-4">
                  {/* 9:16 portrait container */}
                  <div
                    ref={previewContainerRef}
                    className="relative w-full bg-[#0B0F1A] rounded-lg overflow-hidden"
                    style={{ aspectRatio: "9/16" }}
                  >
                    {/* Idle – no video */}
                    {processingState !== "success" && !videoPreviewUrl && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8892A8]">
                        <Upload size={28} className="mb-2 opacity-50" />
                        <p className="text-sm">Upload a video to preview</p>
                      </div>
                    )}

                    {/* Video preview with overlay */}
                    {processingState !== "success" && videoPreviewUrl && (
                      <>
                        <video
                          ref={previewVideoRef}
                          src={videoPreviewUrl}
                          className="absolute inset-0 w-full h-full object-contain"
                          controls={processingState === "idle"}
                          muted
                          onLoadedMetadata={handleVideoMetadata}
                        />
                        {overlayImage && videoDimensions && processingState === "idle" && (
                          <img
                            src={overlayPreviewUrl || ""}
                            alt="Overlay"
                            style={getPreviewOverlayStyles()}
                          />
                        )}
                        {/* Processing overlay */}
                        {processingState === "processing" && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                            <Loader2 size={32} className="text-[#6C5CE7] animate-spin mb-3" />
                            <p className="text-sm text-white mb-2">Processing...</p>
                            <div className="w-32 h-1.5 bg-[#2A3050] rounded-full overflow-hidden">
                              <div className="h-full bg-[#6C5CE7] transition-all" style={{ width: `${processingProgress}%` }} />
                            </div>
                            <p className="text-xs text-[#8892A8] mt-1">{processingProgress}%</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Success result */}
                    {processingState === "success" && resultUrl && (
                      <>
                        <video src={resultUrl} className="absolute inset-0 w-full h-full object-contain" controls />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#00B89490] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          Done
                        </div>
                      </>
                    )}

                    {/* Error state */}
                    {processingState === "error" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <AlertCircle size={28} className="text-[#FF6B6B] mb-2" />
                        <p className="text-sm text-[#E2E8F0] mb-1">Failed</p>
                        <p className="text-xs text-[#8892A8] text-center px-4">{errorMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {processingState === "success" && (
                    <div className="mt-4 space-y-2">
                      <Button onClick={handleDownload} className="w-full bg-[#6C5CE7] hover:bg-[#5a4dd4] text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={handlePublish} className="w-full bg-[#00B894] hover:bg-[#00a383] text-white">
                        <Send className="mr-2 h-4 w-4" />
                        Publish (@YourChannelName)
                      </Button>
                    </div>
                  )}

                  {processingState === "error" && (
                    <div className="mt-4">
                      <Button onClick={() => setProcessingState("idle")} variant="outline" className="w-full border-[#2A3050] text-[#8892A8]">
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
      <div className="flex min-h-screen bg-[#0B0F1A] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
      </div>
    }>
      <VideoStudioContent />
    </Suspense>
  )
}
