import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = createAdminClient()
  let query = supabase.from("foreigners").select("*", { count: "exact" }).order("created_at", { ascending: false })
  const { data, count } = await query
  return NextResponse.json({ foreigners: data || [], total: count || 0 })
}

export async function POST(request: Request) {
  const supabase = createAdminClient()
  const formData = await request.formData()
  const foreigner: Record<string, string | null> = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    father_name: (formData.get("father_name") as string) || "",
    mother_name: (formData.get("mother_name") as string) || "",
    national_id: formData.get("national_id") as string,
    birth_date: formData.get("birth_date") as string,
    address: formData.get("address") as string,
    sector: formData.get("sector") as string,
    gender: formData.get("gender") as string,
    phone: (formData.get("phone") as string) || "",
    profession: (formData.get("profession") as string) || "",
    marital_status: (formData.get("marital_status") as string) || "single",
    nationality: (formData.get("nationality") as string) || "",
    id_front_image_url: formData.get("id_front_image_url") as string | null,
    id_back_image_url: formData.get("id_back_image_url") as string | null,
  }
  const { data, error } = await supabase.from("foreigners").insert(foreigner).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
