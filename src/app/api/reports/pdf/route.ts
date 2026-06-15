import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import jsPDF from "jspdf"
import "jspdf-autotable"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const supabase = createAdminClient()

    const period = searchParams.get("period") || "all"
    const sector = searchParams.get("sector") || ""
    const customStart = searchParams.get("start_date") || ""
    const customEnd = searchParams.get("end_date") || ""

    let dateFilter = ""
    const now = new Date()

    switch (period) {
      case "today":
        dateFilter = now.toISOString().split("T")[0]
        break
      case "7days": {
        const d = new Date(now.getTime() - 7 * 86400000)
        dateFilter = d.toISOString()
        break
      }
      case "30days": {
        const d = new Date(now.getTime() - 30 * 86400000)
        dateFilter = d.toISOString()
        break
      }
    }

    let query = supabase.from("citizens").select("*")
    if (dateFilter && period !== "custom") {
      query = query.gte("created_at", dateFilter)
    }
    if (period === "custom" && customStart) {
      query = query.gte("created_at", customStart)
    }
    if (period === "custom" && customEnd) {
      query = query.lte("created_at", `${customEnd}T23:59:59`)
    }
    if (sector) query = query.eq("sector", sector)

    const { data } = await query

    const citizens = data || []

    const bySector: Record<string, number> = {}
    const byGender = { male: 0, female: 0 }
    citizens.forEach((c: Record<string, unknown>) => {
      bySector[c.sector as string] = (bySector[c.sector as string] || 0) + 1
      if (c.gender === "male") byGender.male++
      else byGender.female++
    })

    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Royaume du Maroc", pageWidth / 2, 20, { align: "center" })
    doc.setFontSize(14)
    doc.setTextColor(30, 64, 175)
    doc.text("Administration Régionale d'Agadir", pageWidth / 2, 28, { align: "center" })
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Date: ${now.toLocaleDateString("fr-FR")}`, pageWidth / 2, 34, { align: "center" })

    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.5)
    doc.line(20, 38, pageWidth - 20, 38)

    doc.setFontSize(18)
    doc.setTextColor(0)
    doc.text("Rapport Administratif des Habitants", pageWidth / 2, 48, { align: "center" })

    doc.setFontSize(12)
    doc.setTextColor(50)
    doc.text(`Total des habitants: ${citizens.length}`, 20, 60)

    const periodLabel =
      period === "today" ? "Aujourd'hui" :
      period === "7days" ? "7 derniers jours" :
      period === "30days" ? "30 derniers jours" :
      period === "custom" ? "Période personnalisée" : "Toute la base"
    doc.text(`Période: ${periodLabel}`, 20, 68)

    if (sector) doc.text(`Secteur: ${sector}`, 20, 76)

    let yPos = sector ? 84 : 76
    doc.setFontSize(11)
    doc.text("Répartition par sexe:", 20, yPos)
    doc.setFontSize(10)
    doc.text(`Hommes: ${byGender.male}`, 30, yPos + 8)
    doc.text(`Femmes: ${byGender.female}`, 30, yPos + 16)

    yPos = yPos + 24
    doc.setFontSize(11)
    doc.text("Répartition par secteur:", 20, yPos)
    doc.setFontSize(10)

    const sectorEntries = Object.entries(bySector).sort(([, a], [, b]) => b - a)
    let secY = yPos + 8
    sectorEntries.forEach(([secName, count]) => {
      if (secY > 260) {
        doc.addPage()
        secY = 20
      }
      doc.text(`• ${secName}: ${count} habitant${count > 1 ? "s" : ""}`, 30, secY)
      secY += 7
    })

    if (citizens.length > 0) {
      doc.addPage()

      doc.setFontSize(14)
      doc.setTextColor(30, 64, 175)
      doc.text("Liste détaillée des habitants", pageWidth / 2, 20, { align: "center" })

      const tableData = citizens.map((c: Record<string, unknown>) => [
        c.last_name,
        c.first_name,
        c.national_id,
        c.phone || "-",
        c.sector,
        c.gender === "male" ? "H" : "F",
        new Date(c.created_at as string).toLocaleDateString("fr-FR"),
      ])

      doc.autoTable({
        startY: 28,
        head: [["Nom", "Prénom", "CIN", "Téléphone", "Secteur", "Sexe", "Date d'ajout"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
      })
    }

    const finalY = doc.lastAutoTable?.finalY || 200
    const sigY = Math.min(finalY + 30, 260)

    if (sigY + 20 < doc.internal.pageSize.getHeight()) {
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text("Signature du responsable administratif", 20, sigY)
      doc.line(20, sigY + 15, 80, sigY + 15)
      doc.text("Cachet", pageWidth / 2, sigY + 25)
      doc.line(pageWidth / 2 - 20, sigY + 15, pageWidth / 2 + 20, sigY + 15)
      doc.line(pageWidth / 2 - 15, sigY + 10, pageWidth / 2 + 15, sigY + 20)
      doc.line(pageWidth / 2 + 15, sigY + 10, pageWidth / 2 - 15, sigY + 20)
    }

    doc.setFontSize(8)
    doc.setTextColor(180)
    doc.text(
      "Agadir Citoyens - Système de gestion des habitants - Document officiel",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )

    const pdfBuf = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport_habitants_${now.toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    )
  }
}
