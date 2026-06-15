import { getCitizenById } from "@/lib/db"
import { notFound } from "next/navigation"
import { CitizenDetail } from "@/components/citizen-detail"

export default async function CitizenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const citizen = await getCitizenById(id)

  if (!citizen) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <CitizenDetail citizen={citizen} />
    </div>
  )
}
