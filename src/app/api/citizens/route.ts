import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const supabase = createAdminClient()

    let query = supabase
      .from("citizens")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    const search = searchParams.get("search")
    const sector = searchParams.get("sector")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,national_id.ilike.%${search}%`
      )
    }

    if (sector) query = query.eq("sector", sector)
    if (startDate) query = query.gte("created_at", startDate)
    if (endDate) query = query.lte("created_at", endDate)

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({ citizens: data, total: count })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const supabase = createAdminClient()

    const citizen = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      national_id: formData.get("national_id") as string,
      birth_date: formData.get("birth_date") as string,
      address: formData.get("address") as string,
      sector: formData.get("sector") as string,
      gender: formData.get("gender") as "male" | "female",
      id_front_image_url: (formData.get("id_front_image_url") as string) || null,
      id_back_image_url: (formData.get("id_back_image_url") as string) || null,
    }

    const { data, error } = await supabase
      .from("citizens")
      .insert(citizen)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/citizens")
    return NextResponse.json({ citizen: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    )
  }
}
