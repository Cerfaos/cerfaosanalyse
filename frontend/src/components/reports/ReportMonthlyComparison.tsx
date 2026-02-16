/**
 * Composant de comparaison mensuelle pour les rapports
 */

import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MonthlyBreakdown } from '../../types/reports';
import {
  calculateMonthlyStats,
  prepareChartData,
  MonthlyStatsCards,
  ActivityVolumeChart,
  DistanceDurationChart,
  MonthlyDetailTable,
} from './monthly-comparison';

interface Props {
  monthlyBreakdown: MonthlyBreakdown[];
}

export function ReportMonthlyComparison({ monthlyBreakdown }: Props) {
  const stats = calculateMonthlyStats(monthlyBreakdown);
  const chartData = prepareChartData(monthlyBreakdown);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Calendar className="w-5 h-5 text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Analyse Mensuelle
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">{stats.activeMonths} mois actifs sur 12</p>
          </div>
        </div>

        {/* Tendance badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          stats.trend > 0 ? 'bg-emerald-500/10 border border-emerald-500/30' :
          stats.trend < 0 ? 'bg-red-500/10 border border-red-500/30' :
          'bg-gray-500/10 border border-gray-500/30'
        }`}>
          {stats.trend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
           stats.trend < 0 ? <TrendingDown className="w-4 h-4 text-red-400" /> :
           <Minus className="w-4 h-4 text-[var(--text-tertiary)]" />}
          <span className={`text-sm font-semibold ${
            stats.trend > 0 ? 'text-emerald-400' : stats.trend < 0 ? 'text-red-400' : 'text-[var(--text-tertiary)]'
          }`}>
            {stats.trend > 0 ? '+' : ''}{stats.trendPercent}% S2 vs S1
          </span>
        </div>
      </div>

      <MonthlyStatsCards stats={stats} />
      <ActivityVolumeChart chartData={chartData} stats={stats} />
      <DistanceDurationChart chartData={chartData} />
      <MonthlyDetailTable monthlyBreakdown={monthlyBreakdown} stats={stats} />
    </section>
  );
}
