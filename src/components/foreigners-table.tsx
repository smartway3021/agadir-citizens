"use client"

import Link from "next/link"
import type { Foreigner } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Phone, Globe, Loader2, FileImage, FileText } from "lucide-react"
import { deleteForeignerAction } from "@/app/actions"
import { useRouter } from "next/navigation"

interface Props {
  foreigners: Foreigner[]
  currentPage: number
  totalPages: number
}

async function downloadPNG(url: string, name: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = blobUrl; a.download = `${name}.png`
  document.body.appendChild(a); a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

async function downloadPDF(imageUrl: string, name: string) {
  const { default: jsPDF } = await import("jspdf")
  const img = new Image()
  if (!imageUrl.startsWith("data:")) img.crossOrigin = "anonymous"
  img.src = imageUrl
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })
  const canvas = document.createElement("canvas")
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
  const pdf = new jsPDF({ orientation: img.naturalWidth > img.naturalHeight ? "l" : "p", unit: "mm" })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgRatio = img.naturalWidth / img.naturalHeight
  let w = pageW - 20, h = w / imgRatio
  if (h > pageH - 20) { h = pageH - 20; w = h * imgRatio }
  pdf.addImage(dataUrl, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h)
  pdf.save(`${name}.pdf`)
}

export function ForeignersTable({ foreigners, currentPage, totalPages }: Props) {
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return
    await deleteForeignerAction(id)
    router.refresh()
  }

  if (foreigners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">Aucun étranger trouvé</p>
        <div className="flex gap-3 justify-center mt-4 flex-wrap">
          <Link href="/dashboard/foreigners/new">
            <Button>Ajouter un étranger</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Carte</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Civilité</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Nationalité</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">CIN</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Né(e) le</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Téléphone</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Secteur</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Sexe</th>
              <th className="text-right py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {foreigners.map((f) => (
              <tr key={f.id} className="border-b border-border hover:bg-hover">
                <td className="py-2 px-3">
                  {f.id_front_image_url ? (
                    <div className="flex items-center gap-1">
                      <img src={f.id_front_image_url} alt="Carte" className="w-10 h-7 object-cover rounded border border-border cursor-pointer" onClick={() => window.open(f.id_front_image_url!, "_blank")} />
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => downloadPNG(f.id_front_image_url!, `${f.last_name}_${f.first_name}_carte`)} className="text-[10px] text-muted hover:text-foreground flex items-center gap-0.5" title="PNG"><FileImage className="w-3 h-3" /> PNG</button>
                        <button onClick={() => downloadPDF(f.id_front_image_url!, `${f.last_name}_${f.first_name}_carte`)} className="text-[10px] text-muted hover:text-foreground flex items-center gap-0.5" title="PDF"><FileText className="w-3 h-3" /> PDF</button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted text-[10px]">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-sm">{f.last_name} {f.first_name}</div>
                  <div className="text-[10px] text-muted flex flex-wrap gap-x-2 mt-0.5">
                    {f.father_name && <span>Père: {f.father_name}</span>}
                    {f.mother_name && <span>Mère: {f.mother_name}</span>}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <span className="flex items-center gap-1 text-xs">
                    <Globe className="w-3 h-3 text-muted shrink-0" />
                    {f.nationality}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <Badge>{f.national_id}</Badge>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted">{f.birth_date || "-"}</td>
                <td className="py-2.5 px-3 text-xs">
                  {f.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted shrink-0" />
                      {f.phone}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs">{f.sector}</td>
                <td className="py-2.5 px-3 text-xs">
                  <span className={`${f.gender === "male" ? "text-blue-600 dark:text-blue-400" : "text-pink-500 dark:text-pink-400"} font-medium`}>
                    {f.gender === "male" ? "H" : "F"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/foreigners/${f.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id, `${f.first_name} ${f.last_name}`)}>
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted">Page {currentPage} sur {totalPages}</p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/dashboard/foreigners?page=${currentPage - 1}`} className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-hover">Précédent</Link>
            )}
            {currentPage < totalPages && (
              <Link href={`/dashboard/foreigners?page=${currentPage + 1}`} className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-hover">Suivant</Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
