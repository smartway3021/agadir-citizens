"use client"

import { useRef, useCallback, useState } from "react"
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
  }, [])

  const label = side === "front" ? "Recto" : "Verso"

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium">
          Scanner {label} - Carte d&apos;identité
        </h2>
        <button onClick={toggleFacing} className="text-white">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {captured ? (
          <img
            src={captured}
            alt={`Carte ${label}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8}
            videoConstraints={{
              facingMode,
              width: 1280,
              height: 720,
            }}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 border-2 border-dashed border-white/40 m-12 rounded-xl pointer-events-none" />
      </div>

      <div className="flex items-center justify-center gap-6 p-6 bg-black/80">
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
          <Button size="lg" onClick={capture}>
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
