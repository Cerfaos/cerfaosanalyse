import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import AppLayout from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
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
  }
  summary: {
    sessions: number
    totalDistance: number
    totalDuration: number
    totalTrimp: number
    avgHeartRate: number | null
    avgSpeed: number | null
  }
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

export default function CyclingStats() {
  const [period, setPeriod] = useState('90')
  const [stats, setStats] = useState<CyclingStatsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadStats = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/api/activities/cycling-stats', {
          params: { period },
        })
        if (mounted) {
          setStats(response.data.data)
        }
      } catch (err) {
        console.error('Erreur chargement stats cyclisme:', err)
        if (mounted) {
          let message = 'Impossible de charger les statistiques cyclisme'
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
  }, [period])

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
      description="Analyse cardio, zones d'intensité et polarisation de vos sorties 🚴"
    >
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
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-white/80 dark:bg-dark-surface/50 text-text-secondary hover:text-text-dark dark:hover:text-dark-text-contrast'
                }`}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

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
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Temps']} />
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
                  <div key={zone.zone} className="p-3 rounded-xl border border-border-base">
                    <p className="text-sm font-semibold text-text-dark dark:text-dark-text-contrast">
                      {zone.name}
                    </p>
                    <p className="text-xs text-text-muted">{zone.description}</p>
                    <p className="text-lg font-display mt-2">{zone.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-text-muted">{formatDuration(zone.seconds)}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Index de polarisation 80/10/10"
              description="Idéal: 80% en endurance (Z1-Z2), 10% tempo (Z3), 10% haute intensité (Z4-Z5)."
            >
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-dark-surface/60">
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
                Aucune sortie cycliste sur cette période.
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
