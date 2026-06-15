import { getForeigners, getForeignerSectors } from "@/lib/db"
import { ForeignersTable } from "@/components/foreigners-table"
import { ForeignersFilters } from "@/components/foreigners-filters"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ForeignersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sector?: string; page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  const { foreigners, total } = await getForeigners({
    search: params.search,
    sector: params.sector,
    limit,
    offset,
  })

  const sectors = await getForeignerSectors()
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Registre des étrangers</h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5 ml-3">
            {total} étranger{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/foreigners/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ForeignersFilters sectors={sectors} />
          <ForeignersTable
            foreigners={foreigners}
            currentPage={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  )
}
