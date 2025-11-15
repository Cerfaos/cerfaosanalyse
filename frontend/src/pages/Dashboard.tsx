import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'

interface Stats {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalTrimp: number
  averageDistance: number
  averageDuration: number
  averageHeartRate: number | null
  byType: { type: string; count: number; distance: number; duration: number }[]
}

interface GlobalStats {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalElevation: number
  totalCalories: number
  averageHeartRate: number
  averageSpeed: number
  averageDistance: number
}

interface Activity {
  id: number
  date: string
  type: string
  duration: number
  distance: number
  avgHeartRate: number | null
  avgSpeed: number | null
  elevationGain: number | null
  calories: number | null
  trimp: number | null
}

const periodOptions: { value: '7' | '30' | '90' | '365'; label: string; color: string; colorDark: string }[] = [
  { value: '7', label: '7 jours', color: 'bg-blue-100 border-blue-400 text-blue-800', colorDark: 'dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-200' },
  { value: '30', label: '30 jours', color: 'bg-green-100 border-green-400 text-green-800', colorDark: 'dark:bg-green-950/40 dark:border-green-600 dark:text-green-200' },
  { value: '90', label: '90 jours', color: 'bg-orange-100 border-orange-400 text-orange-800', colorDark: 'dark:bg-orange-950/40 dark:border-orange-600 dark:text-orange-200' },
  { value: '365', label: 'Année', color: 'bg-purple-100 border-purple-400 text-purple-800', colorDark: 'dark:bg-purple-950/40 dark:border-purple-600 dark:text-purple-200' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365'>('30')
  const [stats, setStats] = useState<Stats | null>(null)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [period])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const statsResponse = await api.get('/api/activities/stats', {
        params: { period },
      })
      setStats(statsResponse.data.data)

      await loadGlobalStats()

      const activitiesResponse = await api.get('/api/activities', {
        params: { limit: 5, page: 1 },
      })
      setRecentActivities(activitiesResponse.data.data.data)

      await loadMonthlyData()
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGlobalStats = async () => {
    try {
      const response = await api.get('/api/activities', {
        params: { limit: 10000, page: 1 },
      })
      const allActivities: Activity[] = response.data.data.data

      if (allActivities.length === 0) {
        setGlobalStats(null)
        return
      }

      const totalActivities = allActivities.length
      const totalDistance = allActivities.reduce((sum, a) => sum + a.distance, 0)
      const totalDuration = allActivities.reduce((sum, a) => sum + a.duration, 0)
      const totalElevation = allActivities.reduce((sum, a) => sum + (a.elevationGain || 0), 0)
      const totalCalories = allActivities.reduce((sum, a) => sum + (a.calories || 0), 0)

      const activitiesWithHR = allActivities.filter((a) => a.avgHeartRate)
      const averageHeartRate = activitiesWithHR.length > 0
        ? Math.round(activitiesWithHR.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) / activitiesWithHR.length)
        : 0

      const activitiesWithSpeed = allActivities.filter((a) => a.avgSpeed)
      const averageSpeed = activitiesWithSpeed.length > 0
        ? activitiesWithSpeed.reduce((sum, a) => sum + (a.avgSpeed || 0), 0) / activitiesWithSpeed.length
        : 0

      const averageDistance = totalDistance / totalActivities

      setGlobalStats({
        totalActivities,
        totalDistance,
        totalDuration,
        totalElevation,
        totalCalories,
        averageHeartRate,
        averageSpeed,
        averageDistance,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats globales:', error)
    }
  }

  const loadMonthlyData = async () => {
    try {
      const response = await api.get('/api/activities', {
        params: { limit: 1000, page: 1 },
      })
      const activities = response.data.data.data

      const monthsMap = new Map<string, { distance: number; count: number; trimp: number }>()

      activities.forEach((activity: Activity) => {
        const date = new Date(activity.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, { distance: 0, count: 0, trimp: 0 })
        }

        const monthData = monthsMap.get(monthKey)!
        monthData.distance += activity.distance / 1000
        monthData.count += 1
        monthData.trimp += activity.trimp || 0
      })

      const monthlyArray = Array.from(monthsMap.entries())
        .map(([month, data]) => ({
          month,
          monthLabel: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          distance: Math.round(data.distance),
          count: data.count,
          trimp: Math.round(data.trimp),
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12)

      setMonthlyData(monthlyArray)
    } catch (error) {
      console.error('Erreur lors du chargement des données mensuelles:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(2)} km`
  }

  const getPeriodLabel = () => {
    switch (period) {
      case '7':
        return '7 derniers jours'
      case '30':
        return '30 derniers jours'
      case '90':
        return '90 derniers jours'
      case '365':
        return 'Cette année'
    }
  }

  const actions = (
    <button onClick={() => navigate('/activities')} className="btn-primary font-display">
      Importer une activité
    </button>
  )

  if (loading) {
    return (
      <AppLayout title="Tableau de bord" description={`Synthèse ${getPeriodLabel()}`} actions={actions}>
        <div className="glass-panel p-6 text-center text-text-secondary dark:text-dark-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title="Tableau de bord"
      description={`Salut ${user?.fullName || user?.email}, voici tes ${getPeriodLabel()?.toLowerCase()}`}
      actions={actions}
    >
      <div className="space-y-8">
        {globalStats && (
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-text-muted">Historique</p>
                <h2 className="text-xl font-semibold">{globalStats.totalActivities} activités enregistrées</h2>
              </div>
              <div className="flex gap-3 text-sm">
                <StatPill label="Distance" value={formatDistance(globalStats.totalDistance)} />
                <StatPill label="Durée" value={`${Math.floor(globalStats.totalDuration / 3600)}h`} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard label="Dénivelé +" value={globalStats.totalElevation > 0 ? `${Math.round(globalStats.totalElevation)} m` : '-'} />
              <StatCard label="FC moyenne" value={globalStats.averageHeartRate ? `${globalStats.averageHeartRate} bpm` : '-'} />
              <StatCard label="Vitesse moyenne" value={globalStats.averageSpeed > 0 ? `${globalStats.averageSpeed.toFixed(2)} km/h` : '-'} />
              <StatCard label="Calories" value={globalStats.totalCalories > 0 ? Math.round(globalStats.totalCalories).toLocaleString() : '-'} />
              <StatCard label="Distance / sortie" value={globalStats.averageDistance > 0 ? `${(globalStats.averageDistance / 1000).toFixed(2)} km` : '-'} />
              <StatCard label="Total sorties" value={globalStats.totalActivities.toString()} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all border-2 ${
                period === option.value
                  ? `${option.color} ${option.colorDark} shadow-md transform hover:scale-105`
                  : 'border-panel-border bg-white dark:bg-dark-surface text-text-secondary dark:text-dark-text-secondary hover:bg-bg-subtle'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Distance période" value={formatDistance(stats.totalDistance)} />
              <StatCard label="Durée période" value={formatDuration(stats.totalDuration)} />
              <StatCard label="Charge TRIMP" value={stats.totalTrimp ? `${stats.totalTrimp}` : '-'} />
              <StatCard label="FC moyenne" value={stats.averageHeartRate ? `${stats.averageHeartRate} bpm` : '-'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Volume mensuel</h3>
                    <p className="text-sm text-text-muted">Distance totale sur 12 mois</p>
                  </div>
                </div>
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={240}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip formatter={(value: number) => [`${value} km`, 'Distance']} />
                      <Line type="monotone" dataKey="distance" stroke="#E69875" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Répartition par type</h3>
                    <p className="text-sm text-text-muted">Nombre d’activités</p>
                  </div>
                </div>
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={240}>
                    <BarChart data={stats.byType || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip formatter={(value: number) => [value, 'Activités']} />
                      <Bar dataKey="count" fill="#A7C080" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dernières activités</h3>
                <button
                  onClick={() => navigate('/activities')}
                  className="text-sm text-brand hover:text-brand-dark font-medium"
                >
                  Voir tout →
                </button>
              </div>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      onClick={() => navigate(`/activities/${activity.id}`)}
                      formatDistance={formatDistance}
                      formatDuration={formatDuration}
                    />
                  ))
                ) : (
                  <p className="text-center text-text-muted py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <EmptyState onImport={() => navigate('/activities')} />
        )}
      </div>
    </AppLayout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel px-4 py-5">
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted mb-2">{label}</p>
      <p className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast">{value}</p>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1 rounded-full bg-bg-gray-100/80 dark:bg-dark-border/40 text-xs font-semibold text-text-secondary">
      {label}: {value}
    </div>
  )
}

function ActivityRow({
  activity,
  onClick,
  formatDistance,
  formatDuration,
}: {
  activity: Activity
  onClick: () => void
  formatDistance: (meters: number) => string
  formatDuration: (seconds: number) => string
}) {
  const icons: Record<string, string> = {
    Cyclisme: '🚴',
    Course: '🏃',
    Marche: '🚶',
    Rameur: '🚣',
    Randonnée: '🥾',
    Natation: '🏊',
    Fitness: '💪',
    Entraînement: '🏋️',
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 border border-border-base rounded-2xl hover:border-brand/40 hover:bg-bg-gray-100 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-bg-gray-100 flex items-center justify-center text-lg">
          {icons[activity.type] || '📈'}
        </div>
        <div>
          <p className="font-medium text-text-dark dark:text-dark-text-contrast">{activity.type}</p>
          <p className="text-xs text-text-muted">
            {new Date(activity.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {' à '}
            {new Date(activity.date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-text-dark dark:text-dark-text-contrast">{formatDistance(activity.distance)}</p>
        <p className="text-xs text-text-muted">{formatDuration(activity.duration)}</p>
      </div>
    </button>
  )
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="glass-panel p-12 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
          Aucune activité pour le moment
        </h3>
        <p className="text-text-secondary mb-6">
          Importez vos fichiers FIT, GPX ou CSV pour commencer à suivre votre charge d’entraînement.
        </p>
        <button onClick={onImport} className="btn-primary">
          Importer une activité
        </button>
      </div>
    </div>
  )
}
