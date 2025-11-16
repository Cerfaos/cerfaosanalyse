import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../services/api'

interface ZoneData {
  period: string
  zone1: number
  zone2: number
  zone3: number
  zone4: number
  zone5: number
}

interface ZoneConfig {
  key: string
  name: string
  color: string
  description: string
}

const zones: ZoneConfig[] = [
  { key: 'zone1', name: 'Z1 - Récupération', color: '#94A3B8', description: '50-60% FCmax' },
  { key: 'zone2', name: 'Z2 - Endurance', color: '#22C55E', description: '60-70% FCmax' },
  { key: 'zone3', name: 'Z3 - Tempo', color: '#F59E0B', description: '70-80% FCmax' },
  { key: 'zone4', name: 'Z4 - Seuil', color: '#EF4444', description: '80-90% FCmax' },
  { key: 'zone5', name: 'Z5 - VO2max', color: '#8B5CF6', description: '90-100% FCmax' },
]

export default function ZoneProgressionChart() {
  const [data, setData] = useState<ZoneData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('monthly')
  const [displayMode, setDisplayMode] = useState<'stacked' | 'percentage'>('stacked')

  useEffect(() => {
    fetchData()
  }, [viewMode])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/activities?limit=1000')
      const activities = response.data.data.activities || []

      // Grouper par période
      const grouped = groupByPeriod(activities, viewMode)
      setData(grouped)
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupByPeriod = (activities: any[], mode: 'weekly' | 'monthly'): ZoneData[] => {
    const periods: Record<string, { zone1: number; zone2: number; zone3: number; zone4: number; zone5: number }> = {}

    activities.forEach((activity: any) => {
      const date = new Date(activity.date)
      let periodKey: string

      if (mode === 'weekly') {
        // Calculer le début de la semaine (lundi)
        const startOfWeek = new Date(date)
        const day = startOfWeek.getDay()
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
        startOfWeek.setDate(diff)
        periodKey = startOfWeek.toISOString().split('T')[0]
      } else {
        // Mois
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      if (!periods[periodKey]) {
        periods[periodKey] = { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
      }

      // Estimer le temps dans chaque zone basé sur le TRIMP et la durée
      const duration = activity.duration || 0
      const trimp = activity.trimp || 0
      const avgHrPercent = activity.avgHr && activity.maxHr ? (activity.avgHr / activity.maxHr) * 100 : 70

      // Distribution estimée basée sur l'intensité moyenne
      const distribution = estimateZoneDistribution(avgHrPercent, trimp)
      periods[periodKey].zone1 += Math.round(duration * distribution.zone1)
      periods[periodKey].zone2 += Math.round(duration * distribution.zone2)
      periods[periodKey].zone3 += Math.round(duration * distribution.zone3)
      periods[periodKey].zone4 += Math.round(duration * distribution.zone4)
      periods[periodKey].zone5 += Math.round(duration * distribution.zone5)
    })

    // Convertir en tableau et trier
    const result = Object.entries(periods)
      .map(([period, zones]) => ({
        period: formatPeriodLabel(period, mode),
        ...zones,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))

    // Garder les 12 dernières périodes
    return result.slice(-12)
  }

  const estimateZoneDistribution = (avgHrPercent: number, _trimp: number) => {
    // Estimation simplifiée basée sur l'intensité moyenne
    if (avgHrPercent < 60) {
      return { zone1: 0.6, zone2: 0.3, zone3: 0.08, zone4: 0.02, zone5: 0 }
    } else if (avgHrPercent < 70) {
      return { zone1: 0.2, zone2: 0.5, zone3: 0.2, zone4: 0.08, zone5: 0.02 }
    } else if (avgHrPercent < 80) {
      return { zone1: 0.1, zone2: 0.3, zone3: 0.4, zone4: 0.15, zone5: 0.05 }
    } else if (avgHrPercent < 90) {
      return { zone1: 0.05, zone2: 0.15, zone3: 0.3, zone4: 0.35, zone5: 0.15 }
    } else {
      return { zone1: 0.02, zone2: 0.08, zone3: 0.2, zone4: 0.3, zone5: 0.4 }
    }
  }

  const formatPeriodLabel = (period: string, mode: 'weekly' | 'monthly'): string => {
    if (mode === 'weekly') {
      const date = new Date(period)
      return `S${getWeekNumber(date)}`
    } else {
      const [year, month] = period.split('-')
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`
    }
  }

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? minutes : ''}`
    }
    return `${minutes}min`
  }

  // Convertir en pourcentage si nécessaire
  const chartData = displayMode === 'percentage'
    ? data.map((d) => {
        const total = d.zone1 + d.zone2 + d.zone3 + d.zone4 + d.zone5
        if (total === 0) return { ...d, zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
        return {
          period: d.period,
          zone1: Math.round((d.zone1 / total) * 100),
          zone2: Math.round((d.zone2 / total) * 100),
          zone3: Math.round((d.zone3 / total) * 100),
          zone4: Math.round((d.zone4 / total) * 100),
          zone5: Math.round((d.zone5 / total) * 100),
        }
      })
    : data

  // Calculer les totaux
  const totals = data.reduce(
    (acc, d) => ({
      zone1: acc.zone1 + d.zone1,
      zone2: acc.zone2 + d.zone2,
      zone3: acc.zone3 + d.zone3,
      zone4: acc.zone4 + d.zone4,
      zone5: acc.zone5 + d.zone5,
    }),
    { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
  )

  const totalTime = totals.zone1 + totals.zone2 + totals.zone3 + totals.zone4 + totals.zone5

  if (loading) {
    return <div className="text-center py-8 text-text-muted">Chargement des zones d'effort...</div>
  }

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              viewMode === 'weekly' ? 'bg-brand text-white' : 'bg-bg-gray-100 dark:bg-dark-border text-text-secondary hover:bg-bg-gray-200'
            }`}
          >
            Hebdomadaire
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              viewMode === 'monthly' ? 'bg-brand text-white' : 'bg-bg-gray-100 dark:bg-dark-border text-text-secondary hover:bg-bg-gray-200'
            }`}
          >
            Mensuel
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDisplayMode('stacked')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              displayMode === 'stacked' ? 'bg-brand text-white' : 'bg-bg-gray-100 dark:bg-dark-border text-text-secondary hover:bg-bg-gray-200'
            }`}
          >
            Durée
          </button>
          <button
            onClick={() => setDisplayMode('percentage')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              displayMode === 'percentage' ? 'bg-brand text-white' : 'bg-bg-gray-100 dark:bg-dark-border text-text-secondary hover:bg-bg-gray-200'
            }`}
          >
            Pourcentage
          </button>
        </div>
      </div>

      {/* Résumé des zones */}
      <div className="grid grid-cols-5 gap-2">
        {zones.map((zone) => {
          const zoneTotal = totals[zone.key as keyof typeof totals]
          const percentage = totalTime > 0 ? (zoneTotal / totalTime) * 100 : 0

          return (
            <div key={zone.key} className="text-center p-3 rounded-lg bg-bg-gray-50 dark:bg-dark-border/50">
              <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: zone.color }} />
              <div className="text-xs text-text-muted mb-1">{zone.name.split(' - ')[0]}</div>
              <div className="font-semibold text-sm">{percentage.toFixed(1)}%</div>
              <div className="text-xs text-text-muted">{formatDuration(zoneTotal)}</div>
            </div>
          )
        })}
      </div>

      {/* Graphique */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} stackOffset={displayMode === 'percentage' ? 'expand' : 'none'}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="period" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => (displayMode === 'percentage' ? `${Math.round(value * 100)}%` : formatDuration(value))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--panel-border)',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const zone = zones.find((z) => z.key === name)
                const label = zone ? zone.name : name
                const formattedValue = displayMode === 'percentage' ? `${Math.round(value)}%` : formatDuration(value)
                return [formattedValue, label]
              }}
            />
            <Legend
              formatter={(value) => {
                const zone = zones.find((z) => z.key === value)
                return zone ? zone.name.split(' - ')[1] : value
              }}
            />
            {zones.map((zone) => (
              <Area
                key={zone.key}
                type="monotone"
                dataKey={zone.key}
                stackId="1"
                stroke={zone.color}
                fill={zone.color}
                fillOpacity={0.8}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Légende détaillée */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
        {zones.map((zone) => (
          <div key={zone.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
            <div>
              <div className="font-medium">{zone.name}</div>
              <div className="text-text-muted">{zone.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
