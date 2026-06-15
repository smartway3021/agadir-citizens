"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Camera, IdCard } from "@/components/camera"
import { ArrowLeft, Check, Loader2, Camera as CameraIcon, Upload } from "lucide-react"
import Link from "next/link"

const sectors = [
  "Agadir Ville", "Anza", "Talborjt", "Charaf", "Dakhla",
  "Hay Salam", "Inezgane", "Aït Melloul", "Tiznit",
]

export default function NewForeignerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null)
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
    nationality: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = useCallback((side: "front" | "back") => {
    setShowCamera(side)
  }, [])

  const handleCameraCapture = useCallback(
    async (side: "front" | "back", imageSrc: string) => {
      if (side === "front") setFrontImage(imageSrc)
      else setBackImage(imageSrc)
      setShowCamera(null)
    },
    []
  )

  const handleFileUpload = useCallback(
    async (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.readAsDataURL(file)
      })
      if (side === "front") setFrontImage(dataUrl)
      else setBackImage(dataUrl)
    },
    []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const formPayload = new FormData()
      Object.entries(formData).forEach(([key, val]) => formPayload.append(key, val))
      if (frontImage) formPayload.append("id_front_image_url", frontImage)
      if (backImage) formPayload.append("id_back_image_url", backImage)

      const res = await fetch("/api/foreigners", { method: "POST", body: formPayload })
      if (res.ok) {
        router.push("/dashboard/foreigners")
        router.refresh()
      }
    } catch {}
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
        <Link href="/dashboard/foreigners">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Nouvel étranger</h1>
          <p className="text-muted text-xs md:text-sm mt-0.5">
            Ajouter un résident étranger dans la région
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="px-4 md:px-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 mb-3">
                Pièce d&apos;identité
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`border-2 border-dashed rounded-xl p-4 text-center ${frontImage ? "border-success bg-success/5" : "border-border"}`}>
                  {frontImage ? (
                    <div className="space-y-2">
                      <img src={frontImage} alt="Recto" className="max-h-24 mx-auto rounded-lg" />
                      <p className="text-xs text-success font-medium">Recto</p>
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3 h-3 mr-1" /> Changer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium text-sm">Recto carte</p>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-3 h-3 mr-1" /> Galerie
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleCapture("front")}>
                          <CameraIcon className="w-3 h-3 mr-1" /> Camera
                        </Button>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("front", e)} />
                </div>

                <div className={`border-2 border-dashed rounded-xl p-4 text-center ${backImage ? "border-success bg-success/5" : "border-border"}`}>
                  {backImage ? (
                    <div className="space-y-2">
                      <img src={backImage} alt="Verso" className="max-h-24 mx-auto rounded-lg" />
                      <p className="text-xs text-success font-medium">Verso</p>
                      <Button variant="ghost" size="sm" onClick={() => backFileInputRef.current?.click()}>
                        <Upload className="w-3 h-3 mr-1" /> Changer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium text-sm">Verso carte</p>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" onClick={() => backFileInputRef.current?.click()}>
                          <Upload className="w-3 h-3 mr-1" /> Galerie
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleCapture("back")}>
                          <CameraIcon className="w-3 h-3 mr-1" /> Camera
                        </Button>
                      </div>
                    </div>
                  )}
                  <input ref={backFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("back", e)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 mb-3">Identité</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Input id="last_name" label="Nom" value={formData.last_name} onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))} required />
                <Input id="first_name" label="Prénom" value={formData.first_name} onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))} required />
                <Input id="father_name" label="Nom du père" value={formData.father_name} onChange={(e) => setFormData((p) => ({ ...p, father_name: e.target.value }))} />
                <Input id="mother_name" label="Nom de la mère" value={formData.mother_name} onChange={(e) => setFormData((p) => ({ ...p, mother_name: e.target.value }))} />
                <Input id="national_id" label="CIN / Passeport" value={formData.national_id} onChange={(e) => setFormData((p) => ({ ...p, national_id: e.target.value }))} required />
                <Input id="birth_date" label="Date de naissance" type="date" value={formData.birth_date} onChange={(e) => setFormData((p) => ({ ...p, birth_date: e.target.value }))} required />
                <Select id="gender" label="Sexe" value={formData.gender} onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value as "male" | "female" }))} options={[{ value: "male", label: "Homme" }, { value: "female", label: "Femme" }]} required />
                <Input id="nationality" label="Nationalité" value={formData.nationality} onChange={(e) => setFormData((p) => ({ ...p, nationality: e.target.value }))} required placeholder="Ex: Française" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 mb-3">Contact & Profession</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Input id="phone" label="Téléphone" type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
                <Input id="profession" label="Profession" value={formData.profession} onChange={(e) => setFormData((p) => ({ ...p, profession: e.target.value }))} />
                <Select id="marital_status" label="Situation familiale" value={formData.marital_status} onChange={(e) => setFormData((p) => ({ ...p, marital_status: e.target.value as "single" | "married" | "divorced" | "widowed" }))} options={[{ value: "single", label: "Célibataire" }, { value: "married", label: "Marié(e)" }, { value: "divorced", label: "Divorcé(e)" }, { value: "widowed", label: "Veuf/Veuve" }]} />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xs md:text-sm text-muted border-b border-border pb-1.5 mb-3">Adresse</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Input id="address" label="Adresse" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} required />
                <Select id="sector" label="Secteur" value={formData.sector} onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))} options={sectors.map((s) => ({ value: s, label: s }))} required />
              </div>
            </div>

            {frontImage || backImage ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {frontImage && <div><p className="text-xs font-medium mb-1">Recto</p><img src={frontImage} alt="" className="max-h-24 rounded-lg border border-border w-full object-cover" /></div>}
                {backImage && <div><p className="text-xs font-medium mb-1">Verso</p><img src={backImage} alt="" className="max-h-24 rounded-lg border border-border w-full object-cover" /></div>}
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/dashboard/foreigners">
                <Button type="button" variant="ghost">Annuler</Button>
              </Link>
              <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : <><Check className="w-4 h-4 mr-2" /> Enregistrer l'étranger</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
