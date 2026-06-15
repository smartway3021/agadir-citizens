"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function deleteCitizenAction(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("citizens").delete().eq("id", id)
  if (error) throw new Error("Erreur lors de la suppression")
  revalidatePath("/dashboard/citizens")
}

export async function createCitizenAction(formData: FormData) {
  const supabase = createAdminClient()

  const citizen = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    national_id: formData.get("national_id") as string,
    birth_date: formData.get("birth_date") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    gender: formData.get("gender") as "male" | "female",
    id_front_image_url: formData.get("id_front_image_url") as string | null,
    id_back_image_url: formData.get("id_back_image_url") as string | null,
  }

  const { error } = await supabase.from("citizens").insert(citizen)
  if (error) throw new Error("Erreur lors de la création")
  revalidatePath("/dashboard/citizens")
}

export async function updateCitizenAction(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const updates: Record<string, string | null> = {}
  const fields = [
    "first_name", "last_name", "national_id", "birth_date",
    "address", "city", "gender", "id_front_image_url", "id_back_image_url"
  ]

  for (const field of fields) {
    const val = formData.get(field)
    if (val) updates[field] = val as string
  }

  updates.updated_at = new Date().toISOString()

  const { error } = await supabase.from("citizens").update(updates).eq("id", id)
  if (error) throw new Error("Erreur lors de la mise à jour")
  revalidatePath(`/dashboard/citizens/${id}`)
  revalidatePath("/dashboard/citizens")
}
