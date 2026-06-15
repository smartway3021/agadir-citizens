import { createAdminClient } from "./supabase/admin"
import type { Citizen, Foreigner, DashboardStats } from "./types"

export async function getCitizens(options?: {
  search?: string
  sector?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}) {
  const supabase = createAdminClient()
  let query = supabase
    .from("citizens")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (options?.search) {
    query = query.or(
      `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,national_id.ilike.%${options.search}%`
    )
  }

  if (options?.sector) {
    query = query.eq("sector", options.sector)
  }

  if (options?.start_date) {
    query = query.gte("created_at", options.start_date)
  }

  if (options?.end_date) {
    query = query.lte("created_at", options.end_date)
  }

  if (options?.limit) {
    query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1)
  }

  const { data, count } = await query

  return { citizens: (data as Citizen[]) || [], total: count || 0 }
}

export async function getCitizenById(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("citizens").select("*").eq("id", id).single()
  return data as Citizen | null
}

export async function createCitizen(citizen: Omit<Citizen, "id" | "created_at" | "updated_at">) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("citizens")
    .insert(citizen)
    .select()
    .single()
  if (error) throw error
  return data as Citizen
}

export async function updateCitizen(id: string, citizen: Partial<Citizen>) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("citizens")
    .update({ ...citizen, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Citizen
}

export async function deleteCitizen(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("citizens").delete().eq("id", id)
  if (error) throw error
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString()

  const { count: total } = await supabase
    .from("citizens")
    .select("*", { count: "exact", head: true })

  const { count: weekCount } = await supabase
    .from("citizens")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo)

  const { count: monthCount } = await supabase
    .from("citizens")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo)

  const { data: sectorData } = await supabase
    .from("citizens")
    .select("sector")

  const bySector: Record<string, number> = {}
  sectorData?.forEach((c) => {
    bySector[c.sector] = (bySector[c.sector] || 0) + 1
  })

  const { data: genderData } = await supabase
    .from("citizens")
    .select("gender")

  const byGender = { male: 0, female: 0 }
  genderData?.forEach((g) => {
    if (g.gender === "male") byGender.male++
    else byGender.female++
  })

  return {
    total_citizens: total || 0,
    new_this_week: weekCount || 0,
    new_this_month: monthCount || 0,
    by_sector: bySector,
    by_gender: byGender,
  }
}

export async function getForeigners(options?: {
  search?: string
  sector?: string
  limit?: number
  offset?: number
}) {
  const supabase = createAdminClient()
  let query = supabase
    .from("foreigners")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (options?.search) {
    query = query.or(
      `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,national_id.ilike.%${options.search}%`
    )
  }
  if (options?.sector) {
    query = query.eq("sector", options.sector)
  }
  if (options?.limit) {
    query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1)
  }

  const { data, count } = await query
  return { foreigners: (data as Foreigner[]) || [], total: count || 0 }
}

export async function getForeignerById(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("foreigners").select("*").eq("id", id).single()
  return data as Foreigner | null
}

export async function deleteForeigner(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("foreigners").delete().eq("id", id)
  if (error) throw error
}

export async function getForeignerSectors(): Promise<string[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("foreigners")
    .select("sector")
    .order("sector")
  const sectors = [...new Set(data?.map((c) => c.sector).filter(Boolean))]
  return sectors as string[]
}

export async function getSectors(): Promise<string[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("citizens")
    .select("sector")
    .order("sector")

  const sectors = [...new Set(data?.map((c) => c.sector).filter(Boolean))]
  return sectors as string[]
}
