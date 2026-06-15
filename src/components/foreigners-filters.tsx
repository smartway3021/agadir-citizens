"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

interface Props {
  sectors: string[]
}

export function ForeignersFilters({ sectors }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) params.set("search", e.target.value)
    else params.delete("search")
    params.set("page", "1")
    router.push(`/dashboard/foreigners?${params.toString()}`)
  }

  function handleSector(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) params.set("sector", e.target.value)
    else params.delete("sector")
    params.set("page", "1")
    router.push(`/dashboard/foreigners?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          defaultValue={searchParams.get("search") || ""}
          onChange={handleSearch}
          placeholder="Rechercher par nom, CIN..."
          className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <select
        defaultValue={searchParams.get("sector") || ""}
        onChange={handleSector}
        className="h-9 px-3 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Tous les secteurs</option>
        {sectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  )
}
