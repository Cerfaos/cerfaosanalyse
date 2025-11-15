import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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

interface ActivityTimelinePoint {
  date: string
  label: string
  distanceKm: number
  duration: number
  trimp: number
  count: number
}

interface WeightEntry {
  id: number
  date: string
  weight: number
  notes: string | null
  createdAt: string
}

interface WeightStats {
  count: number
  min: number | null
  max: number | null
  average: number | null
  current: number | null
  trend30Days: number | null
  trend90Days: number | null
  firstDate: string | null
  lastDate: string | null
}

const periodOptions: { value: 'day' | '7' | '30' | '90' | '365' | 'custom'; label: string }[] = [
  { value: 'day', label: "Aujourd'hui" },
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
  { value: '365', label: 'Année' },
  { value: 'custom', label: 'Personnalisé' },
]

const periodDetails: Record<string, { title: string; subtitle: string; icon: string; accent: string }> = {
  day: { title: "Aujourd'hui", subtitle: 'Focus quotidien', icon: '☀️', accent: 'from-sky-500/25 via-sky-500/10' },
  '7': { title: '7 jours', subtitle: 'Vue hebdo', icon: '📅', accent: 'from-blue-500/25 via-blue-500/10' },
  '30': { title: '30 jours', subtitle: 'Bilan mensuel', icon: '🗓️', accent: 'from-emerald-500/25 via-emerald-500/10' },
  '90': { title: '90 jours', subtitle: 'Tendance trimestrielle', icon: '📈', accent: 'from-orange-500/25 via-orange-500/10' },
  '365': { title: 'Année', subtitle: 'Macro objectif', icon: '🏆', accent: 'from-purple-500/25 via-purple-500/10' },
  'custom': { title: 'Personnalisé', subtitle: 'Choisissez un mois précis', icon: '✨', accent: 'from-pink-500/25 via-pink-500/10' },
}

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

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getActivityDay = (dateString: string) => {
  if (!dateString) return ''
  const [day] = dateString.split('T')
  return day
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'day' | '7' | '30' | '90' | '365' | 'custom'>('30')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [typeStats, setTypeStats] = useState<ActivityTypeStats[]>([])
  const [typeTotals, setTypeTotals] = useState<Record<string, number>>({})
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimelinePoint[]>([])
  const [weightStats, setWeightStats] = useState<WeightStats | null>(null)
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [period, selectedMonth, selectedYear, selectedTypes])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      await Promise.all([loadTypeStats(), loadRecentActivities(), loadWeightData()])
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivities = async () => {
    const activitiesResponse = await api.get('/api/activities', {
      params: { limit: 5, page: 1 },
    })
    setRecentActivities(activitiesResponse.data.data.data)
  }

  const loadWeightData = async () => {
    try {
      const [historiesRes, statsRes] = await Promise.all([
        api.get('/api/weight-histories'),
        api.get('/api/weight-histories/stats'),
      ])

      setWeightEntries(historiesRes.data.data.data || [])
      setWeightStats(statsRes.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des données de poids:', error)
    }
  }

  const loadTypeStats = async () => {
    try {
      const periodBounds = getPeriodRange()
      const params: Record<string, string | number> = { limit: 1500, page: 1 }
      if (periodBounds.startDate) params.startDate = periodBounds.startDate
      if (periodBounds.endDate) params.endDate = periodBounds.endDate

      const response = await api.get('/api/activities', { params })
      const allActivities: Activity[] = response.data.data.data

      // Extraire tous les types disponibles
      const types = [...new Set(allActivities.map((a) => a.type))]
      setAvailableTypes(types)

      // Filtrer par période
      let activitiesInPeriod: Activity[] = allActivities
      if (periodBounds.startDate && periodBounds.endDate) {
        const start = periodBounds.startDate
        const end = periodBounds.endDate
        activitiesInPeriod = allActivities.filter((a) => {
          const activityDay = getActivityDay(a.date)
          return activityDay >= start && activityDay <= end
        })
      }

      // Filtrer par types sélectionnés
      if (selectedTypes.length > 0) {
        activitiesInPeriod = activitiesInPeriod.filter((a) => selectedTypes.includes(a.type))
      }

      const totals: Record<string, number> = {}
      activitiesInPeriod.forEach((activity) => {
        totals[activity.type] = (totals[activity.type] || 0) + 1
      })
      setTypeTotals(totals)

      // Construire la timeline quotidienne pour l'affichage graphique
      const timelineMap = new Map<string, { distance: number; duration: number; trimp: number; count: number }>()
      activitiesInPeriod.forEach((activity) => {
        const dayKey = getActivityDay(activity.date)
        if (!timelineMap.has(dayKey)) {
          timelineMap.set(dayKey, { distance: 0, duration: 0, trimp: 0, count: 0 })
        }
        const day = timelineMap.get(dayKey)!
        day.distance += activity.distance
        day.duration += activity.duration
        day.trimp += activity.trimp || 0
        day.count += 1
      })

      const timelineArray: ActivityTimelinePoint[] = Array.from(timelineMap.entries())
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([date, value]) => ({
          date,
          label: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          distanceKm: Number((value.distance / 1000).toFixed(2)),
          duration: value.duration,
          trimp: Math.round(value.trimp),
          count: value.count,
        }))

      setActivityTimeline(timelineArray)

      // Calculer les statistiques globales
      const totalActivities = activitiesInPeriod.length
      const totalDistance = activitiesInPeriod.reduce((sum, a) => sum + a.distance, 0)
      const totalDuration = activitiesInPeriod.reduce((sum, a) => sum + a.duration, 0)
      const totalTrimp = Math.round(activitiesInPeriod.reduce((sum, a) => sum + (a.trimp || 0), 0))

      const activitiesWithHR = activitiesInPeriod.filter((a) => a.avgHeartRate)
      const averageHeartRate = activitiesWithHR.length > 0
        ? Math.round(activitiesWithHR.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) / activitiesWithHR.length)
        : null

      setStats({
        totalActivities,
        totalDistance,
        totalDuration,
        totalTrimp,
        averageDistance: totalActivities > 0 ? totalDistance / totalActivities : 0,
        averageDuration: totalActivities > 0 ? totalDuration / totalActivities : 0,
        averageHeartRate,
        byType: [],
      })

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

  const getPeriodRange = () => {
    let startDate: string | null = null
    let endDate: string | null = null

    if (period === 'custom') {
      const firstDay = new Date(selectedYear, selectedMonth, 1)
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
      startDate = formatDateLocal(firstDay)
      endDate = formatDateLocal(lastDay)
    } else {
      const now = new Date()
      if (period === 'day') {
        const today = formatDateLocal(now)
        startDate = today
        endDate = today
      } else {
        const periodDays = parseInt(period)
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - (periodDays - 1))
        fromDate.setHours(0, 0, 0, 0)
        startDate = formatDateLocal(fromDate)
        endDate = formatDateLocal(now)
      }
    }

    return { startDate, endDate }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'day':
        return "Aujourd'hui"
      case '7':
        return '7 derniers jours'
      case '30':
        return '30 derniers jours'
      case '90':
        return '90 derniers jours'
      case '365':
        return 'Cette année'
      case 'custom':
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        return `${monthNames[selectedMonth]} ${selectedYear}`
    }
  }

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const resetFilters = () => {
    const now = new Date()
    setPeriod('30')
    setSelectedTypes([])
    setSelectedMonth(now.getMonth())
    setSelectedYear(now.getFullYear())
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
        {/* Filtres */}
        <div className="glass-panel p-6 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted dark:text-dark-text-secondary">Filtres intelligents</p>
              <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast">Affinez vos statistiques</h3>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm font-medium text-text-muted hover:text-text-dark dark:text-dark-text-secondary dark:hover:text-dark-text-contrast underline-offset-4 hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-dark dark:text-dark-text-contrast mb-4">Période</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {periodOptions.map((option) => (
                <PeriodCard
                  key={option.value}
                  option={option}
                  isActive={period === option.value}
                  onSelect={() => setPeriod(option.value)}
                />
              ))}
            </div>
          </div>

          {/* Sélecteurs de mois et année (mode personnalisé) */}
          {period === 'custom' && (
            <div className="rounded-2xl border border-panel-border bg-bg-subtle/40 dark:bg-dark-border/20 p-4">
              <p className="text-sm font-semibold text-text-dark dark:text-dark-text-contrast mb-3">Sélectionner le mois et l'année</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2.5 rounded-xl border-2 border-panel-border bg-white dark:bg-dark-surface text-text-dark dark:text-dark-text-contrast font-medium text-sm focus:outline-none focus:border-brand transition-colors"
                >
                  {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2.5 rounded-xl border-2 border-panel-border bg-white dark:bg-dark-surface text-text-dark dark:text-dark-text-contrast font-medium text-sm focus:outline-none focus:border-brand transition-colors"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Filtres par type d'activité */}
          {availableTypes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-text-dark dark:text-dark-text-contrast">Types d'activités</p>
                  <p className="text-xs text-text-muted dark:text-dark-text-secondary">Touchez pour afficher/masquer une discipline</p>
                </div>
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="text-xs text-brand hover:text-brand-dark dark:text-brand dark:hover:text-brand-light font-medium"
                  >
                    Tout afficher
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {availableTypes.map((type) => {
                  const config = activityTypeConfig[type] || {
                    icon: '📈',
                    color: 'text-gray-600',
                    colorDark: 'dark:text-gray-400',
                    bgColor: 'bg-gray-50',
                    bgDark: 'dark:bg-gray-950/30',
                  }
                  const isSelected = selectedTypes.length === 0 || selectedTypes.includes(type)
                  return (
                    <TypeChip
                      key={type}
                      label={type}
                      icon={config.icon}
                      count={typeTotals[type] || 0}
                      selected={isSelected}
                      onClick={() => toggleType(type)}
                    />
                  )
                })}
              </div>
            </div>
          )}
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 min-w-0">
                <ActivityTimelineCard data={activityTimeline} formatDuration={formatDuration} />
              </div>
              <div className="min-w-0">
                <WeightSummaryCard stats={weightStats} entries={weightEntries} onNavigate={() => navigate('/weight')} />
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

function ActivityTimelineCard({
  data,
  formatDuration,
}: {
  data: ActivityTimelinePoint[]
  formatDuration: (seconds: number) => string
}) {
  const totalDistance = data.reduce((sum, day) => sum + day.distanceKm, 0)
  const totalTrimp = data.reduce((sum, day) => sum + day.trimp, 0)
  const bestDistanceDay = data.reduce<ActivityTimelinePoint | null>((best, day) => {
    if (!best || day.distanceKm > best.distanceKm) return day
    return best
  }, null)
  const bestTrimpDay = data.reduce<ActivityTimelinePoint | null>((best, day) => {
    if (!best || day.trimp > best.trimp) return day
    return best
  }, null)

  return (
    <div className="glass-panel p-6 h-full min-w-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary">Charge journalière</p>
          <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast">Volumes d'activité</h3>
        </div>
        {data.length > 0 && (
          <span className="text-xs text-text-muted dark:text-dark-text-secondary">
            {data.length} jour{data.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {data.length > 0 ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trimpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis
                yAxisId="distance"
                stroke="#94a3b8"
                tickFormatter={(value) => `${value} km`}
                width={55}
              />
              <YAxis
                yAxisId="trimp"
                orientation="right"
                stroke="#fdba74"
                tickFormatter={(value) => `${value}`}
                width={45}
              />
              <Tooltip content={<ActivityTimelineTooltip formatDuration={formatDuration} />} />
              <Area yAxisId="distance" type="monotone" dataKey="distanceKm" stroke="#6366f1" fill="url(#distanceGradient)" strokeWidth={2} />
              <Area yAxisId="trimp" type="monotone" dataKey="trimp" stroke="#f97316" fill="url(#trimpGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-text-muted dark:text-dark-text-secondary">
          Pas assez d'activités pour tracer un graphique sur cette période.
        </p>
      )}

      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-bg-gray-100 dark:bg-dark-border/30 p-4">
            <p className="text-text-muted dark:text-dark-text-secondary">Distance cumulée</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">{totalDistance.toFixed(1)} km</p>
          </div>
          <div className="rounded-xl bg-bg-gray-100 dark:bg-dark-border/30 p-4">
            <p className="text-text-muted dark:text-dark-text-secondary">Jour le plus long</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">
              {bestDistanceDay ? `${bestDistanceDay.label} · ${bestDistanceDay.distanceKm.toFixed(1)} km` : '—'}
            </p>
            {bestDistanceDay && (
              <p className="text-xs text-text-muted dark:text-dark-text-secondary">
                {bestDistanceDay.count} sortie{bestDistanceDay.count > 1 ? 's' : ''} · {formatDuration(bestDistanceDay.duration)}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-bg-gray-100 dark:bg-dark-border/30 p-4">
            <p className="text-text-muted dark:text-dark-text-secondary">TRIMP cumulé</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">{Math.round(totalTrimp)} pts</p>
            {bestTrimpDay && (
              <p className="text-xs text-text-muted dark:text-dark-text-secondary">
                Pic : {bestTrimpDay.label} ({bestTrimpDay.trimp} pts)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityTimelineTooltip({
  active,
  payload,
  formatDuration,
}: {
  active?: boolean
  payload?: { payload: ActivityTimelinePoint }[]
  formatDuration: (seconds: number) => string
}) {
  if (!active || !payload || payload.length === 0) return null

  const day = payload[0].payload as ActivityTimelinePoint

  return (
    <div className="rounded-xl border border-panel-border bg-white/90 px-4 py-3 text-xs shadow-xl dark:bg-dark-surface/90">
      <p className="font-semibold text-text-dark dark:text-dark-text-contrast">{day.label}</p>
      <p className="text-text-muted dark:text-dark-text-secondary">
        {day.count} activité{day.count > 1 ? 's' : ''}
      </p>
      <p className="mt-2 text-text-dark dark:text-dark-text-contrast">{day.distanceKm.toFixed(1)} km</p>
      <p className="text-text-muted dark:text-dark-text-secondary">{formatDuration(day.duration)}</p>
      <p className="mt-1 text-text-muted dark:text-dark-text-secondary">TRIMP : {day.trimp}</p>
    </div>
  )
}

function WeightSummaryCard({
  stats,
  entries,
  onNavigate,
}: {
  stats: WeightStats | null
  entries: WeightEntry[]
  onNavigate: () => void
}) {
  const latestEntry = entries[0]
  const chartData = entries
    .slice(0, 12)
    .reverse()
    .map((entry) => ({
      label: new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      weight: entry.weight,
    }))

  const formatWeightDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })

  const getTrendText = (trend: number | null) => {
    if (trend === null) return 'Stable'
    if (trend > 0) return `+${trend.toFixed(1)} kg`
    if (trend < 0) return `${trend.toFixed(1)} kg`
    return 'Stable'
  }

  const getTrendColor = (trend: number | null) => {
    if (trend === null) return 'text-text-muted dark:text-dark-text-secondary'
    if (trend > 0) return 'text-error'
    if (trend < 0) return 'text-success'
    return 'text-text-muted dark:text-dark-text-secondary'
  }

  const displayedWeight = latestEntry?.weight ?? stats?.current

  if (entries.length === 0) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center text-center gap-4">
        <div className="text-5xl">⚖️</div>
        <div>
          <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">Aucune pesée enregistrée</p>
          <p className="text-sm text-text-muted dark:text-dark-text-secondary">
            Ajoutez vos mesures pour suivre l'évolution de votre poids depuis ce tableau de bord.
          </p>
        </div>
        <button onClick={onNavigate} className="btn-primary px-5 py-2">
          Ajouter une pesée
        </button>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 h-full flex flex-col min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary">Suivi du poids</p>
          <h3 className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast">
            {displayedWeight !== undefined ? `${displayedWeight.toFixed(1)} kg` : '-- kg'}
          </h3>
          <p className="text-sm text-text-muted dark:text-dark-text-secondary">
            {latestEntry ? `Dernière pesée ${formatWeightDate(latestEntry.date)}` : 'Aucune pesée enregistrée'}
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="text-sm font-medium text-brand hover:text-brand-dark dark:text-brand dark:hover:text-brand-light"
        >
          Gérer →
        </button>
      </div>

      <div className="mt-4 h-32">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  borderRadius: 12,
                  borderColor: '#1e293b',
                  color: '#f8fafc',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted dark:text-dark-text-secondary">
            Ajoutez plusieurs pesées pour afficher une tendance
          </div>
        )}
      </div>

      {stats ? (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-muted dark:text-dark-text-secondary">Moyenne</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">
              {stats.average ? `${stats.average.toFixed(1)} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-text-muted dark:text-dark-text-secondary">Plage</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">
              {stats.min !== null && stats.max !== null ? `${stats.min.toFixed(1)} – ${stats.max.toFixed(1)} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-text-muted dark:text-dark-text-secondary">Trend 30 jours</p>
            <p className={`text-lg font-semibold ${getTrendColor(stats.trend30Days)}`}>{getTrendText(stats.trend30Days)}</p>
          </div>
          <div>
            <p className="text-text-muted dark:text-dark-text-secondary">Trend 90 jours</p>
            <p className={`text-lg font-semibold ${getTrendColor(stats.trend90Days)}`}>{getTrendText(stats.trend90Days)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-muted dark:text-dark-text-secondary">
          Ajoutez vos pesées pour suivre vos progrès directement depuis ce tableau de bord.
        </p>
      )}
    </div>
  )
}

function PeriodCard({
  option,
  isActive,
  onSelect,
}: {
  option: { value: 'day' | '7' | '30' | '90' | '365' | 'custom'; label: string }
  isActive: boolean
  onSelect: () => void
}) {
  const info = periodDetails[option.value]
  const gradient = info ? `bg-gradient-to-br ${info.accent} to-transparent` : ''

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
        isActive
          ? `border-brand bg-white dark:bg-dark-surface shadow-lg ring-2 ring-brand/20 ${gradient}`
          : 'border-panel-border bg-white dark:bg-dark-surface hover:border-brand/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl">{info?.icon}</span>
        {isActive && <span className="text-[10px] uppercase tracking-[0.3em] text-brand">Actif</span>}
      </div>
      <p className="mt-2 text-base font-semibold text-text-dark dark:text-dark-text-contrast">{info?.title ?? option.label}</p>
      <p className="text-xs text-text-muted dark:text-dark-text-secondary">{info?.subtitle}</p>
    </button>
  )
}

function TypeChip({
  label,
  icon,
  count,
  selected,
  onClick,
}: {
  label: string
  icon: string
  count: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-2 text-left transition ${
        selected
          ? 'border-brand/70 bg-brand/5 text-text-dark dark:text-dark-text-contrast shadow-sm'
          : 'border-panel-border bg-white dark:bg-dark-surface text-text-muted dark:text-dark-text-secondary hover:border-brand/40'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex flex-col text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-[11px] uppercase tracking-wide text-text-muted dark:text-dark-text-secondary">{count} activité{count > 1 ? 's' : ''}</span>
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
