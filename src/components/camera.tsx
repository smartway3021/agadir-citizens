"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Camera as CameraIcon, RotateCcw, Check, X, Flashlight } from "lucide-react"
import { enhanceForOcr } from "@/lib/image-process"

interface CameraProps {
  side: "front" | "back"
  onCapture: (side: "front" | "back", imageSrc: string) => void
  onClose: () => void
}

const SHARPNESS_THRESHOLD = 60
const STABLE_FRAMES = 3
const CHECK_INTERVAL = 400

function measureSharpness(imageData: ImageData): number {
  const { data, width, height } = imageData
  let sum = 0
  let count = 0

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = (y * width + x) * 4
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]

      const gx =
        -1 * (0.299 * data[((y - 1) * width + (x - 1)) * 4] + 0.587 * data[((y - 1) * width + (x - 1)) * 4 + 1] + 0.114 * data[((y - 1) * width + (x - 1)) * 4 + 2])
        + 0 * (0.299 * data[((y - 1) * width + x) * 4] + 0.587 * data[((y - 1) * width + x) * 4 + 1] + 0.114 * data[((y - 1) * width + x) * 4 + 2])
        + 1 * (0.299 * data[((y - 1) * width + (x + 1)) * 4] + 0.587 * data[((y - 1) * width + (x + 1)) * 4 + 1] + 0.114 * data[((y - 1) * width + (x + 1)) * 4 + 2])
        - 2 * (0.299 * data[(y * width + (x - 1)) * 4] + 0.587 * data[(y * width + (x - 1)) * 4 + 1] + 0.114 * data[(y * width + (x - 1)) * 4 + 2])
        + 0 * (0.299 * data[(y * width + x) * 4] + 0.587 * data[(y * width + x) * 4 + 1] + 0.114 * data[(y * width + x) * 4 + 2])
        + 2 * (0.299 * data[(y * width + (x + 1)) * 4] + 0.587 * data[(y * width + (x + 1)) * 4 + 1] + 0.114 * data[(y * width + (x + 1)) * 4 + 2])
        - 1 * (0.299 * data[((y + 1) * width + (x - 1)) * 4] + 0.587 * data[((y + 1) * width + (x - 1)) * 4 + 1] + 0.114 * data[((y + 1) * width + (x - 1)) * 4 + 2])
        + 0 * (0.299 * data[((y + 1) * width + x) * 4] + 0.587 * data[((y + 1) * width + x) * 4 + 1] + 0.114 * data[((y + 1) * width + x) * 4 + 2])
        + 1 * (0.299 * data[((y + 1) * width + (x + 1)) * 4] + 0.587 * data[((y + 1) * width + (x + 1)) * 4 + 1] + 0.114 * data[((y + 1) * width + (x + 1)) * 4 + 2])

      const gy =
        -1 * (0.299 * data[((y - 1) * width + (x - 1)) * 4] + 0.587 * data[((y - 1) * width + (x - 1)) * 4 + 1] + 0.114 * data[((y - 1) * width + (x - 1)) * 4 + 2])
        - 2 * (0.299 * data[(y * width + (x - 1)) * 4] + 0.587 * data[(y * width + (x - 1)) * 4 + 1] + 0.114 * data[(y * width + (x - 1)) * 4 + 2])
        - 1 * (0.299 * data[((y + 1) * width + (x - 1)) * 4] + 0.587 * data[((y + 1) * width + (x - 1)) * 4 + 1] + 0.114 * data[((y + 1) * width + (x - 1)) * 4 + 2])
        + 0 * (0.299 * data[((y - 1) * width + x) * 4] + 0.587 * data[((y - 1) * width + x) * 4 + 1] + 0.114 * data[((y - 1) * width + x) * 4 + 2])
        + 0 * (0.299 * data[(y * width + x) * 4] + 0.587 * data[(y * width + x) * 4 + 1] + 0.114 * data[(y * width + x) * 4 + 2])
        + 0 * (0.299 * data[(y * width + (x + 1)) * 4] + 0.587 * data[(y * width + (x + 1)) * 4 + 1] + 0.114 * data[(y * width + (x + 1)) * 4 + 2])
        + 1 * (0.299 * data[((y + 1) * width + (x - 1)) * 4] + 0.587 * data[((y + 1) * width + (x - 1)) * 4 + 1] + 0.114 * data[((y + 1) * width + (x - 1)) * 4 + 2])
        + 2 * (0.299 * data[((y + 1) * width + x) * 4] + 0.587 * data[((y + 1) * width + x) * 4 + 1] + 0.114 * data[((y + 1) * width + x) * 4 + 2])
        + 1 * (0.299 * data[((y + 1) * width + (x + 1)) * 4] + 0.587 * data[((y + 1) * width + (x + 1)) * 4 + 1] + 0.114 * data[((y + 1) * width + (x + 1)) * 4 + 2])

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      sum += magnitude
      count++
    }
  }

  return count > 0 ? sum / count : 0
}

export function Camera({ side, onCapture, onClose }: CameraProps) {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [captured, setCaptured] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [torchOn, setTorchOn] = useState(false)
  const [sharpness, setSharpness] = useState(0)
  const [stableCount, setStableCount] = useState(0)
  const [autoCapturing, setAutoCapturing] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const checkVideoTrack = useCallback(async () => {
    const video = webcamRef.current?.video
    if (!video?.srcObject) return
    const track = (video.srcObject as MediaStream).getVideoTracks()[0]
    if (track) {
      const capabilities = track.getCapabilities?.() as any
      if (capabilities?.torch) setTorchSupported(true)
    }
  }, [])

  useEffect(() => {
    if (!captured) {
      setTimeout(checkVideoTrack, 1500)
    }
  }, [captured, checkVideoTrack])

  function captureVideoFrame(): string | null {
    const video = webcamRef.current?.video
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.92)
  }

  const startAutoCapture = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    let frames = 0
    timerRef.current = setInterval(() => {
      const video = webcamRef.current?.video
      const canvas = canvasRef.current
      if (!video || !canvas || captured) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const cw = 320
      const ch = 240
      canvas.width = cw
      canvas.height = ch

      const vw = video.videoWidth
      const vh = video.videoHeight
      const cropSize = Math.min(vw, vh) * 0.5
      const sx = (vw - cropSize) / 2
      const sy = (vh - cropSize) / 2

      ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, cw, ch)
      const imageData = ctx.getImageData(0, 0, cw, ch)
      const score = measureSharpness(imageData)

      setSharpness(Math.round(score))

      if (score >= SHARPNESS_THRESHOLD) {
        frames++
        setStableCount(frames)
        if (frames >= STABLE_FRAMES && !autoCapturing) {
          setAutoCapturing(true)
          const frame = captureVideoFrame()
          if (frame) {
            setCaptured(frame)
            if (timerRef.current) clearInterval(timerRef.current)
          }
        }
      } else {
        frames = 0
        setStableCount(0)
      }
    }, CHECK_INTERVAL)
  }, [captured, autoCapturing])

  useEffect(() => {
    if (!captured) startAutoCapture()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [captured, startAutoCapture])

  const toggleTorch = useCallback(async () => {
    const video = webcamRef.current?.video
    if (!video?.srcObject) return
    const track = (video.srcObject as MediaStream).getVideoTracks()[0]
    if (track) {
      try {
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] } as any)
        setTorchOn(!torchOn)
      } catch { /* torch not supported */ }
    }
  }, [torchOn])

  const capture = useCallback(() => {
    if (autoCapturing) return
    const imageSrc = captureVideoFrame()
    if (imageSrc) {
      setCaptured(imageSrc)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoCapturing])

  const confirm = useCallback(async () => {
    if (captured) {
      const enhanced = await enhanceForOcr(captured)
      onCapture(side, enhanced)
    }
  }, [captured, onCapture, side])

  const retake = useCallback(() => {
    setCaptured(null)
    setAutoCapturing(false)
    setSharpness(0)
    setStableCount(0)
  }, [])

  const toggleFacing = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
    if (torchOn) setTorchOn(false)
  }, [torchOn])

  const sharpnessPercent = Math.min(100, Math.round((sharpness / (SHARPNESS_THRESHOLD * 2)) * 100))
  const frameColor = stableCount >= STABLE_FRAMES ? "border-green-400" : sharpness > SHARPNESS_THRESHOLD * 0.6 ? "border-yellow-400" : "border-white/70"

  const label = side === "front" ? "Recto" : "Verso"

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-black/90">
        <button onClick={onClose} className="text-white/80 hover:text-white p-1">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium text-sm md:text-base">
          Scanner {label}
        </h2>
        <div className="flex gap-1">
          {torchSupported && (
            <button onClick={toggleTorch} className={`p-1 transition-colors ${torchOn ? "text-yellow-400" : "text-white/80 hover:text-white"}`}>
              <Flashlight className="w-5 h-5" />
            </button>
          )}
          <button onClick={toggleFacing} className="text-white/80 hover:text-white p-1">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <canvas ref={canvasRef} className="hidden" />
        {captured ? (
          <img
            src={captured}
            alt={`Carte ${label}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={1.0}
                videoConstraints={{
                  facingMode,
                  width: { ideal: 2560 },
                  height: { ideal: 1920 },
                  aspectRatio: { ideal: 1.586 },
                }}
                className="w-full h-full object-cover"
                mirrored={false}
              />
            </div>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div className="relative w-full max-w-sm aspect-[1.586/1]">
                <div className={`absolute inset-0 border-2 rounded-lg transition-colors duration-300 ${frameColor}`} />
                <div className={`absolute -inset-0.5 border-2 rounded-[10px] transition-colors duration-300 ${stableCount >= STABLE_FRAMES ? "border-green-400/30" : sharpness > 0 ? "border-yellow-400/20" : "border-white/10"}`} />
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-sm transition-colors duration-300" style={{ borderColor: stableCount >= STABLE_FRAMES ? "rgb(74 222 128)" : "rgba(255,255,255,0.7)" }} />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr-sm transition-colors duration-300" style={{ borderColor: stableCount >= STABLE_FRAMES ? "rgb(74 222 128)" : "rgba(255,255,255,0.7)" }} />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl-sm transition-colors duration-300" style={{ borderColor: stableCount >= STABLE_FRAMES ? "rgb(74 222 128)" : "rgba(255,255,255,0.7)" }} />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-sm transition-colors duration-300" style={{ borderColor: stableCount >= STABLE_FRAMES ? "rgb(74 222 128)" : "rgba(255,255,255,0.7)" }} />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
              {sharpness > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${stableCount >= STABLE_FRAMES ? "bg-green-400" : sharpness >= SHARPNESS_THRESHOLD * 0.6 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${sharpnessPercent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${stableCount >= STABLE_FRAMES ? "text-green-400" : sharpness >= SHARPNESS_THRESHOLD * 0.6 ? "text-yellow-400" : "text-red-400"}`}>
                    {stableCount >= STABLE_FRAMES ? "Net !" : sharpness >= SHARPNESS_THRESHOLD * 0.6 ? "Approchez..." : "Stabilisez..."}
                  </span>
                </div>
              )}
              <p className="text-white/50 text-[10px] text-center max-w-xs">
{sharpness === 0 ? "Placez la carte dans le cadre..." : stableCount >= STABLE_FRAMES ? "Photo automatique..." : "Maintenez la carte stable et bien éclairée"}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 px-4 py-4 md:gap-6 md:py-6 bg-black/90">
        {captured ? (
          <>
            <Button variant="secondary" size="lg" onClick={retake}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Reprendre
            </Button>
            <Button size="lg" onClick={confirm}>
              <Check className="w-5 h-5 mr-2" />
              Valider
            </Button>
          </>
        ) : (
          <Button size="lg" className="min-w-[200px]" onClick={capture}>
            <CameraIcon className="w-5 h-5 mr-2" />
            Prendre la photo
          </Button>
        )}
      </div>
    </div>
  )
}

export function IdCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M5 17v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1" />
      <path d="m16 10 2 2 4-4" />
    </svg>
  )
}
