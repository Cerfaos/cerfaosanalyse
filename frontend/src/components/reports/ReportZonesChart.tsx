import { HeartPulse } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReportZoneDistribution } from '../../types/reports'

interface Props {
  zones: ReportZoneDistribution[]
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`
  }
  return `${minutes}min`
}

const zoneDescriptions: Record<number, string> = {
  1: 'Récupération active',
  2: 'Endurance fondamentale',
  3: 'Tempo / Seuil aérobie',
  4: 'Seuil lactique',
  5: 'VO2max / Puissance',
}

export function ReportZonesChart({ zones }: Props) {
  const chartData = zones.map((z) => ({
    name: `Z${z.zone}`,
    percentage: z.percentage,
    seconds: z.seconds,
    color: z.color,
    fullName: z.name,
    description: z.description,
    zone: z.zone,
  }))

  const totalSeconds = zones.reduce((acc, z) => acc + z.seconds, 0)

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30">
          <HeartPulse className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Zones Cardiaques
          </h3>
          <p className="text-sm text-[var(--text-disabled)]">
            {formatDuration(totalSeconds)} d'effort analysé
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {zones.map((zone, index) => (
          <div
            key={zone.zone}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-4 transition-all duration-300 hover:border-white/20"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Zone indicator bar at top */}
            <div
              className="absolute top-0 left-0 right-0 h-1 opacity-80"
              style={{ backgroundColor: zone.color }}
            />

            {/* Glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${zone.color}40, transparent 70%)`,
              }}
            />

            <div className="relative space-y-3">
              {/* Zone header */}
              <div className="flex items-center justify-between">
                <span
                  className="text-2xl font-bold"
                  style={{ color: zone.color }}
                >
                  Z{zone.zone}
                </span>
                <span className="text-xl font-semibold text-[var(--text-primary)]">
                  {zone.percentage.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${zone.percentage}%`,
                    backgroundColor: zone.color,
                    boxShadow: `0 0 12px ${zone.color}80`,
                  }}
                />
              </div>

              {/* Zone info */}
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] truncate">
                  {zone.name}
                </p>
                <p className="text-xs text-[var(--text-disabled)] mt-0.5">
                  {formatDuration(zone.seconds)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-5">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="var(--text-disabled)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--text-disabled)"
                width={35}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 21, 0.95)',
                  border: '1px solid rgba(139, 195, 74, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
                labelStyle={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}
                formatter={(value: number, _name: string, props) => {
                  const payload = props?.payload as { fullName: string; seconds: number; zone: number } | undefined
                  if (!payload) return [value, '']
                  return [
                    <span key="val" className="font-semibold text-[var(--text-primary)]">
                      {value.toFixed(1)}% ({formatDuration(payload.seconds)})
                    </span>,
                    <span key="name" style={{ color: chartData[payload.zone - 1]?.color }}>
                      {payload.fullName}
                    </span>,
                  ]
                }}
              />
              <Bar
                dataKey="percentage"
                radius={[0, 8, 8, 0]}
                maxBarSize={28}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    style={{
                      filter: `drop-shadow(0 0 6px ${entry.color}60)`,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zone legend */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {zones.map((zone) => (
              <div key={zone.zone} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-[var(--text-tertiary)] truncate">
                  {zoneDescriptions[zone.zone]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
