"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Camera, IdCard } from "@/components/camera"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Camera as CameraIcon,
  Upload,
  Scan,
  Check,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

const sectors = [
  "Agadir Ville", "Anza", "Talborjt", "Charaf", "Dakhla",
  "Hay Salam", "Inezgane", "Aït Melloul", "Tiznit",
]

export default function NewCitizenPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<"scan" | "preview" | "form">("scan")
  const [loading, setLoading] = useState(false)
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
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = useCallback((side: "front" | "back") => {
    setShowCamera(side)
  }, [])

  const handleCameraCapture = useCallback(
    (side: "front" | "back", imageSrc: string) => {
      if (side === "front") {
        setFrontImage(imageSrc)
      } else {
        setBackImage(imageSrc)
      }
      setShowCamera(null)
    },
    []
  )

  const handleFileUpload = useCallback(
    (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (side === "front") {
        setFrontFile(file)
        setFrontImage(URL.createObjectURL(file))
      } else {
        setBackFile(file)
        setBackImage(URL.createObjectURL(file))
      }
    },
    []
  )

  async function handleOcrExtract() {
    setLoading(true)
    try {
      const imageData = frontImage || backImage
      if (!imageData) {
        setLoading(false)
        return
      }

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({
          ...prev,
          ...data,
        }))
        setStep("form")
      } else {
        setStep("form")
      }
    } catch {
      setStep("form")
    }
    setLoading(false)
  }

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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/citizens">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouveau habitant</h1>
          <p className="text-muted text-sm mt-1">
            Scannez la carte d&apos;identité ou saisissez les données
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "scan" ? "bg-primary text-white" : "bg-success text-white"}`}>
                {step === "scan" ? "1" : <Check className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium">Scan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "preview" ? "bg-primary text-white" : step === "form" ? "bg-success text-white" : "bg-gray-200 text-gray-400"}`}>
                {step === "preview" || step === "form" ? (step === "form" ? <Check className="w-4 h-4" /> : "2") : "2"}
              </div>
              <span className="text-sm font-medium">Vérification</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "form" ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
                3
              </div>
              <span className="text-sm font-medium">Sauvegarde</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === "scan" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${frontImage ? "border-success bg-success/5" : "border-border hover:border-primary"}`}
                >
                  {frontImage ? (
                    <div className="space-y-3">
                      <img
                        src={frontImage}
                        alt="Recto"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-success font-medium">
                        Recto scanné
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCapture("front")}
                        >
                          <CameraIcon className="w-4 h-4 mr-1" />
                          Reprendre
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Changer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium">Recto carte d&apos;identité</p>
                      <p className="text-sm text-muted">
                        Prenez une photo ou importez
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => handleCapture("front")} size="sm">
                          <CameraIcon className="w-4 h-4 mr-1" />
                          Scanner
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Importer
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload("front", e)}
                  />
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${backImage ? "border-success bg-success/5" : "border-border hover:border-primary"}`}
                >
                  {backImage ? (
                    <div className="space-y-3">
                      <img
                        src={backImage}
                        alt="Verso"
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-success font-medium">
                        Verso scanné
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCapture("back")}
                        >
                          <CameraIcon className="w-4 h-4 mr-1" />
                          Reprendre
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => backFileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Changer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium">Verso carte d&apos;identité</p>
                      <p className="text-sm text-muted">
                        Prenez une photo ou importez
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => handleCapture("back")} size="sm">
                          <CameraIcon className="w-4 h-4 mr-1" />
                          Scanner
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => backFileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Importer
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={backFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload("back", e)}
                  />
                </div>
              </div>

              {(frontImage || backImage) && (
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      setStep("form")
                      handleOcrExtract()
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      "Extraction en cours..."
                    ) : (
                      <>
                        <Scan className="w-5 h-5 mr-2" />
                        Extraire les données (OCR)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-sm text-muted border-b border-border pb-2">
                Identité
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="last_name"
                  label="Nom"
                  value={formData.last_name}
                  onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                  required
                />
                <Input
                  id="first_name"
                  label="Prénom"
                  value={formData.first_name}
                  onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                  required
                />
                <Input
                  id="father_name"
                  label="Nom du père"
                  value={formData.father_name}
                  onChange={(e) => setFormData((p) => ({ ...p, father_name: e.target.value }))}
                />
                <Input
                  id="mother_name"
                  label="Nom de la mère"
                  value={formData.mother_name}
                  onChange={(e) => setFormData((p) => ({ ...p, mother_name: e.target.value }))}
                />
                <Input
                  id="national_id"
                  label="CIN"
                  value={formData.national_id}
                  onChange={(e) => setFormData((p) => ({ ...p, national_id: e.target.value }))}
                  required
                />
                <Input
                  id="birth_date"
                  label="Date de naissance"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData((p) => ({ ...p, birth_date: e.target.value }))}
                  required
                />
                <Select
                  id="gender"
                  label="Sexe"
                  value={formData.gender}
                  onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value as "male" | "female" }))}
                  options={[
                    { value: "male", label: "Homme" },
                    { value: "female", label: "Femme" },
                  ]}
                  required
                />
                <Input
                  id="nationality"
                  label="Nationalité"
                  value={formData.nationality}
                  onChange={(e) => setFormData((p) => ({ ...p, nationality: e.target.value }))}
                />
              </div>

              <h3 className="font-semibold text-sm text-muted border-b border-border pb-2 pt-2">
                Contact & Profession
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="phone"
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
                <Input
                  id="profession"
                  label="Profession"
                  value={formData.profession}
                  onChange={(e) => setFormData((p) => ({ ...p, profession: e.target.value }))}
                />
                <Select
                  id="marital_status"
                  label="Situation familiale"
                  value={formData.marital_status}
                  onChange={(e) => setFormData((p) => ({ ...p, marital_status: e.target.value as "single" | "married" | "divorced" | "widowed" }))}
                  options={[
                    { value: "single", label: "Célibataire" },
                    { value: "married", label: "Marié(e)" },
                    { value: "divorced", label: "Divorcé(e)" },
                    { value: "widowed", label: "Veuf/Veuve" },
                  ]}
                />
              </div>

              <h3 className="font-semibold text-sm text-muted border-b border-border pb-2 pt-2">
                Adresse
              </h3>
              <Input
                id="address"
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                required
              />
              <Select
                id="sector"
                label="Secteur"
                value={formData.sector}
                onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))}
                options={sectors.map((s) => ({ value: s, label: s }))}
                required
              />

              {(frontImage || backImage) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {frontImage && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recto</p>
                      <img src={frontImage} alt="Recto" className="max-h-32 rounded-lg border" />
                    </div>
                  )}
                  {backImage && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verso</p>
                      <img src={backImage} alt="Verso" className="max-h-32 rounded-lg border" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
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
