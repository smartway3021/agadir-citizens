import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server"

export default async function Home() {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      redirect("/dashboard")
    }
  } catch {
    // Supabase unavailable — show login page
  }

  redirect("/auth/login")
}
