import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { PolarizationSummary } from '../../types/reports'

interface Props {
  polarization: PolarizationSummary
}

const intensityConfig = {
  low: {
    label: 'Endurance',
    zones: 'Z1-Z2',
    color: '#0EA5E9',
    gradient: 'from-sky-500 to-cyan-400',
    description: 'Base aérobie',
  },
  moderate: {
    label: 'Tempo',
    zones: 'Z3',
    color: '#FACC15',
    gradient: 'from-yellow-500 to-amber-400',
    description: 'Zone grise',
  },
  high: {
    label: 'Intensité',
    zones: 'Z4-Z5',
    color: '#EF4444',
    gradient: 'from-red-500 to-rose-400',
    description: 'Développement',
  },
}

// Circular progress component
function CircularGauge({ score }: { score: number }) {
  const radius = 70
  const strokeWidth = 10
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return '#8BC34A'
    if (score >= 60) return '#FACC15'
    return '#EF4444'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Bon'
    if (score >= 40) return 'Moyen'
    return 'À améliorer'
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={getScoreColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 8px ${getScoreColor()}80)`,
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold"
          style={{ color: getScoreColor() }}
        >
          {score.toFixed(0)}
        </span>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {getScoreLabel()}
        </span>
      </div>
    </div>
  )
}

export function ReportPolarization({ polarization }: Props) {
  const intensities = ['low', 'moderate', 'high'] as const

  const getTrendIcon = (diff: number) => {
    if (diff > 5) return <TrendingUp className="w-4 h-4 text-orange-400" />
    if (diff < -5) return <TrendingDown className="w-4 h-4 text-blue-400" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#8BC34A]/20 to-[#8BC34A]/5 border border-[#8BC34A]/30">
          <Target className="w-5 h-5 text-[#8BC34A]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Index de Polarisation
          </h3>
          <p className="text-sm text-gray-500">
            Distribution 80/10/10 recommandée
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Score section */}
          <div className="lg:col-span-4 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <CircularGauge score={polarization.score} />
            <p className="text-center text-sm text-gray-400 mt-4 max-w-[200px]">
              {polarization.focus}
            </p>
          </div>

          {/* Intensities breakdown */}
          <div className="lg:col-span-8 p-6 space-y-5">
            {intensities.map((intensity) => {
              const config = intensityConfig[intensity]
              const actual = polarization.percentages[intensity]
              const target = polarization.target[intensity]
              const diff = actual - target

              return (
                <div key={intensity} className="space-y-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <div>
                        <span className="font-medium text-white">
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({config.zones})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-lg font-bold"
                        style={{ color: config.color }}
                      >
                        {actual.toFixed(1)}%
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        {getTrendIcon(diff)}
                        <span className={`${diff > 0 ? 'text-orange-400' : diff < 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(actual, 100)}%`,
                          backgroundColor: config.color,
                          boxShadow: `0 0 12px ${config.color}60`,
                        }}
                      />
                    </div>
                    {/* Target marker */}
                    <div
                      className="absolute top-0 h-full flex items-center"
                      style={{ left: `${target}%` }}
                    >
                      <div className="w-0.5 h-5 -mt-1 bg-white/60 rounded-full" />
                    </div>
                  </div>

                  {/* Target label */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{config.description}</span>
                    <span>Cible: {target}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Message footer */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10">
          <p className="text-sm text-gray-400 italic text-center">
            {polarization.message}
          </p>
        </div>
      </div>
    </section>
  )
}
