"use client"

import Link from "next/link"
import type { Citizen } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Eye, Trash2, Phone, Briefcase, FileSpreadsheet, Upload, Loader2,
  Download, FileImage, FileText,
} from "lucide-react"
import { deleteCitizenAction } from "@/app/actions"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

interface Props {
  citizens: Citizen[]
  currentPage: number
  totalPages: number
}

export function CitizensTable({ citizens, currentPage, totalPages }: Props) {
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return
    await deleteCitizenAction(id)
    router.refresh()
  }

  async function handleExportAll() {
    setExporting(true)
    try {
      const res = await fetch("/api/export/excel")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `habitants_${new Date().toISOString().split("T")[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Erreur lors de l'export")
    }
    setExporting(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/import/excel", { method: "POST", body: form })
      if (!res.ok) throw new Error()
      const result = await res.json()
      alert(`${result.count} citoyens importés`)
      router.refresh()
    } catch {
      alert("Erreur lors de l'import")
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  function downloadPNG(url: string, name: string) {
    const a = document.createElement("a")
    a.href = url
    a.download = `${name}.png`
    a.target = "_blank"
    a.click()
  }

  async function downloadPDF(imageUrl: string, name: string) {
    const { default: jsPDF } = await import("jspdf")
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    await new Promise((resolve, reject) => {
      img.onload = resolve; img.onerror = reject
    })
    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    const pdf = new jsPDF({ orientation: img.naturalWidth > img.naturalHeight ? "l" : "p", unit: "mm" })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgRatio = img.naturalWidth / img.naturalHeight
    let w = pageW - 20, h = w / imgRatio
    if (h > pageH - 20) { h = pageH - 20; w = h * imgRatio }
    const x = (pageW - w) / 2, y = (pageH - h) / 2
    pdf.addImage(dataUrl, "JPEG", x, y, w, h)
    pdf.save(`${name}.pdf`)
  }

  if (citizens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">Aucun habitant trouvé</p>
        <div className="flex gap-3 justify-center mt-4 flex-wrap">
          <Link href="/dashboard/citizens/new">
            <Button>Ajouter un habitant</Button>
          </Link>
          <Button variant="secondary" onClick={handleExportAll} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1" />}
            Exporter tout
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-2">
          <Button size="sm" onClick={handleExportAll} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1" />}
            Exporter tout
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            Importer Excel
          </Button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Carte</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Civilité</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">CIN</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Né(e) le</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Téléphone</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Secteur</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Sexe</th>
              <th className="text-right py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((citizen) => (
              <tr key={citizen.id} className="border-b border-border hover:bg-hover">
                <td className="py-2 px-3">
                  {citizen.id_front_image_url ? (
                    <div className="flex items-center gap-1">
                      <img
                        src={citizen.id_front_image_url}
                        alt="Carte"
                        className="w-10 h-7 object-cover rounded border border-border cursor-pointer"
                        onClick={() => window.open(citizen.id_front_image_url!, "_blank")}
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => downloadPNG(citizen.id_front_image_url!, `${citizen.last_name}_${citizen.first_name}_carte`)}
                          className="text-[10px] text-muted hover:text-foreground flex items-center gap-0.5"
                          title="Télécharger PNG"
                        >
                          <FileImage className="w-3 h-3" /> PNG
                        </button>
                        <button
                          onClick={() => downloadPDF(citizen.id_front_image_url!, `${citizen.last_name}_${citizen.first_name}_carte`)}
                          className="text-[10px] text-muted hover:text-foreground flex items-center gap-0.5"
                          title="Télécharger PDF"
                        >
                          <FileText className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted text-[10px]">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-sm">{citizen.last_name} {citizen.first_name}</div>
                  <div className="text-[10px] text-muted flex flex-wrap gap-x-2 mt-0.5">
                    {citizen.father_name && <span>Père: {citizen.father_name}</span>}
                    {citizen.mother_name && <span>Mère: {citizen.mother_name}</span>}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <Badge>{citizen.national_id}</Badge>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted">{citizen.birth_date || "-"}</td>
                <td className="py-2.5 px-3 text-xs">
                  {citizen.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted shrink-0" />
                      {citizen.phone}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs">{citizen.sector}</td>
                <td className="py-2.5 px-3 text-xs">
                  <span className={`${citizen.gender === "male" ? "text-primary" : "text-accent"} font-medium`}>
                    {citizen.gender === "male" ? "H" : "F"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/citizens/${citizen.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(citizen.id, `${citizen.first_name} ${citizen.last_name}`)}>
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
              <Link href={`/dashboard/citizens?page=${currentPage - 1}`} className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-hover">
                Précédent
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`/dashboard/citizens?page=${currentPage + 1}`} className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-hover">
                Suivant
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
