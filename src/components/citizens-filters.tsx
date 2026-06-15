"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface Props {
  cities: string[]
}

export function CitizensFilters({ cities }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [city, setCity] = useState(searchParams.get("city") || "")

  function applyFilters() {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (city) params.set("city", city)
    router.push(`/dashboard/citizens?${params.toString()}`)
  }

  function resetFilters() {
    setSearch("")
    setCity("")
    router.push("/dashboard/citizens")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") applyFilters()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher par nom, prénom ou CIN..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Toutes les villes</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <Button onClick={applyFilters} size="sm">
        <Search className="w-4 h-4 mr-1" />
        Filtrer
      </Button>
      {(search || city) && (
        <Button variant="ghost" onClick={resetFilters} size="sm">
          <X className="w-4 h-4 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
