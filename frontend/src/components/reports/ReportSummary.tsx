import {
  Activity,
  Route,
  Clock,
  Mountain,
  Flame,
  Zap,
  Heart,
  Gauge
} from 'lucide-react'
import type { ReportSummary as ReportSummaryType } from '../../types/reports'
import { formatDistance, formatDuration } from '../../utils/reportExport'

interface Props {
  summary: ReportSummaryType
}

const metrics = [
  {
    key: 'activities',
    label: 'Activités',
    icon: Activity,
    gradient: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    key: 'distance',
    label: 'Distance',
    icon: Route,
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    key: 'duration',
    label: 'Durée',
    icon: Clock,
    gradient: 'from-violet-500 to-purple-400',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    key: 'elevation',
    label: 'Dénivelé',
    icon: Mountain,
    gradient: 'from-orange-500 to-amber-400',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  {
    key: 'calories',
    label: 'Calories',
    icon: Flame,
    gradient: 'from-red-500 to-rose-400',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
  {
    key: 'trimp',
    label: 'TRIMP',
    icon: Zap,
    gradient: 'from-yellow-500 to-lime-400',
    glowColor: 'rgba(234, 179, 8, 0.4)',
  },
  {
    key: 'heartRate',
    label: 'FC Moyenne',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-400',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  {
    key: 'speed',
    label: 'Vitesse Moy.',
    icon: Gauge,
    gradient: 'from-cyan-500 to-sky-400',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
]

export function ReportSummary({ summary }: Props) {
  const getValue = (key: string): { value: string; unit: string } => {
    switch (key) {
      case 'activities':
        return { value: summary.totalActivities.toString(), unit: 'sorties' }
      case 'distance':
        return { value: formatDistance(summary.totalDistance), unit: '' }
      case 'duration':
        return { value: formatDuration(summary.totalDuration), unit: '' }
      case 'elevation':
        return { value: Math.round(summary.totalElevation).toLocaleString('fr-FR'), unit: 'm' }
      case 'calories':
        return { value: Math.round(summary.totalCalories).toLocaleString('fr-FR'), unit: 'kcal' }
      case 'trimp':
        return { value: Math.round(summary.totalTrimp).toLocaleString('fr-FR'), unit: 'pts' }
      case 'heartRate':
        return {
          value: summary.averageHeartRate?.toString() || '-',
          unit: summary.averageHeartRate ? 'bpm' : ''
        }
      case 'speed':
        return {
          value: summary.averageSpeed?.toFixed(1) || '-',
          unit: summary.averageSpeed ? 'km/h' : ''
        }
      default:
        return { value: '-', unit: '' }
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#8BC34A]/20 to-[#8BC34A]/5 border border-[#8BC34A]/30">
          <Activity className="w-5 h-5 text-[#8BC34A]" />
        </div>
        <h3 className="text-xl font-semibold text-white tracking-tight">
          Résumé de la Période
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const { value, unit } = getValue(metric.key)
          const Icon = metric.icon

          return (
            <div
              key={metric.key}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${metric.glowColor}, transparent 70%)`,
                }}
              />

              {/* Icon container */}
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${metric.gradient} mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>

              {/* Value */}
              <div className="relative">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {value}
                  </span>
                  {unit && (
                    <span className="text-sm font-medium text-gray-400">
                      {unit}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {metric.label}
                </p>
              </div>

              {/* Subtle corner accent */}
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${metric.glowColor}, transparent)`,
                }}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
