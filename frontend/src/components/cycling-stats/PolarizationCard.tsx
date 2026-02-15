/**
 * Carte d'index de polarisation 80/10/10
 */

import { Card } from '../ui/Card';
import type { PolarizationSummary, ZoneComputationSource } from '../../types/cyclingStats';
import { formatDuration, INTENSITY_COLORS } from '../../utils/cyclingStatsConfig';

interface PolarizationCardProps {
  polarization: PolarizationSummary;
  sampling: Record<ZoneComputationSource, number>;
}

export function PolarizationCard({ polarization, sampling }: PolarizationCardProps) {
  return (
    <Card
      title="Index de polarisation 80/10/10"
      description="Idéal: 80% en endurance (Z1-Z2), 10% tempo (Z3), 10% haute intensité (Z4-Z5)."
    >
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-brand/20">
          <p className="text-sm text-text-secondary">Score</p>
          <p className="text-4xl font-semibold text-text-dark dark:text-dark-text-contrast">
            {polarization.score.toFixed(1)}%
          </p>
          <p className="text-sm text-text-muted mt-2">{polarization.message}</p>
        </div>
        {(['low', 'moderate', 'high'] as const).map((key) => (
          <div key={key}>
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>
                {key === 'low'
                  ? 'Z1-Z2 • Endurance'
                  : key === 'moderate'
                  ? 'Z3 • Tempo'
                  : 'Z4-Z5 • Haute intensité'}
              </span>
              <span>
                {polarization.percentages[key].toFixed(1)}% • cible {polarization.target[key]}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-border-base overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${polarization.percentages[key]}%`,
                  backgroundColor: INTENSITY_COLORS[key],
                }}
              ></div>
            </div>
            <p className="text-xs text-text-muted mt-1">{formatDuration(polarization.totals[key])}</p>
          </div>
        ))}
        <div className="rounded-xl border border-border-base p-3 text-sm text-text-secondary">
          <p className="font-semibold mb-1">Qualité des données</p>
          <p>
            {sampling.samples} sorties avec trace cardio • {sampling.average} estimées via FC
            moyenne • {sampling.none} sans données
          </p>
        </div>
      </div>
    </Card>
  );
}

export default PolarizationCard;
