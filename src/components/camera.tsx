"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera as CameraIcon, RotateCcw, Check, X, Flashlight } from "lucide-react"

interface CameraProps {
  side: "front" | "back"
  onCapture: (side: "front" | "back", imageSrc: string) => void
  onClose: () => void
}

function captureFrame(video: HTMLVideoElement): string | null {
  const canvas = document.createElement("canvas")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.drawImage(video, 0, 0)
  return canvas.toDataURL("image/jpeg", 0.92)
}

export function Camera({ side, onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [captured, setCaptured] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    setError("")
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      const track = stream.getVideoTracks()[0]
      try {
        const caps = track.getCapabilities?.() as any
        if (caps?.torch) setTorchSupported(true)
      } catch { /* torch detection failed */ }
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setError("Autorisation caméra refusée. Autorisez l'accès dans les paramètres.")
      } else if (err?.name === "NotFoundError") {
        setError("Aucune caméra trouvée sur cet appareil.")
      } else {
        setError("Impossible d'accéder à la caméra.")
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return stopCamera
  }, [facingMode, startCamera, stopCamera])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
      stopCamera()
    }
  }, [stopCamera])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video || captured) return
    const src = captureFrame(video)
    if (src) {
      setCaptured(src)
      stopCamera()
    }
  }, [captured, stopCamera])

  const confirm = useCallback(async () => {
    if (captured) {
      onCapture(side, captured)
    }
  }, [captured, onCapture, side])

  const retake = useCallback(() => {
    setCaptured(null)
    setError("")
    startCamera(facingMode)
  }, [facingMode, startCamera])

  const toggleFacing = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
    setTorchOn(false)
  }, [])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] } as any)
      setTorchOn(!torchOn)
    } catch { /* torch not supported */ }
  }, [torchOn])

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
        {error ? (
          <div className="text-center px-6 py-12 max-w-xs">
            <p className="text-white/80 text-sm mb-4">{error}</p>
            <Button variant="secondary" size="lg" onClick={() => startCamera(facingMode)}>
              <CameraIcon className="w-5 h-5 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : captured ? (
          <img
            src={captured}
            alt={`Carte ${label}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div className="relative w-full max-w-sm aspect-[1.586/1] border-2 border-white/50 rounded-lg" />
            </div>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] text-center">
              Placez la carte d&apos;identité dans le cadre
            </p>
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
          <Button size="lg" className="min-w-[200px]" onClick={capture} disabled={!!error}>
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M5 17v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1" />
      <path d="m16 10 2 2 4-4" />
    </svg>
  )
}
