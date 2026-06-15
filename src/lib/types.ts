export interface Citizen {
  id: string
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  national_id: string
  birth_date: string
  address: string
  sector: string
  gender: "male" | "female"
  phone: string
  profession: string
  marital_status: "single" | "married" | "divorced" | "widowed"
  nationality: string
  id_front_image_url: string | null
  id_back_image_url: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_citizens: number
  new_this_week: number
  new_this_month: number
  by_sector: Record<string, number>
  by_gender: { male: number; female: number }
}

export interface OcrResult {
  first_name: string
  last_name: string
  national_id: string
  birth_date: string
  address: string
  sector: string
  gender: "male" | "female"
}

export interface ReportFilters {
  period: "today" | "7days" | "30days" | "custom"
  start_date?: string
  end_date?: string
  sector?: string
}
