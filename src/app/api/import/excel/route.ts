import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 })
    }

    const buf = new Uint8Array(await file.arrayBuffer())
    const wb = XLSX.read(buf, { type: "array" })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
    const supabase = createAdminClient()

    let imported = 0
    for (const row of rows) {
      const payload: Record<string, unknown> = {
        last_name: row["Nom"] || "",
        first_name: row["Prénom"] || "",
        father_name: row["Nom du père"] || "",
        mother_name: row["Nom de la mère"] || "",
        national_id: row["CIN"] || "",
        birth_date: row["Date de naissance"] || "",
        phone: row["Téléphone"] || "",
        profession: row["Profession"] || "",
        marital_status: row["Situation familiale"] || "single",
        nationality: row["Nationalité"] || "Marocaine",
        address: row["Adresse"] || "",
        sector: row["Secteur"] || "",
        gender: row["Sexe"] === "Femme" ? "female" : "male",
      }

      const { error } = await supabase.from("citizens").insert(payload)
      if (!error) imported++
    }

    return NextResponse.json({ count: imported })
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'import" }, { status: 500 })
  }
}
