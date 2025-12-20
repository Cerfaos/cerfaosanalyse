import {
  Bike,
  Footprints,
  Mountain,
  Dumbbell,
  Waves,
  Heart,
  Home,
  TreePine,
  Route,
  Clock,
  Zap,
  TrendingUp,
  Flame,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { ReportTypeSummary } from '../../types/reports'
import { formatDistance, formatDuration } from '../../utils/reportExport'

interface Props {
  byType: ReportTypeSummary[]
  activitiesCount: {
    indoor: number
    outdoor: number
    total: number
  }
}

const TYPE_COLORS = [
  '#8BC34A', // Lime (primary)
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#EAB308', // Yellow
  '#6366F1', // Indigo
  '#EF4444', // Red
  '#06B6D4', // Cyan
]

// Map activity types to icons
const getActivityIcon = (type: string) => {
  const typeNormalized = type.toLowerCase()
  if (typeNormalized.includes('cycl') || typeNormalized.includes('vélo')) return Bike
  if (typeNormalized.includes('course') || typeNormalized.includes('running')) return Footprints
  if (typeNormalized.includes('march') || typeNormalized.includes('walk') || typeNormalized.includes('randonnée')) return Mountain
  if (typeNormalized.includes('muscul') || typeNormalized.includes('strength')) return Dumbbell
  if (typeNormalized.includes('nat') || typeNormalized.includes('swim') || typeNormalized.includes('piscine')) return Waves
  if (typeNormalized.includes('yoga') || typeNormalized.includes('stretch')) return Heart
  return TrendingUp
}

export function ReportByType({ byType, activitiesCount }: Props) {
  const pieData = byType.map((t, i) => ({
    name: t.type,
    value: t.count,
    color: TYPE_COLORS[i % TYPE_COLORS.length],
    distance: t.distance,
    duration: t.duration,
    trimp: t.trimp,
    indoor: t.indoor,
    outdoor: t.outdoor,
  }))

  const totalDistance = byType.reduce((sum, t) => sum + t.distance, 0)
  const totalDuration = byType.reduce((sum, t) => sum + t.duration, 0)
  const totalTrimp = byType.reduce((sum, t) => sum + t.trimp, 0)

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/30">
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white tracking-tight">
              Répartition par Type
            </h3>
            <p className="text-sm text-gray-500">
              {byType.length} type{byType.length > 1 ? 's' : ''} d'activité
            </p>
          </div>
        </div>

        {/* Quick stats badges */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Route className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">{formatDistance(totalDistance)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Donut chart section */}
        <div className="xl:col-span-4">
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-5 h-full">
            {pieData.length > 0 && (
              <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                          style={{
                            filter: `drop-shadow(0 0 8px ${entry.color}40)`,
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      position={{ x: 10, y: 10 }}
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null
                        const data = payload[0].payload as typeof pieData[0]
                        return (
                          <div
                            style={{
                              backgroundColor: 'rgba(10, 25, 21, 0.95)',
                              border: '1px solid rgba(139, 195, 74, 0.3)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            }}
                          >
                            <div style={{ color: data.color, fontWeight: 600, marginBottom: '8px' }}>
                              {data.name}
                            </div>
                            <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>
                              {data.value} activité{data.value > 1 ? 's' : ''}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                              <div>{formatDistance(data.distance)} • {formatDuration(data.duration)}</div>
                              <div>{Math.round(data.trimp)} TRIMP</div>
                              <div style={{ marginTop: '4px', color: '#6b7280' }}>
                                🏠 {data.indoor} intérieur • 🌲 {data.outdoor} extérieur
                              </div>
                            </div>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">
                    {activitiesCount.total}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              {pieData.slice(0, 5).map((item) => {
                const pct = activitiesCount.total > 0
                  ? Math.round((item.value / activitiesCount.total) * 100)
                  : 0
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-400 truncate max-w-[100px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-300">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Activity type cards */}
        <div className="xl:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {byType.map((type, index) => {
              const color = TYPE_COLORS[index % TYPE_COLORS.length]
              const Icon = getActivityIcon(type.type)
              const percentage = activitiesCount.total > 0
                ? Math.round((type.count / activitiesCount.total) * 100)
                : 0
              const indoorPct = type.count > 0 ? (type.indoor / type.count) * 100 : 0
              const outdoorPct = type.count > 0 ? (type.outdoor / type.count) * 100 : 0
              const avgDuration = type.count > 0 ? type.duration / type.count : 0

              return (
                <div
                  key={type.type}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-4 transition-all duration-300 hover:border-white/20"
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 0% 0%, ${color}20, transparent 50%)`,
                    }}
                  />

                  {/* Top colored bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: color }}
                  />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2.5 rounded-xl"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{type.type}</h4>
                          <p className="text-xs text-gray-500">
                            {type.count} sortie{type.count > 1 ? 's' : ''} • {percentage}%
                          </p>
                        </div>
                      </div>

                      {/* Percentage badge */}
                      <div
                        className="px-2.5 py-1 rounded-lg text-sm font-bold"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {percentage}%
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <Route className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {formatDistance(type.distance)}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {formatDuration(type.duration)}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {Math.round(type.trimp)}
                          </div>
                          <div className="text-xs text-gray-500">TRIMP</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {formatDuration(avgDuration)}
                          </div>
                          <div className="text-xs text-gray-500">Moy/sortie</div>
                        </div>
                      </div>
                    </div>

                    {/* Indoor/Outdoor bar */}
                    {(type.indoor > 0 || type.outdoor > 0) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-gray-400">Extérieur</span>
                            <span className="font-medium text-emerald-400">{type.outdoor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-violet-400">{type.indoor}</span>
                            <span className="text-gray-400">Intérieur</span>
                            <Home className="w-3.5 h-3.5 text-violet-400" />
                          </div>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-white/5 flex">
                          {outdoorPct > 0 && (
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${outdoorPct}%` }}
                            />
                          )}
                          {indoorPct > 0 && (
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                              style={{ width: `${indoorPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary footer */}
          {byType.length > 0 && (
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-violet-500/10 border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      <TreePine className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-400">
                        {activitiesCount.outdoor}
                      </div>
                      <div className="text-xs text-gray-500">Extérieur</div>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/20">
                      <Home className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-violet-400">
                        {activitiesCount.indoor}
                      </div>
                      <div className="text-xs text-gray-500">Intérieur</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {Math.round(totalTrimp)} TRIMP
                    </div>
                    <div className="text-xs text-gray-500">Charge totale</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {formatDistance(totalDistance)}
                    </div>
                    <div className="text-xs text-gray-500">Distance totale</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
