"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/theme-provider"
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/citizens", label: "Registre des habitants", icon: Users },
  { href: "/dashboard/citizens/new", label: "Nouvel enregistrement", icon: Plus },
  { href: "/dashboard/reports", label: "Rapports officiels", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 lg:hidden bg-sidebar text-sidebar-foreground rounded-lg p-2 shadow-lg"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-white">Agadir Citoyens</h2>
              <p className="text-[10px] text-sidebar-muted truncate">Royaume du Maroc</p>
            </div>
          </div>
          <div className="bg-sidebar-accent/20 rounded-lg px-3 py-2 border border-sidebar-accent/10">
            <p className="text-[10px] text-sidebar-muted uppercase tracking-wider">Responsable</p>
            <p className="text-xs font-semibold text-white">ANASS GUERRABI</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 lg:hidden text-sidebar-muted hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-sidebar-muted/50 px-3 pb-1 pt-2 font-medium">
            Menu principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary/20 text-white shadow-sm border-l-2 border-primary"
                    : "text-sidebar-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          <p className="text-[10px] uppercase tracking-widest text-sidebar-muted/50 px-3 pb-1 font-medium">
            Système
          </p>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-sidebar-muted hover:text-white hover:bg-white/5 w-full transition-all"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            <span className="truncate">{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-sidebar-muted hover:text-white hover:bg-white/5 w-full transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="truncate">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
