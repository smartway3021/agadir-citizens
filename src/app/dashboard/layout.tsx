import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      redirect("/auth/login")
    }
  } catch {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-6 pt-16 lg:pt-6 overflow-auto">
          {children}
        </main>
      </div>
      <footer className="hidden lg:block lg:ml-64 border-t border-border bg-card">
        <div className="px-6 py-2 flex items-center justify-between text-[10px] text-muted">
          <span>Agadir Citoyens — Registre administratif municipal</span>
          <span>Responsable : ANASS GUERRABI | © {new Date().getFullYear()} — Tous droits réservés</span>
        </div>
      </footer>
    </div>
  )
}
