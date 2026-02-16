import { Link } from 'react-router-dom'
import { Trophy, Route, Clock, Zap, Mountain, ChevronRight, Medal } from 'lucide-react'
import type { ReportTopActivities as ReportTopActivitiesType, ReportActivity } from '../../types/reports'
import { formatDistance, formatDuration, formatDate } from '../../utils/reportExport'

interface Props {
  topActivities: ReportTopActivitiesType
}

const categoryConfig = {
  distance: {
    title: 'Plus longue distance',
    icon: Route,
    color: 'var(--status-info)',
    gradient: 'from-blue-500 to-cyan-400',
    getValue: (a: ReportActivity) => formatDistance(a.distance),
    unit: '',
  },
  duration: {
    title: 'Plus longue durée',
    icon: Clock,
    color: '#A855F7',
    gradient: 'from-violet-500 to-purple-400',
    getValue: (a: ReportActivity) => formatDuration(a.duration),
    unit: '',
  },
  trimp: {
    title: 'Plus gros TRIMP',
    icon: Zap,
    color: '#EAB308',
    gradient: 'from-yellow-500 to-amber-400',
    getValue: (a: ReportActivity) => (a.trimp || 0).toString(),
    unit: 'pts',
  },
  elevation: {
    title: 'Plus de dénivelé',
    icon: Mountain,
    color: '#F97316',
    gradient: 'from-orange-500 to-amber-400',
    getValue: (a: ReportActivity) => Math.round(a.elevationGain || 0).toString(),
    unit: 'm',
  },
}

function ActivityCard({
  activity,
  rank,
  config,
}: {
  activity: ReportActivity
  rank: number
  config: typeof categoryConfig.distance
}) {
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
  const medalColor = medalColors[rank - 1] || '#6B7280'

  return (
    <Link
      to={`/activities/${activity.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10"
    >
      {/* Rank medal */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${medalColor}20` }}
      >
        {rank <= 3 ? (
          <Medal
            className="w-4 h-4"
            style={{ color: medalColor }}
            strokeWidth={2.5}
          />
        ) : (
          <span className="text-sm font-bold text-[var(--text-disabled)]">{rank}</span>
        )}
      </div>

      {/* Activity info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-primary)] truncate">{activity.type}</span>
          {activity.subSport && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-tertiary)]">
              {activity.subSport}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--text-disabled)] mt-0.5">
          {formatDate(activity.date)}
        </p>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2">
        <span
          className="text-lg font-bold"
          style={{ color: config.color }}
        >
          {config.getValue(activity)}
        </span>
        {config.unit && (
          <span className="text-sm text-[var(--text-disabled)]">{config.unit}</span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[var(--text-tertiary)] transition-colors" />
      </div>
    </Link>
  )
}

function CategorySection({
  title,
  activities,
  config,
}: {
  title: string
  activities: ReportActivity[]
  config: typeof categoryConfig.distance
}) {
  const Icon = config.icon

  if (activities.length === 0) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient}`}>
          <Icon className="w-4 h-4 text-[var(--text-primary)]" strokeWidth={2.5} />
        </div>
        <h4 className="font-medium text-[var(--text-primary)]">{title}</h4>
      </div>

      {/* Activities list */}
      <div className="p-3 space-y-2">
        {activities.slice(0, 3).map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            rank={index + 1}
            config={config}
          />
        ))}
      </div>
    </div>
  )
}

export function ReportTopActivities({ topActivities }: Props) {
  const hasAnyActivities =
    topActivities.byDistance.length > 0 ||
    topActivities.byDuration.length > 0 ||
    topActivities.byTrimp.length > 0 ||
    topActivities.byElevation.length > 0

  if (!hasAnyActivities) {
    return null
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Top Activités
          </h3>
          <p className="text-sm text-[var(--text-disabled)]">
            Vos meilleures performances de la période
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySection
          title={categoryConfig.distance.title}
          activities={topActivities.byDistance}
          config={categoryConfig.distance}
        />
        <CategorySection
          title={categoryConfig.duration.title}
          activities={topActivities.byDuration}
          config={categoryConfig.duration}
        />
        <CategorySection
          title={categoryConfig.trimp.title}
          activities={topActivities.byTrimp}
          config={categoryConfig.trimp}
        />
        <CategorySection
          title={categoryConfig.elevation.title}
          activities={topActivities.byElevation}
          config={categoryConfig.elevation}
        />
      </div>
    </section>
  )
}
