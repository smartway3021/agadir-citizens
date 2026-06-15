"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Citizen } from "@/lib/types"
import { formatDate, getAge } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { updateCitizenAction, deleteCitizenAction } from "@/app/actions"
import {
  ArrowLeft,
  Edit3,
  Save,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"

const moroccanCities = [
  "Agadir", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "El Jadida",
  "Beni Mellal", "Laâyoune", "Tiznit", "Inezgane", "Aït Melloul",
  "Taroudant", "Ouarzazate", "Dakhla",
]

interface Props {
  citizen: Citizen
}

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
            value={form[field as keyof Citizen] as string}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(field === "city" ? moroccanCities : [
              { value: "male", label: "Homme" },
              { value: "female", label: "Femme" },
            ]).map((opt) => {
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
            value={form[field as keyof Citizen] as string}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
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
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Citizen>({ ...citizen })

  async function handleSave() {
    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        formData.append(key, val.toString())
      }
    })
    await updateCitizenAction(citizen.id, formData)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Supprimer ${citizen.first_name} ${citizen.last_name} ?`)) return
    await deleteCitizenAction(citizen.id)
    router.push("/dashboard/citizens")
    router.refresh()
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
              <h3 className="font-semibold">Informations personnelles</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Nom" value={citizen.last_name} field="last_name" editing={editing} form={form} setForm={setForm} />
                <Field label="Prénom" value={citizen.first_name} field="first_name" editing={editing} form={form} setForm={setForm} />
                <Field label="CIN" value={citizen.national_id} field="national_id" editing={editing} form={form} setForm={setForm} />
                <Field
                  label="Date de naissance"
                  value={formatDate(citizen.birth_date)}
                  field="birth_date"
                  type="date"
                  editing={editing} form={form} setForm={setForm}
                />
                <Field label="Âge" value={`${getAge(citizen.birth_date)} ans`} editing={false} form={form} setForm={setForm} />
                <Field
                  label="Sexe"
                  value={citizen.gender === "male" ? "Homme" : "Femme"}
                  field="gender"
                  editing={editing} form={form} setForm={setForm}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Adresse</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Field label="Adresse" value={citizen.address} field="address" editing={editing} form={form} setForm={setForm} />
                </div>
                <Field label="Ville" value={citizen.city} field="city" editing={editing} form={form} setForm={setForm} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Pièces d&apos;identité</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {citizen.id_front_image_url ? (
                <div>
                  <p className="text-sm text-muted mb-1">Recto</p>
                  <img
                    src={citizen.id_front_image_url}
                    alt="Recto CIN"
                    className="w-full rounded-lg border"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted">Aucun recto</p>
              )}
              {citizen.id_back_image_url ? (
                <div>
                  <p className="text-sm text-muted mb-1">Verso</p>
                  <img
                    src={citizen.id_back_image_url}
                    alt="Verso CIN"
                    className="w-full rounded-lg border"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted">Aucun verso</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Métadonnées</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted">Créé le</p>
                <p className="text-sm font-medium">
                  {formatDate(citizen.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Dernière modification</p>
                <p className="text-sm font-medium">
                  {formatDate(citizen.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
