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
  { href: "/dashboard/citizens", label: "Habitants", icon: Users },
  { href: "/dashboard/citizens/new", label: "Nouveau habitant", icon: Plus },
  { href: "/dashboard/reports", label: "Rapports", icon: FileText },
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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-card rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm md:text-lg">AC</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs md:text-sm truncate">Agadir Citoyens</h2>
              <p className="text-[10px] md:text-xs text-sidebar-muted truncate">Administration</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-sidebar-muted hover:text-sidebar-foreground p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent/20 text-sidebar-foreground"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
                )}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 md:p-4 border-t border-sidebar-border space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/10 w-full transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />}
            <span className="truncate">{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/10 w-full transition-colors"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="truncate">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
