import { getDashboardStats, getCitizens } from "@/lib/db"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, UserPlus, MapPin, BarChart3, Eye, ArrowUpRight, FileText, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const { citizens: recentCitizens } = await getCitizens({ limit: 10 })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Tableau de bord
            </h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5 ml-3">
            Registre des citoyens — Commune d&apos;Agadir · {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Link href="/dashboard/citizens/new">
            <Button size="sm" className="md:size-lg">
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              Nouvel enregistrement
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="secondary" size="sm" className="md:size-lg">
              <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              Rapports
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Total habitants</p>
              <p className="text-2xl font-bold">{stats.total_citizens}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-full" />
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent-light rounded-lg flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Cette semaine</p>
              <p className="text-2xl font-bold">{stats.new_this_week}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold/10 rounded-bl-full" />
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-11 h-11 bg-gradient-to-br from-gold to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Ce mois</p>
              <p className="text-2xl font-bold">{stats.new_this_month}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-dark to-primary rounded-lg flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Secteurs</p>
              <p className="text-2xl font-bold">
                {Object.keys(stats.by_sector).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Derniers enregistrements</h3>
              </div>
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
                  Ajoutez votre premier enregistrement
                </p>
                <Link href="/dashboard/citizens/new">
                  <Button className="mt-4">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouvel enregistrement
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">N°</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">Nom</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">Prénom</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">CIN</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">Secteur</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">Date</th>
                      <th className="text-right py-2.5 px-4 font-medium text-muted text-[11px] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCitizens.map((citizen, i) => (
                      <tr key={citizen.id} className="border-b border-border hover:bg-hover transition-colors">
                        <td className="py-2.5 px-4 text-muted text-xs">{String(i + 1).padStart(2, "0")}</td>
                        <td className="py-2.5 px-4 font-medium text-sm">{citizen.last_name}</td>
                        <td className="py-2.5 px-4">{citizen.first_name}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="default">{citizen.national_id}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-xs">{citizen.sector}</td>
                        <td className="py-2.5 px-4 text-muted text-xs">{formatDate(citizen.created_at)}</td>
                        <td className="py-2.5 px-4 text-right">
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

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Répartition par secteur</h3>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.by_sector).length === 0 ? (
                <p className="text-muted text-sm">Aucune donnée</p>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(stats.by_sector)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([sector, count]) => (
                      <div key={sector} className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate mr-2">{sector}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-20 h-1.5 bg-hover rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              style={{
                                width: `${(count / stats.total_citizens) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted w-6 text-right">
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
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Répartition par sexe</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 py-2">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <span className="text-xl font-bold text-white">
                      {stats.by_gender.male}
                    </span>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hommes</p>
                </div>
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <span className="text-xl font-bold text-white">
                      {stats.by_gender.female}
                    </span>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Femmes</p>
                </div>
              </div>
              {stats.total_citizens > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="w-full h-2 bg-hover rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-primary rounded-l-full transition-all"
                      style={{ width: `${(stats.by_gender.male / stats.total_citizens) * 100}%` }}
                    />
                    <div
                      className="h-full bg-accent rounded-r-full transition-all"
                      style={{ width: `${(stats.by_gender.female / stats.total_citizens) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between px-1 py-2 text-[10px] text-muted">
        <span className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          Système sécurisé — Registre administratif municipal
        </span>
        <span>Responsable : ANAS GUERRABI</span>
      </div>
    </div>
  )
}
