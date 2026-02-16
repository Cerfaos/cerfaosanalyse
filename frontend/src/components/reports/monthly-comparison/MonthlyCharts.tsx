/**
 * Graphiques pour la comparaison mensuelle
 */

import { Activity, Route } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import type { ChartDataPoint, MonthlyStats } from './monthlyUtils';

interface MonthlyChartsProps {
  chartData: ChartDataPoint[];
  stats: MonthlyStats;
}

const tooltipStyle = {
  backgroundColor: 'rgba(10, 25, 21, 0.98)',
  border: '1px solid rgba(139, 195, 74, 0.3)',
  borderRadius: '16px',
  padding: '16px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
};

const tooltipStyleBlue = {
  ...tooltipStyle,
  border: '1px solid rgba(255,255,255,0.1)',
};

export function ActivityVolumeChart({ chartData, stats }: MonthlyChartsProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-primary/20">
            <Activity className="w-4 h-4 text-brand-primary" />
          </div>
          <h4 className="text-lg font-semibold text-[var(--text-primary)]">Volume d'activités</h4>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-primary" />
            <span className="text-[var(--text-tertiary)]">Activités</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-primary/40" />
            <span className="text-[var(--text-tertiary)]">Tendance</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="monthShort"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
              formatter={(value: number) => [`${value} activités`, '']}
              labelFormatter={(label) => {
                const month = chartData.find(d => d.monthShort === label);
                return month?.monthName || label;
              }}
            />
            <Area
              type="monotone"
              dataKey="activities"
              fill="url(#activityGradient)"
              stroke="transparent"
            />
            <Bar dataKey="activities" radius={[6, 6, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.activities === stats.maxActivitiesMonth.activities && entry.activities > 0
                    ? 'var(--brand-primary)'
                    : 'rgba(139, 195, 74, 0.5)'}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="activities"
              stroke="rgba(139, 195, 74, 0.6)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DistanceDurationChart({ chartData }: { chartData: ChartDataPoint[] }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Route className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="text-lg font-semibold text-[var(--text-primary)]">Distance et durée</h4>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="monthShort"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: 'var(--status-info)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#8B5CF6', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyleBlue}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}
              formatter={(value: number, name: string) => {
                if (name === 'distanceKm') return [`${value} km`, 'Distance'];
                if (name === 'durationHours') return [`${value}h`, 'Durée'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const month = chartData.find(d => d.monthShort === label);
                return month?.monthName || label;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => {
                if (value === 'distanceKm') return <span className="text-[var(--text-secondary)] text-sm">Distance (km)</span>;
                if (value === 'durationHours') return <span className="text-[var(--text-secondary)] text-sm">Durée (heures)</span>;
                return value;
              }}
            />
            <Bar yAxisId="left" dataKey="distanceKm" fill="var(--status-info)" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar yAxisId="right" dataKey="durationHours" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
