/**
 * Cartes de résumé pour les statistiques cardio/cyclisme
 */

import type { CyclingStatsPayload } from '../../types/cyclingStats';
import { formatDuration, formatDistance } from '../../utils/cyclingStatsConfig';

interface CyclingStatsSummaryProps {
  stats: CyclingStatsPayload | null;
  durationHours: number;
}

export function CyclingStatsSummary({ stats, durationHours }: CyclingStatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
        <p className="text-sm text-text-secondary">Volume</p>
        <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
          {stats ? formatDistance(stats.summary.totalDistance) : '--'}
        </p>
        <p className="text-xs text-text-muted">Sur {stats?.summary.sessions || 0} sorties</p>
      </div>
      <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
        <p className="text-sm text-text-secondary">Temps passé</p>
        <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
          {stats ? formatDuration(stats.summary.totalDuration) : '--'}
        </p>
        <p className="text-xs text-text-muted">{durationHours.toFixed(1)} h cumulées</p>
      </div>
      <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
        <p className="text-sm text-text-secondary">Cardio moyen</p>
        <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
          {stats?.summary.avgHeartRate ? `${stats.summary.avgHeartRate} bpm` : '--'}
        </p>
        <p className="text-xs text-text-muted">
          Vitesse moyenne {stats?.summary.avgSpeed ? `${stats.summary.avgSpeed} km/h` : '--'}
        </p>
      </div>
      <div className="rounded-2xl border border-border-base bg-panel-bg p-4 shadow-sm space-y-1">
        <p className="text-sm text-text-secondary">Charge (TRIMP)</p>
        <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast mt-1">
          {stats?.summary.totalTrimp ?? '--'}
        </p>
        <p className="text-xs text-text-muted">
          Score de polarisation{' '}
          {stats?.polarization ? `${stats.polarization.score.toFixed(1)}%` : '--'}
        </p>
      </div>
    </div>
  );
}

export default CyclingStatsSummary;
