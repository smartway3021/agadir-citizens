import { getDashboardStats } from "@/lib/db"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, UserPlus, MapPin, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted text-sm mt-1">
            Vue d&apos;ensemble de la base habitants
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/citizens/new">
            <Button size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              Nouveau habitant
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="secondary" size="lg">
              <BarChart3 className="w-5 h-5 mr-2" />
              Rapports
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
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Villes</p>
              <p className="text-2xl font-bold">
                {Object.keys(stats.by_city).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Répartition par ville</h3>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.by_city).length === 0 ? (
              <p className="text-muted text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.by_city)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{city}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
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
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-pink-500">
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
