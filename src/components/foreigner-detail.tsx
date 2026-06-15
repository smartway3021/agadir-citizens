"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Foreigner } from "@/lib/types"
import { formatDate, getAge } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateForeignerAction, deleteForeignerAction } from "@/app/actions"
import { Camera } from "@/components/camera"
import {
  ArrowLeft, Edit3, Save, Trash2, X, MapPin,
  Phone, Briefcase, Users, Globe,
  Camera as CameraIcon, Upload,
} from "lucide-react"
import Link from "next/link"

const sectors = [
  "Agadir Ville", "Anza", "Talborjt", "Charaf", "Dakhla",
  "Hay Salam", "Inezgane", "Aït Melloul", "Tiznit",
]

function Field({
  label, value, field, type = "text", editing, form, setForm,
}: {
  label: string; value: string; field?: string; type?: string
  editing: boolean; form: Foreigner; setForm: (p: Foreigner) => void
}) {
  return (
    <div>
      <p className="text-sm text-muted mb-1">{label}</p>
      {editing && field ? (
        type === "select" ? (
          <select
            value={(form[field as keyof Foreigner] as string) || ""}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {(field === "sector" ? sectors : field === "marital_status"
              ? [{ value: "single", label: "Célibataire" }, { value: "married", label: "Marié(e)" }, { value: "divorced", label: "Divorcé(e)" }, { value: "widowed", label: "Veuf/Veuve" }]
              : [{ value: "male", label: "Homme" }, { value: "female", label: "Femme" }]
            ).map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value
              const lbl = typeof opt === "string" ? opt : opt.label
              return <option key={val} value={val}>{lbl}</option>
            })}
          </select>
        ) : (
          <input
            type={type}
            value={(form[field as keyof Foreigner] as string) || ""}
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

export function ForeignerDetail({ foreigner }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Foreigner>({ ...foreigner })
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null)
  const frontFileRef = useRef<HTMLInputElement>(null)
  const backFileRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== undefined) formData.append(key, val.toString())
    })
    formData.set("id_front_image_url", form.id_front_image_url || "")
    formData.set("id_back_image_url", form.id_back_image_url || "")
    await updateForeignerAction(foreigner.id, formData)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Supprimer ${foreigner.first_name} ${foreigner.last_name} ?`)) return
    await deleteForeignerAction(foreigner.id)
    router.push("/dashboard/foreigners")
    router.refresh()
  }

  const handleCameraCapture = async (side: "front" | "back", imageSrc: string) => {
    if (side === "front") setForm((p) => ({ ...p, id_front_image_url: imageSrc }))
    else setForm((p) => ({ ...p, id_back_image_url: imageSrc }))
    setShowCamera(null)
  }

  const handleFileUpload = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (side === "front") setForm((p) => ({ ...p, id_front_image_url: dataUrl }))
      else setForm((p) => ({ ...p, id_back_image_url: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const editProps = { editing, form, setForm }
  const genderLabel = foreigner.gender === "male" ? "Homme" : "Femme"

  if (showCamera) {
    return (
      <Camera side={showCamera} onCapture={handleCameraCapture} onClose={() => setShowCamera(null)} />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/foreigners">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold">{foreigner.first_name} {foreigner.last_name}</h1>
              <Badge className={foreigner.gender === "male" ? "bg-blue-600 text-white border-blue-700" : "bg-pink-500 text-white border-pink-600"}>
                {foreigner.gender === "male" ? "Masculin" : "Féminin"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-2 mt-0.5">
              <span>CIN: {foreigner.national_id}</span>
              <span className="w-1 h-1 bg-muted rounded-full" />
              <span>Secteur: {foreigner.sector}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="success" onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Enregistrer</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-1" /> Annuler</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditing(true)}><Edit3 className="w-4 h-4 mr-1" /> Modifier</Button>
              <Button variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-1" /> Supprimer</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-accent rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identité</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <Field label="Nom" value={foreigner.last_name} field="last_name" {...editProps} />
                <Field label="Prénom" value={foreigner.first_name} field="first_name" {...editProps} />
                <Field label="Nom du père" value={foreigner.father_name} field="father_name" {...editProps} />
                <Field label="Nom de la mère" value={foreigner.mother_name} field="mother_name" {...editProps} />
                <Field label="CIN / Passeport" value={foreigner.national_id} field="national_id" {...editProps} />
                <Field label="Date naissance" value={formatDate(foreigner.birth_date)} field="birth_date" type="date" {...editProps} />
                <Field label="Âge" value={`${getAge(foreigner.birth_date)} ans`} editing={false} form={form} setForm={setForm} />
                <Field label="Sexe" value={genderLabel} field="gender" {...editProps} />
                <Field label="Nationalité" value={foreigner.nationality} field="nationality" {...editProps} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-accent rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact & Profession</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <Field label="Téléphone" value={foreigner.phone} field="phone" {...editProps} />
                <Field label="Profession" value={foreigner.profession} field="profession" {...editProps} />
                <Field label="Situation familiale" value={{
                  single: "Célibataire", married: "Marié(e)", divorced: "Divorcé(e)", widowed: "Veuf/Veuve",
                }[foreigner.marital_status] || foreigner.marital_status} field="marital_status" {...editProps} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Adresse</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                <Field label="Adresse" value={foreigner.address} field="address" {...editProps} />
                <Field label="Secteur" value={foreigner.sector} field="sector" {...editProps} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-accent rounded-full" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pièces d&apos;identité</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted mb-1">Recto</p>
                {form.id_front_image_url ? (
                  <img src={form.id_front_image_url} alt="Recto" className="w-full rounded-lg border" />
                ) : (
                  <p className="text-sm text-muted">Aucun recto</p>
                )}
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCamera("front")}><CameraIcon className="w-4 h-4 mr-1" /> Scanner</Button>
                    <Button variant="ghost" size="sm" onClick={() => frontFileRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Importer</Button>
                  </div>
                )}
                <input ref={frontFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("front", e)} />
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Verso</p>
                {form.id_back_image_url ? (
                  <img src={form.id_back_image_url} alt="Verso" className="w-full rounded-lg border" />
                ) : (
                  <p className="text-sm text-muted">Aucun verso</p>
                )}
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCamera("back")}><CameraIcon className="w-4 h-4 mr-1" /> Scanner</Button>
                    <Button variant="ghost" size="sm" onClick={() => backFileRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Importer</Button>
                  </div>
                )}
                <input ref={backFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("back", e)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Résumé</h3></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted" />
                <span className="text-sm">{foreigner.nationality || "-"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted" />
                <span className="text-sm">{foreigner.phone || "Aucun téléphone"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted" />
                <span className="text-sm">{foreigner.profession || "Aucune profession"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted" />
                <span className="text-sm">{foreigner.father_name ? `Fils de ${foreigner.father_name}` : "-"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Métadonnées</h3></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted">Créé le</p>
                <p className="text-sm font-medium">{formatDate(foreigner.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Modifié le</p>
                <p className="text-sm font-medium">{formatDate(foreigner.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface Props {
  foreigner: Foreigner
}
