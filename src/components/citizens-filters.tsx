"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface Props {
  sectors: string[]
}

export function CitizensFilters({ sectors }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [sector, setSector] = useState(searchParams.get("sector") || "")

  function applyFilters() {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (sector) params.set("sector", sector)
    router.push(`/dashboard/citizens?${params.toString()}`)
  }

  function resetFilters() {
    setSearch("")
    setSector("")
    router.push("/dashboard/citizens")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") applyFilters()
  }

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="flex gap-2 md:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary max-w-[140px] md:max-w-none"
        >
          <option value="">Tous</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button onClick={applyFilters} size="sm" className="flex-1 md:flex-none">
          <Search className="w-4 h-4 mr-1" />
          Filtrer
        </Button>
        {(search || sector) && (
          <Button variant="ghost" onClick={resetFilters} size="sm">
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}
