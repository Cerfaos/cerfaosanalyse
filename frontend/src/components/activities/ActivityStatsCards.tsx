/**
 * Cartes de statistiques pour la page Activities
 */

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Activités */}
      <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Activités</p>
              <p className="text-xs text-text-tertiary">{getPeriodLabel(period)}</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-brand mb-1">{stats.count}</p>
          <p className="text-sm text-text-muted">
            Moy: {stats.avgDistance ? formatDistance(stats.avgDistance) : "-"}/sortie
          </p>
        </div>
      </div>

      {/* Distance totale */}
      <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-muted">Distance totale</p>
          </div>
          <p className="text-4xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
            {formatDistance(stats.totalDistance)}
          </p>
          <p className="text-sm text-text-muted">Moy: {formatDistance(stats.avgDistance)}</p>
        </div>
      </div>

      {/* Temps total */}
      <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-muted">Temps total</p>
          </div>
          <p className="text-4xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
            {formatDuration(stats.totalDuration)}
          </p>
          <p className="text-sm text-text-muted">Moy: {formatDuration(stats.avgDuration)}</p>
        </div>
      </div>

      {/* TRIMP total */}
      <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-muted">TRIMP total</p>
          </div>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {stats.totalTrimp}
          </p>
          <p className="text-sm text-text-muted">Moy: {stats.avgTrimp}/activité</p>
        </div>
      </div>
    </div>
  );
}
