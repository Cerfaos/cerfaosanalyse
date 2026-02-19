/**
 * Carte de répartition des zones cardio
 */

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { Card } from '../ui/Card';
import type { ZoneDistribution } from '../../types/cyclingStats';
import { formatDuration } from '../../utils/cyclingStatsConfig';

interface ZoneDistributionCardProps {
  zones: ZoneDistribution[];
}

export function ZoneDistributionCard({ zones }: ZoneDistributionCardProps) {
  return (
    <Card
      title="Répartition des zones"
      description="Temps passé dans chaque zone sur la période sélectionnée."
    >
      <p className="text-xs text-text-muted leading-relaxed mb-4">
        L'idéal est de concentrer ~80% du temps en Z1-Z2 (endurance fondamentale), ~10% en Z3 (tempo)
        et ~10% en Z4-Z5 (haute intensité). Si votre Z3 est trop élevée, vous passez trop de temps
        en "zone grise" — un effort trop dur pour récupérer mais pas assez intense pour progresser.
        Trop de temps en Z4-Z5 peut indiquer un risque de surentraînement.
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zones}>
            <XAxis dataKey="name" stroke="var(--text-tertiary)" />
            <YAxis stroke="var(--text-tertiary)" tickFormatter={(value) => `${value}%`} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                backgroundColor: 'var(--surface-deep)',
                border: '1px solid var(--brand-primary-subtle)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: 'var(--text-tertiary)' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Temps']}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {zones.map((zone) => (
                <Cell key={zone.zone} fill={zone.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {zones.map((zone) => (
          <div
            key={zone.zone}
            className="p-3 rounded-xl border border-[var(--brand-primary)]/20 bg-surface-deep/40 hover:border-[var(--brand-primary)]/40 transition-colors"
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">{zone.name}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{zone.description}</p>
            <p className="text-lg font-display mt-2 text-brand-primary">{zone.percentage.toFixed(1)}%</p>
            <p className="text-xs text-[var(--text-disabled)]">{formatDuration(zone.seconds)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default ZoneDistributionCard;
