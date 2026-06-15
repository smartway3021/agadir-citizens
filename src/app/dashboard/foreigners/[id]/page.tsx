import { getForeignerById } from "@/lib/db"
import { notFound } from "next/navigation"
import { ForeignerDetail } from "@/components/foreigner-detail"

export default async function ForeignerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const foreigner = await getForeignerById(id)

  if (!foreigner) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ForeignerDetail foreigner={foreigner} />
    </div>
  )
}
