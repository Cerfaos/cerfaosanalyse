import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import AppLayout from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import api from '../services/api'

type ZoneComputationSource = 'samples' | 'average' | 'none'

interface HeartRateZone {
  zone: number
  name: string
  description: string
  min: number
  max: number
  color: string
}

interface ZoneDistribution extends HeartRateZone {
  seconds: number
  hours: number
  percentage: number
}

interface ActivityZoneDuration {
  zone: number
  label: string
  seconds: number
  percentage: number
  color: string
}

interface CyclingActivity {
  id: number
  date: string
  type: string
  subSport: string | null
  isIndoor: boolean
  duration: number
  distance: number
  avgHeartRate: number | null
  maxHeartRate: number | null
  trimp: number | null
  zoneDurations: ActivityZoneDuration[]
  dominantZone: number
  dominantZoneLabel: string
  dataSource: ZoneComputationSource
}

interface TypeSummary {
  type: string
  count: number
  duration: number
  distance: number
  trimp: number
  indoor: number
  outdoor: number
}

interface PolarizationSummary {
  totals: {
    low: number
    moderate: number
    high: number
  }
  percentages: {
    low: number
    moderate: number
    high: number
  }
  target: {
    low: number
    moderate: number
    high: number
  }
  score: number
  focus: string
  message: string
}

interface CyclingStatsPayload {
  filters: {
    period: string
    startDate: string | null
    endDate: string | null
    types: string | null
    indoor: string | null
  }
  summary: {
    sessions: number
    totalDistance: number
    totalDuration: number
    totalTrimp: number
    avgHeartRate: number | null
    avgSpeed: number | null
    indoorCount: number
    outdoorCount: number
  }
  availableTypes: string[]
  byType: TypeSummary[]
  heartRateZones: HeartRateZone[]
  zoneDistribution: ZoneDistribution[]
  polarization: PolarizationSummary
  sampling: Record<ZoneComputationSource, number>
  activities: CyclingActivity[]
}

const periodOptions = [
  { label: '7 jours', value: '7' },
  { label: '30 jours', value: '30' },
  { label: '90 jours', value: '90' },
  { label: '1 an', value: '365' },
  { label: 'Tout', value: 'all' },
]

const dataSourceLabels: Record<ZoneComputationSource, string> = {
  samples: 'Trace cardio',
  average: 'FC moyenne',
  none: 'Non disponible',
}

const intensityColors = {
  low: '#0EA5E9',
  moderate: '#FACC15',
  high: '#EF4444',
}

const formatDuration = (seconds: number) => {
  const totalSeconds = Math.round(seconds || 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`
  }
  if (minutes > 0) {
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`
  }
  return `${secs}s`
}

const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)} km`

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

const typeColors: Record<string, string> = {
  Cyclisme: '#3B82F6',
  Course: '#F97316',
  Rameur: '#06B6D4',
  Natation: '#0EA5E9',
  Marche: '#22C55E',
  Randonnée: '#A855F7',
  Musculation: '#EF4444',
  Yoga: '#EC4899',
}

const indoorOptions = [
  { label: 'Tous', value: '' },
  { label: 'Extérieur', value: 'false' },
  { label: 'Intérieur', value: 'true' },
]

export default function CyclingStats() {
  const [period, setPeriod] = useState('90')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [indoorFilter, setIndoorFilter] = useState('')
  const [stats, setStats] = useState<CyclingStatsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadStats = async () => {
      setLoading(true)
      setError('')
      try {
        const params: Record<string, string> = { period }
        if (selectedTypes.length > 0) {
          params.types = selectedTypes.join(',')
        }
        if (indoorFilter) {
          params.indoor = indoorFilter
        }
        const response = await api.get('/api/activities/cycling-stats', { params })
        if (mounted) {
          setStats(response.data.data)
        }
      } catch (err) {
        // Silencieux - données optionnelles
        if (mounted) {
          let message = 'Impossible de charger les statistiques cardio'
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } }
            message = axiosErr.response?.data?.message || message
          } else if (err instanceof Error) {
            message = err.message
          }
          setError(message)
          setStats(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadStats()
    return () => {
      mounted = false
    }
  }, [period, selectedTypes, indoorFilter])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const durationHours = useMemo(() => {
    if (!stats) return 0
    return stats.summary.totalDuration / 3600
  }, [stats])

  const analysisRangeLabel = useMemo(() => {
    if (!stats?.filters.startDate) {
      return 'Historique sélectionné'
    }
    const startFormatted = formatDate(stats.filters.startDate)
    const endSource = stats.filters.endDate ?? stats.filters.startDate
    const endFormatted = formatDate(endSource)
    return `Du ${startFormatted} au ${endFormatted}`
  }, [stats])

  return (
    <AppLayout
      title="Cartographie FC"
      description="Analyse cardio, zones d'intensité et polarisation de toutes vos activités"
    >
      <div className="mb-6">
        <PageHeader
          eyebrow="Analyse cardio"
          title="Cartographie FC"
          description="Zones d'intensité, polarisation et répartition de toutes vos activités (cyclisme, rameur, course, etc.)"
          icon="cyclingStats"
          gradient="from-[#FF5252] to-[#5CE1E6]"
          accentColor="#FF5252"
        />
      </div>

      <section className="glass-panel p-6 space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary">
              Période d'analyse
            </p>
            <p className="text-lg font-display text-text-dark dark:text-dark-text-contrast">
              {analysisRangeLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  period === option.value
                    ? 'bg-[#8BC34A] text-white shadow-md'
                    : 'bg-[#0A191A]/60 border border-[#8BC34A]/20 text-gray-400 hover:text-white hover:border-[#8BC34A]/40'
                }`}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtres par type d'activité */}
        {stats?.availableTypes && stats.availableTypes.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Types d'activités</p>
              <div className="flex flex-wrap gap-2">
                {stats.availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedTypes.length === 0 || selectedTypes.includes(type)
                        ? 'text-white shadow-sm'
                        : 'bg-[#0A191A]/60 border border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor:
                        selectedTypes.length === 0 || selectedTypes.includes(type)
                          ? typeColors[type] || '#6B7280'
                          : undefined,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: typeColors[type] || '#6B7280' }}
                    />
                    {type}
                    {stats.byType.find((t) => t.type === type)?.count && (
                      <span className="opacity-75">
                        ({stats.byType.find((t) => t.type === type)?.count})
                      </span>
                    )}
                  </button>
                ))}
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Filtre indoor/outdoor */}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Lieu</p>
              <div className="flex gap-2">
                {indoorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setIndoorFilter(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      indoorFilter === option.value
                        ? 'bg-[#5CE1E6] text-[#0A191A] shadow-sm'
                        : 'bg-[#0A191A]/60 border border-[#5CE1E6]/20 text-gray-400 hover:border-[#5CE1E6]/40'
                    }`}
                  >
                    {option.label}
                    {option.value === 'true' && stats.summary.indoorCount > 0 && (
                      <span className="ml-1 opacity-75">({stats.summary.indoorCount})</span>
                    )}
                    {option.value === 'false' && stats.summary.outdoorCount > 0 && (
                      <span className="ml-1 opacity-75">({stats.summary.outdoorCount})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 border border-danger/40 bg-danger/5 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
            <p className="text-sm text-text-secondary">Volume</p>
            <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
              {stats ? formatDistance(stats.summary.totalDistance) : '--'}
            </p>
            <p className="text-xs text-text-muted">Sur {stats?.summary.sessions || 0} sorties</p>
          </div>
          <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
            <p className="text-sm text-text-secondary">Temps passé</p>
            <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
              {stats ? formatDuration(stats.summary.totalDuration) : '--'}
            </p>
            <p className="text-xs text-text-muted">{durationHours.toFixed(1)} h cumulées</p>
          </div>
          <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
            <p className="text-sm text-text-secondary">Cardio moyen</p>
            <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
              {stats?.summary.avgHeartRate ? `${stats.summary.avgHeartRate} bpm` : '--'}
            </p>
            <p className="text-xs text-text-muted">
              Vitesse moyenne {stats?.summary.avgSpeed ? `${stats.summary.avgSpeed} km/h` : '--'}
            </p>
          </div>
          <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
            <p className="text-sm text-text-secondary">Charge (TRIMP)</p>
            <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
              {stats?.summary.totalTrimp ?? '--'}
            </p>
            <p className="text-xs text-text-muted">
              Score de polarisation{' '}
              {stats?.polarization ? `${stats.polarization.score.toFixed(1)}%` : '--'}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="glass-panel p-6">
          <p className="text-center text-text-secondary">Chargement des insights cyclisme...</p>
        </div>
      ) : !stats ? (
        <div className="glass-panel p-6">
          <p className="text-center text-text-secondary">Aucune donnée cyclisme disponible.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card
            title="Zones de fréquence cardiaque"
            description="Plages Karvonen calculées depuis votre profil, utilisées pour les analyses ci-dessous."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.heartRateZones.map((zone) => (
                <div
                  key={zone.zone}
                  className="rounded-2xl border border-border-base p-4 shadow-sm"
                  style={{ borderTopColor: zone.color, borderTopWidth: '4px' }}
                >
                  <p className="text-xs font-semibold text-text-secondary mb-1">Zone {zone.zone}</p>
                  <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">
                    {zone.name}
                  </p>
                  <p className="text-2xl font-display text-text-dark dark:text-dark-text-contrast mt-2">
                    {zone.min}-{zone.max} bpm
                  </p>
                  <p className="text-xs text-text-muted mt-2 leading-snug">{zone.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="Répartition des zones"
              description="Temps passé dans chaque zone sur la période sélectionnée"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.zoneDistribution}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'rgba(10, 25, 26, 0.95)',
                        border: '1px solid rgba(139, 195, 74, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Temps']}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                      {stats.zoneDistribution.map((zone) => (
                        <Cell key={zone.zone} fill={zone.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {stats.zoneDistribution.map((zone) => (
                  <div key={zone.zone} className="p-3 rounded-xl border border-[#8BC34A]/20 bg-[#0A191A]/40 hover:border-[#8BC34A]/40 transition-colors">
                    <p className="text-sm font-semibold text-white">
                      {zone.name}
                    </p>
                    <p className="text-xs text-gray-400">{zone.description}</p>
                    <p className="text-lg font-display mt-2 text-[#8BC34A]">{zone.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{formatDuration(zone.seconds)}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Index de polarisation 80/10/10"
              description="Idéal: 80% en endurance (Z1-Z2), 10% tempo (Z3), 10% haute intensité (Z4-Z5)."
            >
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-brand/20">
                  <p className="text-sm text-text-secondary">Score</p>
                  <p className="text-4xl font-semibold text-text-dark dark:text-dark-text-contrast">
                    {stats.polarization.score.toFixed(1)}%
                  </p>
                  <p className="text-sm text-text-muted mt-2">{stats.polarization.message}</p>
                </div>
                {(['low', 'moderate', 'high'] as const).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>
                        {key === 'low'
                          ? 'Z1-Z2 • Endurance'
                          : key === 'moderate'
                          ? 'Z3 • Tempo'
                          : 'Z4-Z5 • Haute intensité'}
                      </span>
                      <span>
                        {stats.polarization.percentages[key].toFixed(1)}% • cible{' '}
                        {stats.polarization.target[key]}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border-base overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${stats.polarization.percentages[key]}%`,
                          backgroundColor: intensityColors[key],
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {formatDuration(stats.polarization.totals[key])}
                    </p>
                  </div>
                ))}
                <div className="rounded-xl border border-border-base p-3 text-sm text-text-secondary">
                  <p className="font-semibold mb-1">Qualité des données</p>
                  <p>
                    {stats.sampling.samples} sorties avec trace cardio • {stats.sampling.average} estimées via FC
                    moyenne • {stats.sampling.none} sans données
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Analyse par sortie"
            description="Temps passé dans chaque zone, TRIMP et zone dominante pour vos dernières activités."
          >
            {stats.activities.length === 0 ? (
              <p className="text-center text-text-secondary py-6">
                Aucune activité sur cette période.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-border-base p-4 hover:border-brand/40 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: typeColors[activity.type] || '#6B7280' }}
                          >
                            {activity.type}
                          </span>
                          {activity.subSport && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-200">
                              {activity.subSport}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              activity.isIndoor
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {activity.isIndoor ? 'Intérieur' : 'Extérieur'}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {formatDate(activity.date)} • {formatTime(activity.date)}
                        </p>
                        <p className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast">
                          {formatDistance(activity.distance)} • {formatDuration(activity.duration)}
                        </p>
                        <p className="text-xs text-text-muted">
                          Source: {dataSourceLabels[activity.dataSource]}
                        </p>
                        {activity.dataSource === 'average' && (
                          <p className="text-xs text-warning mt-1">
                            Estimation via FC moyenne : répartition estimée avec {activity.dominantZoneLabel} comme zone
                            dominante (60%), zones adjacentes (35%), reste dispersé.
                          </p>
                        )}
                        {activity.dataSource === 'none' && (
                          <p className="text-xs text-warning mt-1">
                            Pas de trace cardio: la répartition reste indicative.
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-display">
                          {activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : '--'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Zone dominante: {activity.dominantZoneLabel}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex h-3 rounded-full overflow-hidden bg-border-base/40">
                        {activity.zoneDurations.map((zone) => (
                          <div
                            key={zone.zone}
                            className="h-full"
                            style={{
                              flex: Math.max(zone.seconds, 0.5),
                              backgroundColor: zone.color,
                            }}
                            title={`${zone.label} • ${zone.percentage.toFixed(1)}% (${formatDuration(zone.seconds)})`}
                          ></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-text-secondary">
                        <p>FC max: {activity.maxHeartRate ? `${activity.maxHeartRate} bpm` : '--'}</p>
                        <p>TRIMP: {activity.trimp ?? '--'}</p>
                        <p>Zone dominante: {activity.dominantZone}</p>
                        <p>Données: {dataSourceLabels[activity.dataSource]}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        {activity.zoneDurations.map((zone) => (
                          <div
                            key={zone.zone}
                            className="rounded-lg border border-border-base p-2 flex flex-col"
                          >
                            <span className="font-semibold text-text-dark dark:text-dark-text-contrast">
                              {zone.label}
                            </span>
                            <span className="text-text-secondary">
                              {zone.percentage.toFixed(1)}% • {formatDuration(zone.seconds)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
