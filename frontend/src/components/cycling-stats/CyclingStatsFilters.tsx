/**
 * Filtres pour les statistiques cardio/cyclisme
 */

import type { CyclingStatsPayload } from '../../types/cyclingStats';
import {
  PERIOD_OPTIONS,
  INDOOR_OPTIONS,
  TYPE_COLORS,
} from '../../utils/cyclingStatsConfig';

interface CyclingStatsFiltersProps {
  stats: CyclingStatsPayload | null;
  period: string;
  onPeriodChange: (period: string) => void;
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  onResetTypes: () => void;
  indoorFilter: string;
  onIndoorFilterChange: (filter: string) => void;
  analysisRangeLabel: string;
}

export function CyclingStatsFilters({
  stats,
  period,
  onPeriodChange,
  selectedTypes,
  onToggleType,
  onResetTypes,
  indoorFilter,
  onIndoorFilterChange,
  analysisRangeLabel,
}: CyclingStatsFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary">
            Période d'analyse
          </p>
          <p className="text-lg font-display text-text-dark dark:text-dark-text-contrast">
            {analysisRangeLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                period === option.value
                  ? 'bg-brand-primary text-[var(--text-primary)] shadow-md'
                  : 'bg-surface-deep/60 border border-[var(--brand-primary)]/20 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]/40'
              }`}
              onClick={() => onPeriodChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par type d'activité */}
      {stats?.availableTypes && stats.availableTypes.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Types d'activités</p>
            <div className="flex flex-wrap gap-2">
              {stats.availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedTypes.length === 0 || selectedTypes.includes(type)
                      ? 'text-[var(--text-primary)] shadow-sm'
                      : 'bg-surface-deep/60 border border-[var(--text-disabled)] text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)]'
                  }`}
                  style={{
                    backgroundColor:
                      selectedTypes.length === 0 || selectedTypes.includes(type)
                        ? TYPE_COLORS[type] || '#6B7280'
                        : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[type] || '#6B7280' }}
                  />
                  {type}
                  {stats.byType.find((t) => t.type === type)?.count && (
                    <span className="opacity-75">
                      ({stats.byType.find((t) => t.type === type)?.count})
                    </span>
                  )}
                </button>
              ))}
              {selectedTypes.length > 0 && (
                <button
                  onClick={onResetTypes}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-card)] transition-all"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Filtre indoor/outdoor */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Lieu</p>
            <div className="flex gap-2">
              {INDOOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onIndoorFilterChange(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    indoorFilter === option.value
                      ? 'bg-brand-secondary text-[var(--surface-deep)] shadow-sm'
                      : 'bg-surface-deep/60 border border-[var(--brand-secondary)]/20 text-[var(--text-tertiary)] hover:border-[var(--brand-secondary)]/40'
                  }`}
                >
                  {option.label}
                  {option.value === 'true' && stats.summary.indoorCount > 0 && (
                    <span className="ml-1 opacity-75">({stats.summary.indoorCount})</span>
                  )}
                  {option.value === 'false' && stats.summary.outdoorCount > 0 && (
                    <span className="ml-1 opacity-75">({stats.summary.outdoorCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CyclingStatsFilters;
