import { NextResponse } from "next/server"
import { writeFile, readFile, unlink, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { execFile } from "child_process"
import { randomUUID } from "crypto"

// Resolve FFmpeg/FFprobe paths at runtime.
// Checks common locations for static binaries, then falls back to system PATH.
function findBinary(name: "ffmpeg" | "ffprobe"): string {
  const candidates = [
    // ffmpeg-static / ffprobe-static put binaries here
    join(process.cwd(), "node_modules", `${name}-static`, name),
    join(process.cwd(), "node_modules", `${name}-static`, "bin", name),
    // .bin symlinks
    join(process.cwd(), "node_modules", ".bin", name),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  // Fall back to system binary
  return name
}

const FFMPEG_PATH = findBinary("ffmpeg")
const FFPROBE_PATH = findBinary("ffprobe")

const TEMP_DIR = "/tmp/marketingplace"
const FFMPEG_TIMEOUT = 120_000

// Next.js App Router: allow up to 500MB uploads
export const maxDuration = 120

const VALID_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"]
const VALID_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"]

const POSITION_MAP: Record<string, { x: string; y: string }> = {
  "top-left":      { x: "10",        y: "10" },
  "top-center":    { x: "(W-w)/2",   y: "10" },
  "top-right":     { x: "W-w-10",    y: "10" },
  "middle-left":   { x: "10",        y: "(H-h)/2" },
  "center":        { x: "(W-w)/2",   y: "(H-h)/2" },
  "middle-right":  { x: "W-w-10",    y: "(H-h)/2" },
  "bottom-left":   { x: "10",        y: "H-h-10" },
  "bottom-center": { x: "(W-w)/2",   y: "H-h-10" },
  "bottom-right":  { x: "W-w-10",    y: "H-h-10" },
}

interface ProbeResult {
  width: number
  height: number
}

function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".")
  if (dot === -1) return ""
  return filename.slice(dot).toLowerCase()
}

function probeVideo(videoPath: string): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    execFile(
      FFPROBE_PATH,
      [
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        videoPath,
      ],
      { timeout: 15_000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`ffprobe failed: ${stderr || error.message}`))
          return
        }
        try {
          const data = JSON.parse(stdout)
          const stream = data.streams?.[0]
          if (!stream || !stream.width || !stream.height) {
            reject(new Error("Could not determine video dimensions"))
            return
          }
          resolve({ width: stream.width, height: stream.height })
        } catch {
          reject(new Error("Failed to parse ffprobe output"))
        }
      }
    )
  })
}

function runFFmpeg(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      FFMPEG_PATH,
      args,
      { timeout: FFMPEG_TIMEOUT, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          const msg = stderr ? stderr.slice(-500) : error.message
          reject(new Error(msg))
          return
        }
        resolve(stderr || stdout)
      }
    )

    setTimeout(() => {
      proc.kill("SIGKILL")
    }, FFMPEG_TIMEOUT)
  })
}

async function cleanupFiles(...paths: string[]) {
  await Promise.all(
    paths.map((p) => unlink(p).catch(() => {}))
  )
}

// Helper to check if a binary is available (either as a file path or system command)
async function isBinaryAvailable(binaryPath: string | null): Promise<boolean> {
  if (!binaryPath) return false
  
  // If it's an absolute path, check if file exists
  if (binaryPath.startsWith("/")) {
    return existsSync(binaryPath)
  }
  
  // Otherwise, try to run it with --version to check if it's a valid system command
  return new Promise((resolve) => {
    execFile(binaryPath, ["-version"], { timeout: 5000 }, (error) => {
      resolve(!error)
    })
  })
}

export async function POST(request: Request) {
  // Check FFmpeg availability at runtime
  const ffmpegAvailable = await isBinaryAvailable(FFMPEG_PATH)
  const ffprobeAvailable = await isBinaryAvailable(FFPROBE_PATH)

  if (!ffmpegAvailable) {
    return NextResponse.json(
      { error: "FFmpeg is not available. Please deploy to Vercel or install FFmpeg locally." },
      { status: 500 }
    )
  }
  if (!ffprobeAvailable) {
    return NextResponse.json(
      { error: "FFprobe is not available. Please deploy to Vercel or install FFmpeg locally." },
      { status: 500 }
    )
  }

  let inputVideoPath = ""
  let inputOverlayPath = ""
  let outputPath = ""

  try {
    // Ensure temp directory exists
    if (!existsSync(TEMP_DIR)) {
      await mkdir(TEMP_DIR, { recursive: true })
    }

    // Parse form data
    const formData = await request.formData()
    const videoFile = formData.get("video")
    const overlayFile = formData.get("overlay")
    const position = (formData.get("position") as string) || "bottom-right"
    const size = Math.min(50, Math.max(5, Number(formData.get("size")) || 15))
    const opacity = Math.min(100, Math.max(0, Number(formData.get("opacity")) || 85))

    // Validate files exist
    if (!(videoFile instanceof File)) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 })
    }
    if (!(overlayFile instanceof File)) {
      return NextResponse.json({ error: "Overlay file is required" }, { status: 400 })
    }

    // Validate video file type
    const videoExt = getFileExtension(videoFile.name)
    const isValidVideo = videoFile.type.startsWith("video/") || VALID_VIDEO_EXTENSIONS.includes(videoExt)
    if (!isValidVideo) {
      return NextResponse.json(
        { error: `Invalid video file type: ${videoFile.type || videoExt}. Accepted: MP4, MOV, WebM` },
        { status: 400 }
      )
    }

    // Validate video file size (500MB max)
    if (videoFile.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Video file exceeds 500MB limit" },
        { status: 400 }
      )
    }

    // Validate overlay file type
    const overlayExt = getFileExtension(overlayFile.name)
    const isValidOverlay = overlayFile.type.startsWith("image/") || VALID_IMAGE_EXTENSIONS.includes(overlayExt)
    if (!isValidOverlay) {
      return NextResponse.json(
        { error: `Invalid overlay file type: ${overlayFile.type || overlayExt}. Accepted: PNG, JPG, GIF, WebP` },
        { status: 400 }
      )
    }

    // Validate position
    if (!POSITION_MAP[position]) {
      return NextResponse.json(
        { error: `Invalid position: ${position}` },
        { status: 400 }
      )
    }

    // Write files to temp directory
    const sessionId = randomUUID()
    inputVideoPath = join(TEMP_DIR, `${sessionId}-input${videoExt || ".mp4"}`)
    inputOverlayPath = join(TEMP_DIR, `${sessionId}-overlay${overlayExt || ".png"}`)
    outputPath = join(TEMP_DIR, `${sessionId}-output.mp4`)

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
    const overlayBuffer = Buffer.from(await overlayFile.arrayBuffer())

    await writeFile(inputVideoPath, videoBuffer)
    await writeFile(inputOverlayPath, overlayBuffer)

    // Probe video dimensions
    const { width: videoWidth, height: videoHeight } = await probeVideo(inputVideoPath)

    // Calculate overlay dimensions
    const overlayWidth = Math.round(videoWidth * size / 100)
    const opacityDecimal = (opacity / 100).toFixed(2)

    // Calculate position coordinates
    // We need to know the overlay height after scaling. Use ffprobe on the overlay too,
    // or compute proportionally. Let's probe the overlay to get aspect ratio.
    let overlayHeight: number
    try {
      const overlayProbe = await probeVideo(inputOverlayPath)
      overlayHeight = Math.round(overlayWidth * overlayProbe.height / overlayProbe.width)
    } catch {
      // For static images, ffprobe may fail on stream detection. Assume 4:1 ratio as fallback.
      // Use sharp to get dimensions instead.
      try {
        const sharp = require("sharp")
        const meta = await sharp(inputOverlayPath).metadata()
        if (meta.width && meta.height) {
          overlayHeight = Math.round(overlayWidth * meta.height / meta.width)
        } else {
          overlayHeight = Math.round(overlayWidth / 4)
        }
      } catch {
        overlayHeight = Math.round(overlayWidth / 4)
      }
    }

    // Compute pixel positions
    const pos = POSITION_MAP[position]
    const xExpr = pos.x
      .replace(/W/g, String(videoWidth))
      .replace(/w/g, String(overlayWidth))
    const yExpr = pos.y
      .replace(/H/g, String(videoHeight))
      .replace(/h/g, String(overlayHeight))

    // Evaluate the position expressions
    const xPos = Function(`"use strict"; return (${xExpr})`)() as number
    const yPos = Function(`"use strict"; return (${yExpr})`) () as number

    // Build FFmpeg filter
    const isGif = overlayExt === ".gif"
    const filterComplex = isGif
      ? `[1:v]scale=${overlayWidth}:-1,format=rgba,colorchannelmixer=aa=${opacityDecimal}[ovrl];[0:v][ovrl]overlay=${xPos}:${yPos}:shortest=1`
      : `[1:v]scale=${overlayWidth}:-1,format=rgba,colorchannelmixer=aa=${opacityDecimal}[ovrl];[0:v][ovrl]overlay=${xPos}:${yPos}`

    const ffmpegArgs = [
      "-i", inputVideoPath,
      ...(isGif ? ["-ignore_loop", "0", "-i", inputOverlayPath] : ["-i", inputOverlayPath]),
      "-filter_complex", filterComplex,
      "-codec:a", "copy",
      "-y",
      outputPath,
    ]

    // Run FFmpeg
    await runFFmpeg(ffmpegArgs)

    // Read output and return
    const outputBuffer = await readFile(outputPath)

    // Clean up temp files
    await cleanupFiles(inputVideoPath, inputOverlayPath, outputPath)

    return new NextResponse(outputBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="composited.mp4"',
        "Content-Length": String(outputBuffer.length),
      },
    })
  } catch (err) {
    // Clean up on error
    await cleanupFiles(inputVideoPath, inputOverlayPath, outputPath)

    const message = err instanceof Error ? err.message : "Unknown error during processing"
    return NextResponse.json(
      { error: message.slice(0, 500) },
      { status: 500 }
    )
  }
}
