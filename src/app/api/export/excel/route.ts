import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const supabase = createAdminClient()

    let query = supabase
      .from("citizens")
      .select("*")
      .order("created_at", { ascending: false })

    const city = searchParams.get("city")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    if (city) query = query.eq("city", city)
    if (startDate) query = query.gte("created_at", startDate)
    if (endDate) query = query.lte("created_at", endDate)

    const { data, error } = await query

    if (error) throw error

    const rows = (data || []).map((c: Record<string, unknown>) => ({
      "Nom": c.last_name,
      "Prénom": c.first_name,
      "CIN": c.national_id,
      "Date de naissance": c.birth_date,
      "Adresse": c.address,
      "Ville": c.city,
      "Sexe": c.gender === "male" ? "Homme" : "Femme",
      "Date d'ajout": c.created_at,
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)

    ws["!cols"] = [
      { wch: 20 }, { wch: 20 }, { wch: 15 },
      { wch: 18 }, { wch: 40 }, { wch: 15 },
      { wch: 10 }, { wch: 20 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, "Habitants")

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    const filename = `habitants_${new Date().toISOString().split("T")[0]}.xlsx`

    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    )
  }
}
