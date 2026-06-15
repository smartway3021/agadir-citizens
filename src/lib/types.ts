export interface Citizen {
  id: string
  first_name: string
  last_name: string
  national_id: string
  birth_date: string
  address: string
  city: string
  gender: "male" | "female"
  id_front_image_url: string | null
  id_back_image_url: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_citizens: number
  new_this_week: number
  new_this_month: number
  by_city: Record<string, number>
  by_gender: { male: number; female: number }
}

export interface OcrResult {
  first_name: string
  last_name: string
  national_id: string
  birth_date: string
  address: string
  city: string
  gender: "male" | "female"
}

export interface ReportFilters {
  period: "today" | "7days" | "30days" | "custom"
  start_date?: string
  end_date?: string
  city?: string
}
