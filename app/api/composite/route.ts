import { NextResponse } from "next/server"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"

// Allow longer execution for video processing
export const maxDuration = 120

// Position mapping to FFmpeg overlay coordinates
// We use expressions that evaluate at runtime based on video dimensions
// W = main video width, H = main video height
// w = overlay width, h = overlay height
// Padding of 10px from edges
const POSITION_MAP: Record<string, { x: string; y: string }> = {
  "top-left": { x: "10", y: "10" },
  "top-center": { x: "(W-w)/2", y: "10" },
  "top-right": { x: "W-w-10", y: "10" },
  "middle-left": { x: "10", y: "(H-h)/2" },
  "center": { x: "(W-w)/2", y: "(H-h)/2" },
  "middle-right": { x: "W-w-10", y: "(H-h)/2" },
  "bottom-left": { x: "10", y: "H-h-10" },
  "bottom-center": { x: "(W-w)/2", y: "H-h-10" },
  "bottom-right": { x: "W-w-10", y: "H-h-10" },
}

export async function POST(request: Request) {
  let ffmpeg: FFmpeg | null = null
  
  try {
    // Parse the multipart form data
    const formData = await request.formData()
    const videoFile = formData.get("video") as File | null
    const overlayFile = formData.get("overlay") as File | null
    const position = (formData.get("position") as string) || "bottom-right"
    const size = parseInt(formData.get("size") as string) || 15
    const opacity = parseInt(formData.get("opacity") as string) || 85

    // Validate inputs
    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }
    if (!overlayFile) {
      return NextResponse.json({ error: "No overlay file provided" }, { status: 400 })
    }

    // Validate position
    if (!POSITION_MAP[position]) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 })
    }

    // Initialize FFmpeg WASM
    ffmpeg = new FFmpeg()
    
    // Load FFmpeg with core from CDN
    await ffmpeg.load({
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
      wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
    })

    // Get video file extension
    const videoExt = videoFile.name.split(".").pop()?.toLowerCase() || "mp4"
    const inputName = `input.${videoExt}`
    
    // Get overlay extension  
    const overlayExt = overlayFile.name.split(".").pop()?.toLowerCase() || "png"
    const overlayName = `overlay.${overlayExt}`

    // Write input files to FFmpeg virtual filesystem
    const videoData = await fetchFile(videoFile)
    const overlayData = await fetchFile(overlayFile)
    
    await ffmpeg.writeFile(inputName, videoData)
    await ffmpeg.writeFile(overlayName, overlayData)

    // Calculate overlay size and position
    const { x, y } = POSITION_MAP[position]
    const opacityValue = opacity / 100

    // Build FFmpeg filter
    // 1. Scale the overlay based on video width and desired size percentage
    // 2. Apply opacity using colorchannelmixer
    // 3. Overlay at the specified position
    const filterComplex = [
      `[1:v]scale=iw*${size}/100:-1,format=rgba,colorchannelmixer=aa=${opacityValue}[ovr]`,
      `[0:v][ovr]overlay=${x}:${y}`,
    ].join(";")

    // Run FFmpeg
    await ffmpeg.exec([
      "-i", inputName,
      "-i", overlayName,
      "-filter_complex", filterComplex,
      "-c:a", "copy", // Copy audio stream
      "-c:v", "libx264", // Re-encode video with H.264
      "-preset", "fast",
      "-crf", "23",
      "-movflags", "+faststart", // Enable streaming
      "-y", // Overwrite output
      "output.mp4",
    ])

    // Read the output file
    const outputData = await ffmpeg.readFile("output.mp4")
    
    // Clean up
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(overlayName)
    await ffmpeg.deleteFile("output.mp4")

    // Return the composited video
    return new NextResponse(outputData, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="composited-${Date.now()}.mp4"`,
      },
    })
  } catch (error) {
    console.error("[v0] FFmpeg processing error:", error)
    const message = error instanceof Error ? error.message : "Video processing failed"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    // Terminate FFmpeg instance
    if (ffmpeg) {
      try {
        ffmpeg.terminate()
      } catch {
        // Ignore termination errors
      }
    }
  }
}
