"use client"

import Link from "next/link"
import type { Citizen } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Phone, Briefcase } from "lucide-react"
import { deleteCitizenAction } from "@/app/actions"
import { useRouter } from "next/navigation"

interface Props {
  citizens: Citizen[]
  currentPage: number
  totalPages: number
}

export function CitizensTable({ citizens, currentPage, totalPages }: Props) {
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} ?`)) return
    await deleteCitizenAction(id)
    router.refresh()
  }

  if (citizens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">Aucun habitant trouvé</p>
        <Link href="/dashboard/citizens/new">
          <Button className="mt-4">Ajouter un habitant</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Nom</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Prénom</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">CIN</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Téléphone</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Secteur</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Sexe</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Profession</th>
              <th className="text-left py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Date</th>
              <th className="text-right py-2.5 px-3 font-medium text-muted text-[11px] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((citizen) => (
              <tr key={citizen.id} className="border-b border-border hover:bg-hover">
                <td className="py-2.5 px-3 font-medium text-sm">{citizen.last_name}</td>
                <td className="py-2.5 px-3 text-sm">{citizen.first_name}</td>
                <td className="py-2.5 px-3">
                  <Badge>{citizen.national_id}</Badge>
                </td>
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
                <td className="py-2.5 px-3 text-xs">
                  {citizen.profession ? (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-muted shrink-0" />
                      {citizen.profession}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-muted text-xs">
                  {formatDate(citizen.created_at)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/citizens/${citizen.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDelete(
                          citizen.id,
                          `${citizen.first_name} ${citizen.last_name}`
                        )
                      }
                    >
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
          <p className="text-sm text-muted">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/dashboard/citizens?page=${currentPage - 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-hover"
              >
                Précédent
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/dashboard/citizens?page=${currentPage + 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-hover"
              >
                Suivant
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
