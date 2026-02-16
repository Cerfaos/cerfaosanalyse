import { TrendingUp, TrendingDown, Minus, BarChart3, Sparkles, Battery, Zap } from 'lucide-react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  CartesianGrid,
} from 'recharts'
import type { ReportTrainingLoad as ReportTrainingLoadType } from '../../types/reports'

interface Props {
  trainingLoad: ReportTrainingLoadType
}

const metricConfig = {
  ctl: {
    label: 'Forme',
    sublabel: 'CTL',
    description: 'Fitness accumulée sur 42 jours',
    color: 'var(--status-info)',
    gradient: 'from-blue-500 to-cyan-400',
    icon: Sparkles,
    goodDirection: 'up',
  },
  atl: {
    label: 'Fatigue',
    sublabel: 'ATL',
    description: 'Charge aiguë sur 7 jours',
    color: '#A855F7',
    gradient: 'from-violet-500 to-purple-400',

    icon: Battery,
    goodDirection: 'neutral',
  },
  tsb: {
    label: 'Fraîcheur',
    sublabel: 'TSB',
    description: 'Équilibre forme-fatigue',
    color: 'var(--status-success)',
    gradient: 'from-emerald-500 to-green-400',
    icon: Zap,
    goodDirection: 'up',
  },
}

export function ReportTrainingLoad({ trainingLoad }: Props) {
  const chartData = trainingLoad.history.map((d) => ({
    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    fullDate: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
    CTL: Math.round(d.ctl * 10) / 10,
    ATL: Math.round(d.atl * 10) / 10,
    TSB: Math.round(d.tsb * 10) / 10,
  }))

  const formatChange = (value: number, goodDirection: string) => {
    const sign = value > 0 ? '+' : ''
    const isGood = goodDirection === 'up' ? value > 0 : goodDirection === 'down' ? value < 0 : true
    return {
      text: `${sign}${value.toFixed(1)}`,
      isGood,
    }
  }

  const getTrendIcon = (value: number, goodDirection: string) => {
    if (Math.abs(value) < 0.5) return <Minus className="w-4 h-4 text-[var(--text-disabled)]" />
    if (value > 0) {
      const color = goodDirection === 'up' ? 'text-emerald-400' : goodDirection === 'down' ? 'text-orange-400' : 'text-[var(--text-tertiary)]'
      return <TrendingUp className={`w-4 h-4 ${color}`} />
    }
    const color = goodDirection === 'down' ? 'text-emerald-400' : goodDirection === 'up' ? 'text-orange-400' : 'text-[var(--text-tertiary)]'
    return <TrendingDown className={`w-4 h-4 ${color}`} />
  }

  const tsb = trainingLoad.endCtl - trainingLoad.endAtl
  const tsbChange = trainingLoad.ctlChange - trainingLoad.atlChange

  const metrics = [
    { key: 'ctl', value: trainingLoad.endCtl, change: trainingLoad.ctlChange },
    { key: 'atl', value: trainingLoad.endAtl, change: trainingLoad.atlChange },
    { key: 'tsb', value: tsb, change: tsbChange },
  ] as const

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Charge d'Entraînement
          </h3>
          <p className="text-sm text-[var(--text-disabled)]">
            Modèle CTL/ATL/TSB
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map(({ key, value, change }) => {
          const config = metricConfig[key]
          const Icon = config.icon
          const changeInfo = formatChange(change, config.goodDirection)

          return (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-5 transition-all duration-300 hover:border-white/20"
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${config.color}30, transparent 70%)`,
                }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                    <Icon className="w-4 h-4 text-[var(--text-primary)]" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getTrendIcon(change, config.goodDirection)}
                    <span className={`text-sm font-medium ${changeInfo.isGood ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {changeInfo.text}
                    </span>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: config.color }}
                    >
                      {value.toFixed(1)}
                    </span>
                    <span className="text-sm text-[var(--text-disabled)] font-medium">
                      {config.sublabel}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">
                    {config.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-5">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                <defs>
                  <linearGradient id="ctlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--status-info)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--status-info)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="atlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />

                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-disabled)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="var(--text-disabled)"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: 'rgba(10, 25, 21, 0.95)',
                    border: '1px solid rgba(139, 195, 74, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                  labelStyle={{ color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 500 }}
                  formatter={(value: number, name: string) => {
                    const colors: Record<string, string> = {
                      CTL: 'var(--status-info)',
                      ATL: '#A855F7',
                      TSB: 'var(--status-success)',
                    }
                    return [
                      <span key="v" style={{ color: colors[name], fontWeight: 600 }}>
                        {value.toFixed(1)}
                      </span>,
                      name === 'CTL' ? 'Forme' : name === 'ATL' ? 'Fatigue' : 'Fraîcheur',
                    ]
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload as { fullDate?: string } | undefined
                    return item?.fullDate || label
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="CTL"
                  stroke="transparent"
                  fill="url(#ctlGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="CTL"
                  stroke="var(--status-info)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--status-info)', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="ATL"
                  stroke="#A855F7"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#A855F7', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="TSB"
                  stroke="var(--status-success)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--status-success)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
            {Object.entries(metricConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm text-[var(--text-tertiary)]">
                  {config.label} ({config.sublabel})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
