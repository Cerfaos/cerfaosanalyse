import { Calendar, TrendingUp, TrendingDown, Minus, Route, Mountain, Zap, Activity, Trophy, Target, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  Area,
  ComposedChart,
  Line,
} from 'recharts'
import type { MonthlyBreakdown } from '../../types/reports'

interface Props {
  monthlyBreakdown: MonthlyBreakdown[]
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`
  }
  return `${minutes}min`
}

const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(0)} km`
  }
  return `${meters} m`
}

export function ReportMonthlyComparison({ monthlyBreakdown }: Props) {
  // Calculer les stats globales
  const totalActivities = monthlyBreakdown.reduce((sum, m) => sum + m.activities, 0)
  const totalDistance = monthlyBreakdown.reduce((sum, m) => sum + m.distance, 0)
  const totalDuration = monthlyBreakdown.reduce((sum, m) => sum + m.duration, 0)
  const totalElevation = monthlyBreakdown.reduce((sum, m) => sum + m.elevation, 0)
  const totalTrimp = monthlyBreakdown.reduce((sum, m) => sum + m.trimp, 0)

  const maxActivitiesMonth = monthlyBreakdown.reduce((max, m) => m.activities > max.activities ? m : max, monthlyBreakdown[0])
  const maxDistanceMonth = monthlyBreakdown.reduce((max, m) => m.distance > max.distance ? m : max, monthlyBreakdown[0])
  const maxTrimpMonth = monthlyBreakdown.reduce((max, m) => m.trimp > max.trimp ? m : max, monthlyBreakdown[0])
  const maxElevationMonth = monthlyBreakdown.reduce((max, m) => m.elevation > max.elevation ? m : max, monthlyBreakdown[0])

  // Mois actifs (avec au moins une activité)
  const activeMonths = monthlyBreakdown.filter(m => m.activities > 0).length

  // Données pour le graphique
  const chartData = monthlyBreakdown.map(m => ({
    ...m,
    monthShort: m.monthName.substring(0, 3),
    distanceKm: Math.round(m.distance / 1000),
    durationHours: Math.round(m.duration / 3600 * 10) / 10,
  }))

  // Calculer la tendance (comparaison premier semestre vs deuxième semestre)
  const firstHalf = monthlyBreakdown.slice(0, 6)
  const secondHalf = monthlyBreakdown.slice(6, 12)
  const firstHalfActivities = firstHalf.reduce((sum, m) => sum + m.activities, 0)
  const secondHalfActivities = secondHalf.reduce((sum, m) => sum + m.activities, 0)
  const trend = secondHalfActivities - firstHalfActivities
  const trendPercent = firstHalfActivities > 0 ? Math.round((trend / firstHalfActivities) * 100) : 0

  // Calcul de la moyenne mensuelle
  const avgActivitiesPerMonth = activeMonths > 0 ? Math.round((totalActivities / activeMonths) * 10) / 10 : 0
  const avgDistancePerMonth = activeMonths > 0 ? Math.round(totalDistance / activeMonths / 1000) : 0

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Analyse Mensuelle
            </h3>
            <p className="text-sm text-gray-400">{activeMonths} mois actifs sur 12</p>
          </div>
        </div>

        {/* Tendance badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          trend > 0 ? 'bg-emerald-500/10 border border-emerald-500/30' :
          trend < 0 ? 'bg-red-500/10 border border-red-500/30' :
          'bg-gray-500/10 border border-gray-500/30'
        }`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
           trend < 0 ? <TrendingDown className="w-4 h-4 text-red-400" /> :
           <Minus className="w-4 h-4 text-gray-400" />}
          <span className={`text-sm font-semibold ${
            trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend > 0 ? '+' : ''}{trendPercent}% S2 vs S1
          </span>
        </div>
      </div>

      {/* Statistiques clés - Style amélioré */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mois le plus actif */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Trophy className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Plus actif</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{maxActivitiesMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-emerald-400">{maxActivitiesMonth.activities}</span>
              <span className="text-sm text-gray-400">activités</span>
            </div>
          </div>
        </div>

        {/* Plus grande distance */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-5 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Route className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-400/80 uppercase tracking-wider">Plus grande distance</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{maxDistanceMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-blue-400">{formatDistance(maxDistanceMonth.distance)}</span>
            </div>
          </div>
        </div>

        {/* Charge max */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">Charge max</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{maxTrimpMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-amber-400">{maxTrimpMonth.trimp.toLocaleString('fr-FR')}</span>
              <span className="text-sm text-gray-400">TRIMP</span>
            </div>
          </div>
        </div>

        {/* Dénivelé max */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 p-5 transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Mountain className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs font-medium text-orange-400/80 uppercase tracking-wider">Plus de D+</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{maxElevationMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-orange-400">{maxElevationMonth.elevation.toLocaleString('fr-FR')}</span>
              <span className="text-sm text-gray-400">m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Moyennes mensuelles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Moyenne mensuelle</p>
            <p className="text-xl font-bold text-white">{avgActivitiesPerMonth} <span className="text-sm font-normal text-gray-400">activités/mois</span></p>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Distance moyenne</p>
            <p className="text-xl font-bold text-white">{avgDistancePerMonth} <span className="text-sm font-normal text-gray-400">km/mois</span></p>
          </div>
        </div>
      </div>

      {/* Graphique principal - Activités avec courbe de tendance */}
      <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#8BC34A]/20">
              <Activity className="w-4 h-4 text-[#8BC34A]" />
            </div>
            <h4 className="text-lg font-semibold text-white">Volume d'activités</h4>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8BC34A]" />
              <span className="text-gray-400">Activités</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8BC34A]/40" />
              <span className="text-gray-400">Tendance</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8BC34A" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8BC34A" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="monthShort"
                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 21, 0.98)',
                  border: '1px solid rgba(139, 195, 74, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
                formatter={(value: number) => [`${value} activités`, '']}
                labelFormatter={(label) => {
                  const month = chartData.find(d => d.monthShort === label)
                  return month?.monthName || label
                }}
              />
              <Area
                type="monotone"
                dataKey="activities"
                fill="url(#activityGradient)"
                stroke="transparent"
              />
              <Bar dataKey="activities" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.activities === maxActivitiesMonth.activities && entry.activities > 0
                      ? '#8BC34A'
                      : 'rgba(139, 195, 74, 0.5)'}
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="activities"
                stroke="rgba(139, 195, 74, 0.6)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique distance et durée */}
      <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Route className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">Distance et durée</h4>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="monthShort"
                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#3B82F6', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#8B5CF6', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 21, 0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
                formatter={(value: number, name: string) => {
                  if (name === 'distanceKm') return [`${value} km`, 'Distance']
                  if (name === 'durationHours') return [`${value}h`, 'Durée']
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const month = chartData.find(d => d.monthShort === label)
                  return month?.monthName || label
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => {
                  if (value === 'distanceKm') return <span className="text-gray-300 text-sm">Distance (km)</span>
                  if (value === 'durationHours') return <span className="text-gray-300 text-sm">Durée (heures)</span>
                  return value
                }}
              />
              <Bar yAxisId="left" dataKey="distanceKm" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar yAxisId="right" dataKey="durationHours" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau détaillé avec barres de progression */}
      <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white">Détail mensuel</h4>
          </div>
          <div className="text-sm text-gray-400">
            {totalActivities} activités sur l'année
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mois</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Activités</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Distance</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Durée</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">D+</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">TRIMP</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((month) => {
                const isMaxActivities = month.activities === maxActivitiesMonth.activities && month.activities > 0
                const isMaxDistance = month.distance === maxDistanceMonth.distance && month.distance > 0
                const isMaxTrimp = month.trimp === maxTrimpMonth.trimp && month.trimp > 0
                const activityPercent = maxActivitiesMonth.activities > 0 ? (month.activities / maxActivitiesMonth.activities) * 100 : 0

                return (
                  <tr
                    key={month.month}
                    className={`border-b border-white/5 transition-all duration-200 hover:bg-white/[0.04] ${
                      month.activities === 0 ? 'opacity-40' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${month.activities > 0 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        <span className="font-medium text-white">{month.monthName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px]">
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMaxActivities ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-emerald-500/50'
                              }`}
                              style={{ width: `${activityPercent}%` }}
                            />
                          </div>
                        </div>
                        <span className={`text-sm font-semibold min-w-[24px] ${isMaxActivities ? 'text-emerald-400' : 'text-gray-300'}`}>
                          {month.activities}
                        </span>
                        {isMaxActivities && (
                          <Trophy className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    </td>
                    <td className={`p-4 text-right text-sm ${isMaxDistance ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                      {month.distance > 0 ? formatDistance(month.distance) : '-'}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-300">
                      {month.duration > 0 ? formatDuration(month.duration) : '-'}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-300">
                      {month.elevation > 0 ? `${month.elevation.toLocaleString('fr-FR')} m` : '-'}
                    </td>
                    <td className={`p-4 text-right text-sm ${isMaxTrimp ? 'text-amber-400 font-semibold' : 'text-gray-300'}`}>
                      {month.trimp > 0 ? month.trimp.toLocaleString('fr-FR') : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-[#8BC34A]/10 to-transparent">
                <td className="p-4">
                  <span className="font-bold text-white">Total annuel</span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-emerald-400">{totalActivities}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-bold text-blue-400">{formatDistance(totalDistance)}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-bold text-purple-400">{formatDuration(totalDuration)}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-bold text-orange-400">{totalElevation.toLocaleString('fr-FR')} m</span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-bold text-amber-400">{totalTrimp.toLocaleString('fr-FR')}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}
