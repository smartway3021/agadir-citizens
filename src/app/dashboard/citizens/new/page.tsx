"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Camera, IdCard } from "@/components/camera"
import { createClient } from "@/lib/supabase/client"
import { runOcr } from "@/lib/ocr"
import {
  ArrowLeft,
  Camera as CameraIcon,
  Upload,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const sectors = [
  "Agadir Ville", "Anza", "Talborjt", "Charaf", "Dakhla",
  "Hay Salam", "Inezgane", "Aït Melloul", "Tiznit",
]

export default function NewCitizenPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<"scan" | "form">("scan")
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    national_id: "",
    birth_date: "",
    address: "",
    sector: "",
    gender: "male" as "male" | "female",
    phone: "",
    profession: "",
    marital_status: "single" as "single" | "married" | "divorced" | "widowed",
    nationality: "Marocaine",
  })
  const [mode, setMode] = useState<"gallery" | "camera">("gallery")
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)

  async function autoOcr(image: string) {
    setOcrLoading(true)
    try {
      const data = await runOcr(image)
      setFormData((prev) => ({
        ...prev,
        first_name: data.first_name || prev.first_name,
        last_name: data.last_name || prev.last_name,
        father_name: data.father_name || prev.father_name,
        mother_name: data.mother_name || prev.mother_name,
        national_id: data.national_id || prev.national_id,
        birth_date: data.birth_date || prev.birth_date,
        address: data.address || prev.address,
        gender: data.gender || prev.gender,
      }))
    } catch {}
    setOcrLoading(false)
  }

  const handleCapture = useCallback((side: "front" | "back") => {
    setShowCamera(side)
  }, [])

  const handleCameraCapture = useCallback(
    async (side: "front" | "back", imageSrc: string) => {
      const res = await fetch(imageSrc)
      const blob = await res.blob()
      const file = new File([blob], `card-${side}-${Date.now()}.jpg`, { type: "image/jpeg" })
      const previewUrl = URL.createObjectURL(file)

      if (side === "front") {
        setFrontFile(file)
        setFrontImage(previewUrl)
        setShowCamera(null)
        await autoOcr(imageSrc)
        setStep("form")
      } else {
        setBackFile(file)
        setBackImage(previewUrl)
        setShowCamera(null)
      }
    },
    []
  )

  const handleFileUpload = useCallback(
    async (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const previewUrl = URL.createObjectURL(file)

      if (side === "front") {
        setFrontFile(file)
        setFrontImage(previewUrl)
        const reader = new FileReader()
        reader.onload = async (ev) => {
          const dataUrl = ev.target?.result as string
          await autoOcr(dataUrl)
          setStep("form")
        }
        reader.readAsDataURL(file)
      } else {
        setBackFile(file)
        setBackImage(previewUrl)
      }
    },
    []
  )

  async function uploadImage(file: File, path: string): Promise<string> {
    const { data } = await supabase.storage
      .from("citizen-images")
      .upload(path, file)
    if (data) {
      const { data: urlData } = supabase.storage
        .from("citizen-images")
        .getPublicUrl(data.path)
      return urlData.publicUrl
    }
    return ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let frontUrl = ""
      let backUrl = ""

      if (frontFile) {
        frontUrl = await uploadImage(frontFile, `front-${Date.now()}`)
      }
      if (backFile) {
        backUrl = await uploadImage(backFile, `back-${Date.now()}`)
      }

      const formPayload = new FormData()
      Object.entries(formData).forEach(([key, val]) => {
        formPayload.append(key, val)
      })
      if (frontUrl) formPayload.append("id_front_image_url", frontUrl)
      if (backUrl) formPayload.append("id_back_image_url", backUrl)

      const res = await fetch("/api/citizens", {
        method: "POST",
        body: formPayload,
      })

      if (res.ok) {
        router.push("/dashboard/citizens")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (showCamera) {
    return (
      <Camera
        side={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(null)}
      />
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto px-4 md:px-0">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/dashboard/citizens">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Nouveau habitant</h1>
          <p className="text-muted text-xs md:text-sm mt-0.5">
            Scannez la carte d&apos;identité pour remplissage automatique
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 md:px-6">
          <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm overflow-x-auto">
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step === "scan" ? "bg-primary text-white" : "bg-success text-white"}`}>
                {step === "scan" ? "1" : <Check className="w-3 h-3 md:w-4 md:h-4" />}
              </div>
              <span className="font-medium text-xs md:text-sm">Scan</span>
            </div>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-muted shrink-0" />
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step === "form" ? "bg-primary text-white" : "bg-muted/20 text-muted"}`}>
                {step === "form" ? (ocrLoading ? "..." : <Check className="w-3 h-3 md:w-4 md:h-4" />) : "2"}
              </div>
              <span className="font-medium text-xs md:text-sm">Formulaire</span>
            </div>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-muted shrink-0" />
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step === "form" && !ocrLoading ? "bg-primary text-white" : "bg-muted/20 text-muted"}`}>
                3
              </div>
              <span className="font-medium text-xs md:text-sm">Sauvegarde</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {step === "scan" && (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-hover rounded-xl p-3 md:p-4">
                <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">Mode de capture</p>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <button
                    onClick={() => setMode("gallery")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-medium border-2 transition-all ${
                      mode === "gallery"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    Galerie
                  </button>
                  <button
                    onClick={() => setMode("camera")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm font-medium border-2 transition-all ${
                      mode === "camera"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    <CameraIcon className="w-5 h-5" />
                    Appareil photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center transition-colors ${frontImage ? "border-success bg-success/5" : "border-border"}`}
                >
                  {frontImage ? (
                    <div className="space-y-3">
                      <img src={frontImage} alt="Recto" className="max-h-28 md:max-h-36 mx-auto rounded-lg" />
                      <p className="text-xs md:text-sm text-success font-medium">Recto scanné</p>
                      <div className="flex gap-2 justify-center">
                        {mode === "gallery" ? (
                          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-3 h-3 mr-1" /> Changer
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleCapture("front")}>
                            <CameraIcon className="w-3 h-3 mr-1" /> Reprendre
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4 md:py-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      </div>
                      <p className="font-medium text-sm md:text-base">Recto carte d&apos;identité</p>
                      <p className="text-xs text-muted">(NOM, PRÉNOM, PÈRE, MÈRE, CIN, date, sexe, lieu)</p>
                      {mode === "gallery" ? (
                        <Button onClick={() => fileInputRef.current?.click()} size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          Choisir dans la galerie
                        </Button>
                      ) : (
                        <Button onClick={() => handleCapture("front")} size="sm">
                          <CameraIcon className="w-4 h-4 mr-1" />
                          Prendre en photo
                        </Button>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("front", e)} />
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center transition-colors ${backImage ? "border-success bg-success/5" : "border-border"}`}
                >
                  {backImage ? (
                    <div className="space-y-3">
                      <img src={backImage} alt="Verso" className="max-h-28 md:max-h-36 mx-auto rounded-lg" />
                      <p className="text-xs md:text-sm text-success font-medium">Verso scanné</p>
                      <div className="flex gap-2 justify-center">
                        {mode === "gallery" ? (
                          <Button variant="ghost" size="sm" onClick={() => backFileInputRef.current?.click()}>
                            <Upload className="w-3 h-3 mr-1" /> Changer
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleCapture("back")}>
                            <CameraIcon className="w-3 h-3 mr-1" /> Reprendre
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4 md:py-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      </div>
                      <p className="font-medium text-sm md:text-base">Verso carte d&apos;identité</p>
                      <p className="text-xs text-muted">(Adresse)</p>
                      {mode === "gallery" ? (
                        <Button onClick={() => backFileInputRef.current?.click()} size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          Choisir dans la galerie
                        </Button>
                      ) : (
                        <Button onClick={() => handleCapture("back")} size="sm">
                          <CameraIcon className="w-4 h-4 mr-1" />
                          Prendre en photo
                        </Button>
                      )}
                    </div>
                  )}
                  <input ref={backFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("back", e)} />
                </div>
              </div>

              {(frontImage || backImage) && (
                <div className="text-center">
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => setStep("form")}>
                    <Check className="w-5 h-5 mr-2" />
                    Continuer vers le formulaire
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {ocrLoading && (
                <div className="flex items-center gap-3 bg-primary/10 rounded-lg px-4 py-3 text-sm text-primary">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  Extraction OCR en cours... (téléchargement Tesseract.js)
                </div>
              )}

              <div>
                <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 md:pb-2 mb-3 md:mb-4">
                  Identité
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Input id="last_name" label="Nom" value={formData.last_name} onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))} required />
                  <Input id="first_name" label="Prénom" value={formData.first_name} onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))} required />
                  <Input id="father_name" label="Nom du père" value={formData.father_name} onChange={(e) => setFormData((p) => ({ ...p, father_name: e.target.value }))} />
                  <Input id="mother_name" label="Nom de la mère" value={formData.mother_name} onChange={(e) => setFormData((p) => ({ ...p, mother_name: e.target.value }))} />
                  <Input id="national_id" label="CIN" value={formData.national_id} onChange={(e) => setFormData((p) => ({ ...p, national_id: e.target.value }))} required />
                  <Input id="birth_date" label="Date de naissance" type="date" value={formData.birth_date} onChange={(e) => setFormData((p) => ({ ...p, birth_date: e.target.value }))} required />
                  <Select id="gender" label="Sexe" value={formData.gender} onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value as "male" | "female" }))} options={[{ value: "male", label: "Homme" }, { value: "female", label: "Femme" }]} required />
                  <Input id="nationality" label="Nationalité" value={formData.nationality} onChange={(e) => setFormData((p) => ({ ...p, nationality: e.target.value }))} />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 md:pb-2 mb-3 md:mb-4">
                  Contact & Profession
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Input id="phone" label="Téléphone" type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
                  <Input id="profession" label="Profession" value={formData.profession} onChange={(e) => setFormData((p) => ({ ...p, profession: e.target.value }))} />
                  <Select id="marital_status" label="Situation familiale" value={formData.marital_status} onChange={(e) => setFormData((p) => ({ ...p, marital_status: e.target.value as "single" | "married" | "divorced" | "widowed" }))} options={[{ value: "single", label: "Célibataire" }, { value: "married", label: "Marié(e)" }, { value: "divorced", label: "Divorcé(e)" }, { value: "widowed", label: "Veuf/Veuve" }]} />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 md:pb-2 mb-3 md:mb-4">
                  Adresse
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Input id="address" label="Adresse" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} required />
                  <Select id="sector" label="Secteur" value={formData.sector} onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))} options={sectors.map((s) => ({ value: s, label: s }))} required />
                </div>
              </div>

              {(frontImage || backImage) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-2">
                  {frontImage && (
                    <div>
                      <p className="text-xs md:text-sm font-medium text-foreground mb-1">Recto</p>
                      <img src={frontImage} alt="Recto" className="max-h-24 md:max-h-32 rounded-lg border border-border w-full object-cover" />
                    </div>
                  )}
                  {backImage && (
                    <div>
                      <p className="text-xs md:text-sm font-medium text-foreground mb-1">Verso</p>
                      <img src={backImage} alt="Verso" className="max-h-24 md:max-h-32 rounded-lg border border-border w-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
                <Button type="button" variant="ghost" onClick={() => setStep("scan")}>
                  Modifier les scans
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer l'habitant"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
