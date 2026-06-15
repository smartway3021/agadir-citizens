import { getDashboardStats, getCitizens } from "@/lib/db"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, UserPlus, MapPin, BarChart3, Eye, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const { citizens: recentCitizens } = await getCitizens({ limit: 10 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted text-xs md:text-sm mt-0.5">
            Vue d&apos;ensemble de la base habitants
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Link href="/dashboard/citizens/new">
            <Button size="sm" className="md:size-lg">
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Nouveau habitant</span>
              <span className="xs:hidden">Ajouter</span>
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="secondary" size="sm" className="md:size-lg">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Rapports</span>
              <span className="xs:hidden">Rapport</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Total habitants</p>
              <p className="text-2xl font-bold">{stats.total_citizens}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Cette semaine</p>
              <p className="text-2xl font-bold">{stats.new_this_week}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Ce mois</p>
              <p className="text-2xl font-bold">{stats.new_this_month}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Secteurs</p>
              <p className="text-2xl font-bold">
                {Object.keys(stats.by_sector).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Derniers habitants ajoutés</h3>
            <Link href="/dashboard/citizens">
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentCitizens.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Users className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted font-medium">Aucun habitant pour le moment</p>
              <p className="text-sm text-muted mt-1">
                Ajoutez votre premier habitant via le bouton &quot;Nouveau habitant&quot;
              </p>
              <Link href="/dashboard/citizens/new">
                <Button className="mt-4">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nouveau habitant
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-6 font-medium text-muted">Nom</th>
                    <th className="text-left py-3 px-6 font-medium text-muted">Prénom</th>
                    <th className="text-left py-3 px-6 font-medium text-muted">CIN</th>
                    <th className="text-left py-3 px-6 font-medium text-muted">Secteur</th>
                    <th className="text-left py-3 px-6 font-medium text-muted">Date d&apos;ajout</th>
                    <th className="text-right py-3 px-6 font-medium text-muted">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCitizens.map((citizen) => (
                    <tr key={citizen.id} className="border-b border-border hover:bg-hover transition-colors">
                      <td className="py-3 px-6 font-medium">{citizen.last_name}</td>
                      <td className="py-3 px-6">{citizen.first_name}</td>
                      <td className="py-3 px-6">
                        <Badge>{citizen.national_id}</Badge>
                      </td>
                      <td className="py-3 px-6">{citizen.sector}</td>
                      <td className="py-3 px-6 text-muted">{formatDate(citizen.created_at)}</td>
                      <td className="py-3 px-6 text-right">
                        <Link href={`/dashboard/citizens/${citizen.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Répartition par secteur</h3>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.by_sector).length === 0 ? (
              <p className="text-muted text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.by_sector)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sector}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-hover rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(count / stats.total_citizens) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Répartition par sexe</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 py-4">
              <div className="text-center flex-1">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-primary">
                    {stats.by_gender.male}
                  </span>
                </div>
                <p className="text-sm font-medium">Hommes</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-primary">
                    {stats.by_gender.female}
                  </span>
                </div>
                <p className="text-sm font-medium">Femmes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
