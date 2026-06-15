"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react"

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>("all")
  const [city, setCity] = useState("")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)

  function buildExportParams() {
    const params = new URLSearchParams()
    params.set("period", period)
    if (city) params.set("city", city)
    if (period === "custom") {
      if (customStart) params.set("start_date", customStart)
      if (customEnd) params.set("end_date", customEnd)
    }
    return params
  }

  async function handleExportPdf() {
    setLoadingPdf(true)
    try {
      const params = buildExportParams()
      const res = await fetch(`/api/reports/pdf?${params.toString()}`)
      if (!res.ok) throw new Error("Erreur PDF")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport_habitants_${new Date().toISOString().split("T")[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
    setLoadingPdf(false)
  }

  async function handleExportExcel() {
    setLoadingExcel(true)
    try {
      const params = new URLSearchParams()
      if (city) params.set("city", city)
      if (customStart) params.set("start_date", customStart)
      if (customEnd) params.set("end_date", customEnd)

      const res = await fetch(`/api/export/excel?${params.toString()}`)
      if (!res.ok) throw new Error("Erreur Excel")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `habitants_${new Date().toISOString().split("T")[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
    setLoadingExcel(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports et exports</h1>
        <p className="text-muted text-sm mt-1">
          Générez des rapports PDF officiels et exportez les données en Excel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Rapport PDF officiel</h3>
                <p className="text-sm text-muted">
                  Document administratif avec en-tête officiel
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Période
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "all", label: "Toute la base" },
                  { value: "today", label: "Aujourd'hui" },
                  { value: "7days", label: "7 jours" },
                  { value: "30days", label: "30 jours" },
                  { value: "custom", label: "Personnalisé" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      period === opt.value
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-border hover:border-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {period === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ville (optionnel)
              </p>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Toutes les villes"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleExportPdf}
              disabled={loadingPdf}
            >
              {loadingPdf ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              Télécharger le rapport PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Export Excel</h3>
                <p className="text-sm text-muted">
                  Exportez les données au format .xlsx
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Filtre par ville (optionnel)
              </p>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Toutes les villes"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Filtre par date (optionnel)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              variant="success"
              className="w-full"
              onClick={handleExportExcel}
              disabled={loadingExcel}
            >
              {loadingExcel ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 mr-2" />
              )}
              Exporter en Excel
            </Button>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted">
                Colonnes: Nom, Prénom, CIN, Date de naissance, Adresse, Ville, Sexe, Date d&apos;ajout
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
