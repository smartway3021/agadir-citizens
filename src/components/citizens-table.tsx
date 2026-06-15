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
              <th className="text-left py-3 px-4 font-medium text-muted">Nom</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Prénom</th>
              <th className="text-left py-3 px-4 font-medium text-muted">CIN</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Téléphone</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Secteur</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Sexe</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Profession</th>
              <th className="text-left py-3 px-4 font-medium text-muted">Date d&apos;ajout</th>
              <th className="text-right py-3 px-4 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((citizen) => (
              <tr key={citizen.id} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium">{citizen.last_name}</td>
                <td className="py-3 px-4">{citizen.first_name}</td>
                <td className="py-3 px-4">
                  <Badge>{citizen.national_id}</Badge>
                </td>
                <td className="py-3 px-4">
                  {citizen.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted" />
                      {citizen.phone}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="py-3 px-4">{citizen.sector}</td>
                <td className="py-3 px-4">
                  {citizen.gender === "male" ? "Homme" : "Femme"}
                </td>
                <td className="py-3 px-4">
                  {citizen.profession ? (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-muted" />
                      {citizen.profession}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-muted">
                  {formatDate(citizen.created_at)}
                </td>
                <td className="py-3 px-4 text-right">
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
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50"
              >
                Précédent
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/dashboard/citizens?page=${currentPage + 1}`}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50"
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
