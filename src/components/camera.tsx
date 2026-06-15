"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Camera as CameraIcon, RotateCcw, Check, X } from "lucide-react"

interface CameraProps {
  side: "front" | "back"
  onCapture: (side: "front" | "back", imageSrc: string) => void
  onClose: () => void
}

export function Camera({ side, onCapture, onClose }: CameraProps) {
  const webcamRef = useRef<Webcam>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [mirrored, setMirrored] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCaptured(imageSrc)
    }
  }, [webcamRef])

  const confirm = useCallback(() => {
    if (captured) {
      onCapture(side, captured)
    }
  }, [captured, onCapture, side])

  const retake = useCallback(() => {
    setCaptured(null)
  }, [])

  const toggleFacing = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
    setMirrored((prev) => !prev)
  }, [])

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
        <button onClick={toggleFacing} className="text-white/80 hover:text-white p-1">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
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
                screenshotQuality={0.8}
                videoConstraints={{
                  facingMode,
                  width: 1920,
                  height: 1080,
                }}
                className="w-full h-full object-cover"
                mirrored={mirrored}
              />
            </div>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div className="relative w-full max-w-sm aspect-[1.586/1]">
                <div className="absolute inset-0 border-2 border-white/70 rounded-lg" />
                <div className="absolute -inset-0.5 border-2 border-white/20 rounded-[10px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-black text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  Placez la carte ici
                </div>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-sm" />
              </div>
            </div>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center max-w-xs">
              Assurez-vous que la carte est bien éclairée et centrée dans le cadre
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
