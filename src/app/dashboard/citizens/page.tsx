import { getCitizens, getSectors } from "@/lib/db"
import { CitizensTable } from "@/components/citizens-table"
import { CitizensFilters } from "@/components/citizens-filters"
import { Card, CardContent } from "@/components/ui/card"

export default async function CitizensPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sector?: string; page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  const { citizens, total } = await getCitizens({
    search: params.search,
    sector: params.sector,
    limit,
    offset,
  })

  const sectors = await getSectors()
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Registre des habitants</h1>
        </div>
        <p className="text-muted-foreground text-xs md:text-sm mt-0.5 ml-3">
          {total} citoyen{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CitizensFilters sectors={sectors} />
          <CitizensTable
            citizens={citizens}
            currentPage={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  )
}
