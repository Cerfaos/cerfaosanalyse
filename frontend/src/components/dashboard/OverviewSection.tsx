/**
 * Section vue d'ensemble du dashboard
 */

import StatCard from './StatCard'
import { formatDuration, formatDistance } from '../../utils/dashboardConfig'

interface OverviewSectionProps {
  stats: {
    totalActivities: number
    totalDistance: number
    totalDuration: number
    totalTrimp: number
    averageHeartRate: number | null
  }
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-green-500/5" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Période</p>
            <h2 className="text-3xl font-bold text-white">
              {stats.totalActivities} activité{stats.totalActivities > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="text-4xl animate-pulse">🎯</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <StatCard label="Distance totale" value={formatDistance(stats.totalDistance)} icon="🛣️" color="brand" />
        <StatCard label="Durée totale" value={formatDuration(stats.totalDuration)} icon="⏱️" color="orange" />
        <StatCard label="Charge TRIMP" value={stats.totalTrimp ? `${stats.totalTrimp}` : '-'} icon="💪" color="red" />
        <StatCard
          label="FC moyenne"
          value={stats.averageHeartRate ? `${stats.averageHeartRate} bpm` : '-'}
          icon="❤️"
          color="green"
        />
      </div>
    </div>
  )
}
