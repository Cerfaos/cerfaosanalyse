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
      description="Temps passé dans chaque zone sur la période sélectionnée"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zones}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                backgroundColor: 'rgba(10, 25, 26, 0.95)',
                border: '1px solid rgba(139, 195, 74, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: '#9CA3AF' }}
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
            className="p-3 rounded-xl border border-[#8BC34A]/20 bg-[#0A191A]/40 hover:border-[#8BC34A]/40 transition-colors"
          >
            <p className="text-sm font-semibold text-white">{zone.name}</p>
            <p className="text-xs text-gray-400">{zone.description}</p>
            <p className="text-lg font-display mt-2 text-[#8BC34A]">{zone.percentage.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">{formatDuration(zone.seconds)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default ZoneDistributionCard;
