import { Home, TreePine, Route, Clock, Mountain, Zap } from 'lucide-react'
import type { IndoorOutdoorStats } from '../../types/reports'
import { formatDistance, formatDuration } from '../../utils/reportExport'

interface Props {
  indoor: IndoorOutdoorStats
  outdoor: IndoorOutdoorStats
  total: {
    activities: number
    distance: number
    duration: number
    elevation: number
    trimp: number
  }
}

function StatBar({
  label,
  icon: Icon,
  indoor,
  outdoor,
  total,
  formatFn,
  unit,
}: {
  label: string
  icon: React.ElementType
  indoor: number
  outdoor: number
  total: number
  formatFn?: (val: number) => string
  unit?: string
}) {
  const indoorPercent = total > 0 ? (indoor / total) * 100 : 0
  const outdoorPercent = total > 0 ? (outdoor / total) * 100 : 0

  const format = formatFn || ((v: number) => Math.round(v).toLocaleString('fr-FR'))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-sm text-gray-500">
          {format(total)} {unit}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden bg-white/5 flex">
        {outdoorPercent > 0 && (
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${outdoorPercent}%` }}
          />
        )}
        {indoorPercent > 0 && (
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
            style={{ width: `${indoorPercent}%` }}
          />
        )}
      </div>

      {/* Values */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <TreePine className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-medium">{format(outdoor)}</span>
          <span className="text-gray-500">({outdoorPercent.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">({indoorPercent.toFixed(0)}%)</span>
          <span className="text-violet-400 font-medium">{format(indoor)}</span>
          <Home className="w-3 h-3 text-violet-400" />
        </div>
      </div>
    </div>
  )
}

export function ReportIndoorOutdoor({ indoor, outdoor, total }: Props) {
  const hasData = total.activities > 0

  if (!hasData) return null

  const indoorPercent = (indoor.activities / total.activities) * 100
  const outdoorPercent = (outdoor.activities / total.activities) * 100

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-500/30">
          <div className="flex">
            <TreePine className="w-4 h-4 text-emerald-400" />
            <Home className="w-4 h-4 text-violet-400 -ml-1" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Intérieur vs Extérieur
          </h3>
          <p className="text-sm text-gray-500">
            Comparaison de vos entraînements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual comparison */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6">
            {/* Circular comparison */}
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* Outdoor circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="8"
                      strokeDasharray={`${outdoorPercent * 2.51} 251`}
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))',
                        transition: 'stroke-dasharray 1s ease-out',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <TreePine className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-lg font-bold text-emerald-400">
                      {outdoorPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-400 mt-2">Extérieur</span>
                <span className="text-xs text-gray-500">
                  {outdoor.activities} activité{outdoor.activities > 1 ? 's' : ''}
                </span>
              </div>

              {/* VS separator */}
              <div className="text-gray-600 font-bold text-lg">VS</div>

              {/* Indoor circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="8"
                      strokeDasharray={`${indoorPercent * 2.51} 251`}
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
                        transition: 'stroke-dasharray 1s ease-out',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Home className="w-5 h-5 text-violet-400 mb-1" />
                    <span className="text-lg font-bold text-violet-400">
                      {indoorPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-400 mt-2">Intérieur</span>
                <span className="text-xs text-gray-500">
                  {indoor.activities} activité{indoor.activities > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">Extérieur (route, trail...)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-xs text-gray-400">Intérieur (home trainer...)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed stats */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6 space-y-6">
            <h4 className="font-medium text-white">Répartition détaillée</h4>

            <StatBar
              label="Distance"
              icon={Route}
              indoor={indoor.distance}
              outdoor={outdoor.distance}
              total={total.distance}
              formatFn={formatDistance}
            />

            <StatBar
              label="Durée"
              icon={Clock}
              indoor={indoor.duration}
              outdoor={outdoor.duration}
              total={total.duration}
              formatFn={formatDuration}
            />

            <StatBar
              label="Dénivelé"
              icon={Mountain}
              indoor={indoor.elevation}
              outdoor={outdoor.elevation}
              total={total.elevation}
              unit="m"
            />

            <StatBar
              label="TRIMP"
              icon={Zap}
              indoor={indoor.trimp}
              outdoor={outdoor.trimp}
              total={total.trimp}
              unit="pts"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
