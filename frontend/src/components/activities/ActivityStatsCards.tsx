import type { ActivityStats } from "../../types/activities";
import { formatDistance, formatDuration } from "./activityUtils";
import { getPeriodLabel } from "./activitiesConfig";

interface ActivityStatsCardsProps {
  stats: ActivityStats;
  period: string;
}

export default function ActivityStatsCards({ stats, period }: ActivityStatsCardsProps) {
  if (stats.count === 0) return null;

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-disabled)]">
          {getPeriodLabel(period)}
        </span>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Activités */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-2">Activités</p>
          <p className="text-4xl font-black font-mono tabular-nums leading-none text-[var(--accent-primary)]">
            {stats.count}
          </p>
          {stats.avgDistance > 0 && (
            <p className="text-xs text-[var(--text-disabled)] mt-2">
              {formatDistance(stats.avgDistance)} <span className="text-[var(--border-strong)]">/</span> sortie
            </p>
          )}
        </div>

        {/* Distance */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-2">Distance</p>
          <p className="text-4xl font-black font-mono tabular-nums leading-none text-[var(--status-info)]">
            {formatDistance(stats.totalDistance)}
          </p>
          <p className="text-xs text-[var(--text-disabled)] mt-2">
            Moy. {formatDistance(stats.avgDistance)}
          </p>
        </div>

        {/* Temps */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-2">Temps total</p>
          <p className="text-4xl font-black font-mono tabular-nums leading-none text-emerald-400">
            {formatDuration(stats.totalDuration)}
          </p>
          <p className="text-xs text-[var(--text-disabled)] mt-2">
            Moy. {formatDuration(stats.avgDuration)}
          </p>
        </div>

        {/* TRIMP */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-2">Charge TRIMP</p>
          <p className="text-4xl font-black font-mono tabular-nums leading-none text-purple-500">
            {stats.totalTrimp}
          </p>
          <p className="text-xs text-[var(--text-disabled)] mt-2">
            Moy. {stats.avgTrimp} <span className="text-[var(--border-strong)]">/</span> activité
          </p>
        </div>
      </div>
    </div>
  );
}
