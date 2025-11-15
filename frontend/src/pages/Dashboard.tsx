import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

interface ActivityTypeStats {
  type: string
  count: number
  totalDistance: number
  totalDuration: number
  totalElevation: number
  totalTrimp: number
  averageDistance: number
  averageDuration: number
  averageSpeed: number | null
  averageHeartRate: number | null
  icon: string
  color: string
  colorDark: string
}

const periodOptions: { value: '7' | '30' | '90' | '365'; label: string; color: string; colorDark: string }[] = [
  { value: '7', label: '7 jours', color: 'bg-blue-100 border-blue-400 text-blue-800', colorDark: 'dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-200' },
  { value: '30', label: '30 jours', color: 'bg-green-100 border-green-400 text-green-800', colorDark: 'dark:bg-green-950/40 dark:border-green-600 dark:text-green-200' },
  { value: '90', label: '90 jours', color: 'bg-orange-100 border-orange-400 text-orange-800', colorDark: 'dark:bg-orange-950/40 dark:border-orange-600 dark:text-orange-200' },
  { value: '365', label: 'Année', color: 'bg-purple-100 border-purple-400 text-purple-800', colorDark: 'dark:bg-purple-950/40 dark:border-purple-600 dark:text-purple-200' },
]

const activityTypeConfig: Record<string, { icon: string; color: string; colorDark: string; bgColor: string; bgDark: string }> = {
  'Cyclisme': { icon: '🚴', color: 'text-blue-600', colorDark: 'dark:text-blue-400', bgColor: 'bg-blue-50', bgDark: 'dark:bg-blue-950/30' },
  'Course': { icon: '🏃', color: 'text-orange-600', colorDark: 'dark:text-orange-400', bgColor: 'bg-orange-50', bgDark: 'dark:bg-orange-950/30' },
  'Marche': { icon: '🚶', color: 'text-green-600', colorDark: 'dark:text-green-400', bgColor: 'bg-green-50', bgDark: 'dark:bg-green-950/30' },
  'Rameur': { icon: '🚣', color: 'text-cyan-600', colorDark: 'dark:text-cyan-400', bgColor: 'bg-cyan-50', bgDark: 'dark:bg-cyan-950/30' },
  'Randonnée': { icon: '🥾', color: 'text-amber-600', colorDark: 'dark:text-amber-400', bgColor: 'bg-amber-50', bgDark: 'dark:bg-amber-950/30' },
  'Natation': { icon: '🏊', color: 'text-teal-600', colorDark: 'dark:text-teal-400', bgColor: 'bg-teal-50', bgDark: 'dark:bg-teal-950/30' },
  'Fitness': { icon: '💪', color: 'text-purple-600', colorDark: 'dark:text-purple-400', bgColor: 'bg-purple-50', bgDark: 'dark:bg-purple-950/30' },
  'Entraînement': { icon: '🏋️', color: 'text-indigo-600', colorDark: 'dark:text-indigo-400', bgColor: 'bg-indigo-50', bgDark: 'dark:bg-indigo-950/30' },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365'>('30')
  const [stats, setStats] = useState<Stats | null>(null)
  const [typeStats, setTypeStats] = useState<ActivityTypeStats[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
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

      // Charger toutes les activités de la période pour calculer les stats par type
      await loadTypeStats()

      const activitiesResponse = await api.get('/api/activities', {
        params: { limit: 5, page: 1 },
      })
      setRecentActivities(activitiesResponse.data.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTypeStats = async () => {
    try {
      const response = await api.get('/api/activities', {
        params: { limit: 10000, page: 1 },
      })
      const allActivities: Activity[] = response.data.data.data

      // Filtrer par période
      const periodDays = parseInt(period)
      const periodDate = new Date()
      periodDate.setDate(periodDate.getDate() - periodDays)

      const activitiesInPeriod = allActivities.filter((a) => new Date(a.date) >= periodDate)

      // Grouper par type
      const typeMap = new Map<string, Activity[]>()
      activitiesInPeriod.forEach((activity) => {
        if (!typeMap.has(activity.type)) {
          typeMap.set(activity.type, [])
        }
        typeMap.get(activity.type)!.push(activity)
      })

      // Calculer les stats par type
      const statsArray: ActivityTypeStats[] = []
      typeMap.forEach((activities, type) => {
        const count = activities.length
        const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0)
        const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0)
        const totalElevation = activities.reduce((sum, a) => sum + (a.elevationGain || 0), 0)
        const totalTrimp = activities.reduce((sum, a) => sum + (a.trimp || 0), 0)

        const activitiesWithSpeed = activities.filter((a) => a.avgSpeed)
        const averageSpeed = activitiesWithSpeed.length > 0
          ? activitiesWithSpeed.reduce((sum, a) => sum + (a.avgSpeed || 0), 0) / activitiesWithSpeed.length
          : null

        const activitiesWithHR = activities.filter((a) => a.avgHeartRate)
        const averageHeartRate = activitiesWithHR.length > 0
          ? Math.round(activitiesWithHR.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) / activitiesWithHR.length)
          : null

        const config = activityTypeConfig[type] || {
          icon: '📈',
          color: 'text-gray-600',
          colorDark: 'dark:text-gray-400',
          bgColor: 'bg-gray-50',
          bgDark: 'dark:bg-gray-950/30',
        }

        statsArray.push({
          type,
          count,
          totalDistance,
          totalDuration,
          totalElevation,
          totalTrimp,
          averageDistance: totalDistance / count,
          averageDuration: totalDuration / count,
          averageSpeed,
          averageHeartRate,
          icon: config.icon,
          color: config.color,
          colorDark: config.colorDark,
        })
      })

      // Trier par nombre d'activités
      statsArray.sort((a, b) => b.count - a.count)
      setTypeStats(statsArray)
    } catch (error) {
      console.error('Erreur lors du chargement des stats par type:', error)
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
        {/* Sélecteur de période */}
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

        {stats && stats.totalActivities > 0 ? (
          <>
            {/* Vue d'ensemble de la période */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-text-muted dark:text-dark-text-secondary">Période</p>
                  <h2 className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast">
                    {stats.totalActivities} activité{stats.totalActivities > 1 ? 's' : ''}
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Distance totale" value={formatDistance(stats.totalDistance)} />
                <StatCard label="Durée totale" value={formatDuration(stats.totalDuration)} />
                <StatCard label="Charge TRIMP" value={stats.totalTrimp ? `${stats.totalTrimp}` : '-'} />
                <StatCard label="FC moyenne" value={stats.averageHeartRate ? `${stats.averageHeartRate} bpm` : '-'} />
              </div>
            </div>

            {/* Statistiques par type d'activité */}
            {typeStats.length > 0 && (
              <div className="glass-panel p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">📊</div>
                    <h2 className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast font-display">
                      Statistiques par type d'activité
                    </h2>
                  </div>
                  <p className="text-sm text-text-muted dark:text-dark-text-secondary ml-16">
                    Détail de vos performances pour chaque discipline sur la période sélectionnée
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {typeStats.map((typeData) => (
                    <ActivityTypeCard key={typeData.type} typeData={typeData} formatDistance={formatDistance} formatDuration={formatDuration} />
                  ))}
                </div>
              </div>
            )}

            {/* Dernières activités */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">Dernières activités</h3>
                <button
                  onClick={() => navigate('/activities')}
                  className="text-sm text-brand hover:text-brand-dark dark:text-brand dark:hover:text-brand-light font-medium"
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
                  <p className="text-center text-text-muted dark:text-dark-text-secondary py-4">Aucune activité récente</p>
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
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary mb-2">{label}</p>
      <p className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast">{value}</p>
    </div>
  )
}

function ActivityTypeCard({
  typeData,
  formatDistance,
  formatDuration,
}: {
  typeData: ActivityTypeStats
  formatDistance: (meters: number) => string
  formatDuration: (seconds: number) => string
}) {
  const config = activityTypeConfig[typeData.type] || {
    bgColor: 'bg-gray-50',
    bgDark: 'dark:bg-gray-950/30',
    color: 'text-gray-600',
    colorDark: 'dark:text-gray-400',
  }

  return (
    <div className={`rounded-2xl border-3 border-panel-border p-7 ${config.bgColor} ${config.bgDark} transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-opacity-80 cursor-default`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="text-5xl">{typeData.icon}</div>
        <div>
          <h3 className={`text-2xl font-bold ${config.color} ${config.colorDark}`}>{typeData.type}</h3>
          <p className="text-sm font-medium text-text-muted dark:text-dark-text-secondary">
            {typeData.count} sortie{typeData.count > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <StatRow label="Distance" value={formatDistance(typeData.totalDistance)} />
        <StatRow label="Durée" value={formatDuration(typeData.totalDuration)} />
        {typeData.totalElevation > 0 && (
          <StatRow label="Dénivelé +" value={`${Math.round(typeData.totalElevation)} m`} />
        )}
        {typeData.averageSpeed && (
          <StatRow label="Vitesse moy." value={`${typeData.averageSpeed.toFixed(1)} km/h`} />
        )}
        {typeData.averageHeartRate && (
          <StatRow label="FC moyenne" value={`${typeData.averageHeartRate} bpm`} />
        )}
        {typeData.totalTrimp > 0 && (
          <StatRow label="TRIMP total" value={`${Math.round(typeData.totalTrimp)}`} />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-muted dark:text-dark-text-secondary">Moy./sortie</p>
            <p className="font-semibold text-text-dark dark:text-dark-text-contrast">
              {formatDistance(typeData.averageDistance)}
            </p>
          </div>
          <div>
            <p className="text-text-muted dark:text-dark-text-secondary">Durée moy.</p>
            <p className="font-semibold text-text-dark dark:text-dark-text-contrast">
              {formatDuration(typeData.averageDuration)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-muted dark:text-dark-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-dark dark:text-dark-text-contrast">{value}</span>
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
  const config = activityTypeConfig[activity.type] || { icon: '📈' }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 border border-border-base rounded-2xl hover:border-brand/40 hover:bg-bg-gray-100 dark:hover:bg-dark-border/20 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-bg-gray-100 dark:bg-dark-border/40 flex items-center justify-center text-lg">
          {config.icon}
        </div>
        <div>
          <p className="font-medium text-text-dark dark:text-dark-text-contrast">{activity.type}</p>
          <p className="text-xs text-text-muted dark:text-dark-text-secondary">
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
        <p className="text-xs text-text-muted dark:text-dark-text-secondary">{formatDuration(activity.duration)}</p>
      </div>
    </button>
  )
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="glass-panel p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
          Aucune activité pour le moment
        </h3>
        <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
          Importez vos fichiers FIT, GPX ou CSV pour commencer à suivre votre charge d'entraînement.
        </p>
        <button onClick={onImport} className="btn-primary">
          Importer une activité
        </button>
      </div>
    </div>
  )
}
