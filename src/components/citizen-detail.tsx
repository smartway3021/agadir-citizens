"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Citizen } from "@/lib/types"
import { formatDate, getAge } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { updateCitizenAction, deleteCitizenAction } from "@/app/actions"
import { CitizenMap } from "@/components/map"
import { Camera } from "@/components/camera"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Edit3,
  Save,
  Trash2,
  X,
  MapPin,
  Phone,
  Briefcase,
  Users,
  Globe,
  Camera as CameraIcon,
  Upload,
} from "lucide-react"
import Link from "next/link"

const sectors = [
  "Agadir Ville", "Anza", "Talborjt", "Charaf", "Dakhla",
  "Hay Salam", "Inezgane", "Aït Melloul", "Tiznit",
]

function Field({
  label,
  value,
  field,
  type = "text",
  editing,
  form,
  setForm,
}: {
  label: string
  value: string
  field?: string
  type?: string
  editing: boolean
  form: Citizen
  setForm: (p: Citizen) => void
}) {
  return (
    <div>
      <p className="text-sm text-muted mb-1">{label}</p>
      {editing && field ? (
        type === "select" ? (
          <select
            value={(form[field as keyof Citizen] as string) || ""}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {(field === "sector" ? sectors : field === "marital_status"
              ? [{ value: "single", label: "Célibataire" }, { value: "married", label: "Marié(e)" }, { value: "divorced", label: "Divorcé(e)" }, { value: "widowed", label: "Veuf/Veuve" }]
              : [{ value: "male", label: "Homme" }, { value: "female", label: "Femme" }]
            ).map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value
              const lbl = typeof opt === "string" ? opt : opt.label
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              )
            })}
          </select>
        ) : (
          <input
            type={type}
            value={(form[field as keyof Citizen] as string) || ""}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )
      ) : (
        <p className="font-medium">{value || "-"}</p>
      )}
    </div>
  )
}

export function CitizenDetail({ citizen }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Citizen>({ ...citizen })
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const frontFileRef = useRef<HTMLInputElement>(null)
  const backFileRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    let frontUrl = form.id_front_image_url || ""
    let backUrl = form.id_back_image_url || ""

    if (frontFile) {
      const { data } = await supabase.storage
        .from("citizen-images")
        .upload(`front-${Date.now()}`, frontFile)
      if (data) {
        const { data: urlData } = supabase.storage
          .from("citizen-images")
          .getPublicUrl(data.path)
        frontUrl = urlData.publicUrl
      }
    }
    if (backFile) {
      const { data } = await supabase.storage
        .from("citizen-images")
        .upload(`back-${Date.now()}`, backFile)
      if (data) {
        const { data: urlData } = supabase.storage
          .from("citizen-images")
          .getPublicUrl(data.path)
        backUrl = urlData.publicUrl
      }
    }

    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        formData.append(key, val.toString())
      }
    })
    formData.set("id_front_image_url", frontUrl)
    formData.set("id_back_image_url", backUrl)
    await updateCitizenAction(citizen.id, formData)
    setEditing(false)
    setFrontFile(null)
    setBackFile(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Supprimer ${citizen.first_name} ${citizen.last_name} ?`)) return
    await deleteCitizenAction(citizen.id)
    router.push("/dashboard/citizens")
    router.refresh()
  }

  const handleCameraCapture = async (side: "front" | "back", imageSrc: string) => {
    const res = await fetch(imageSrc)
    const blob = await res.blob()
    const file = new File([blob], `card-${side}-${Date.now()}.jpg`, { type: "image/jpeg" })
    const previewUrl = URL.createObjectURL(file)
    if (side === "front") {
      setFrontFile(file)
      setForm((prev) => ({ ...prev, id_front_image_url: previewUrl }))
    } else {
      setBackFile(file)
      setForm((prev) => ({ ...prev, id_back_image_url: previewUrl }))
    }
    setShowCamera(null)
  }

  const handleFileUpload = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (side === "front") {
      setFrontFile(file)
      setForm((prev) => ({ ...prev, id_front_image_url: url }))
    } else {
      setBackFile(file)
      setForm((prev) => ({ ...prev, id_back_image_url: url }))
    }
  }

  const editProps = { editing, form, setForm }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/citizens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {citizen.first_name} {citizen.last_name}
            </h1>
            <p className="text-muted text-sm">
              CIN: {citizen.national_id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="success" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                Enregistrer
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                <X className="w-4 h-4 mr-1" />
                Annuler
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditing(true)}>
                <Edit3 className="w-4 h-4 mr-1" />
                Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Identité</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Nom" value={citizen.last_name} field="last_name" {...editProps} />
                <Field label="Prénom" value={citizen.first_name} field="first_name" {...editProps} />
                <Field label="Nom du père" value={citizen.father_name} field="father_name" {...editProps} />
                <Field label="Nom de la mère" value={citizen.mother_name} field="mother_name" {...editProps} />
                <Field label="CIN" value={citizen.national_id} field="national_id" {...editProps} />
                <Field label="Date de naissance" value={formatDate(citizen.birth_date)} field="birth_date" type="date" {...editProps} />
                <Field label="Âge" value={`${getAge(citizen.birth_date)} ans`} editing={false} form={form} setForm={setForm} />
                <Field label="Sexe" value={citizen.gender === "male" ? "Homme" : "Femme"} field="gender" {...editProps} />
                <Field label="Nationalité" value={citizen.nationality} field="nationality" {...editProps} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Contact & Profession</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Téléphone" value={citizen.phone} field="phone" {...editProps} />
                <Field label="Profession" value={citizen.profession} field="profession" {...editProps} />
                <Field label="Situation familiale" value={{
                  single: "Célibataire", married: "Marié(e)", divorced: "Divorcé(e)", widowed: "Veuf/Veuve",
                }[citizen.marital_status] || citizen.marital_status} field="marital_status" {...editProps} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Localisation
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Field label="Adresse" value={citizen.address} field="address" {...editProps} />
                </div>
                <Field label="Secteur" value={citizen.sector} field="sector" {...editProps} />
              </div>
              <CitizenMap address={citizen.address} sector={citizen.sector} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Pièces d&apos;identité</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted mb-1">Recto</p>
                {form.id_front_image_url ? (
                  <img
                    src={form.id_front_image_url}
                    alt="Recto CIN"
                    className="w-full rounded-lg border"
                  />
                ) : (
                  <p className="text-sm text-muted">Aucun recto</p>
                )}
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCamera("front")}>
                      <CameraIcon className="w-4 h-4 mr-1" />
                      Scanner
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => frontFileRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-1" />
                      Importer
                    </Button>
                  </div>
                )}
                <input ref={frontFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("front", e)} />
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Verso</p>
                {form.id_back_image_url ? (
                  <img
                    src={form.id_back_image_url}
                    alt="Verso CIN"
                    className="w-full rounded-lg border"
                  />
                ) : (
                  <p className="text-sm text-muted">Aucun verso</p>
                )}
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCamera("back")}>
                      <CameraIcon className="w-4 h-4 mr-1" />
                      Scanner
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => backFileRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-1" />
                      Importer
                    </Button>
                  </div>
                )}
                <input ref={backFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("back", e)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Résumé</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted" />
                <span className="text-sm">{citizen.phone || "Aucun téléphone"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted" />
                <span className="text-sm">{citizen.profession || "Aucune profession"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted" />
                <span className="text-sm">{citizen.father_name ? `Fils de ${citizen.father_name}` : "-"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted" />
                <span className="text-sm">{citizen.nationality || "Marocaine"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Métadonnées</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted">Créé le</p>
                <p className="text-sm font-medium">{formatDate(citizen.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Dernière modification</p>
                <p className="text-sm font-medium">{formatDate(citizen.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface Props {
  citizen: Citizen
}
