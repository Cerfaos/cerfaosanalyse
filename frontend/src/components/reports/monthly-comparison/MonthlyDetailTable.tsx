/**
 * Tableau détaillé de la comparaison mensuelle
 */

import { BarChart3, Trophy } from 'lucide-react';
import type { MonthlyBreakdown } from '../../../types/reports';
import type { MonthlyStats } from './monthlyUtils';
import { formatDuration, formatDistance } from './monthlyUtils';

interface MonthlyDetailTableProps {
  monthlyBreakdown: MonthlyBreakdown[];
  stats: MonthlyStats;
}

export function MonthlyDetailTable({ monthlyBreakdown, stats }: MonthlyDetailTableProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-semibold text-white">Détail mensuel</h4>
        </div>
        <div className="text-sm text-gray-400">
          {stats.totalActivities} activités sur l'année
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mois</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Activités</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Distance</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Durée</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">D+</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">TRIMP</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBreakdown.map((month) => {
              const isMaxActivities = month.activities === stats.maxActivitiesMonth.activities && month.activities > 0;
              const isMaxDistance = month.distance === stats.maxDistanceMonth.distance && month.distance > 0;
              const isMaxTrimp = month.trimp === stats.maxTrimpMonth.trimp && month.trimp > 0;
              const activityPercent = stats.maxActivitiesMonth.activities > 0
                ? (month.activities / stats.maxActivitiesMonth.activities) * 100
                : 0;

              return (
                <tr
                  key={month.month}
                  className={`border-b border-white/5 transition-all duration-200 hover:bg-white/[0.04] ${
                    month.activities === 0 ? 'opacity-40' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${month.activities > 0 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                      <span className="font-medium text-white">{month.monthName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[100px]">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isMaxActivities ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-emerald-500/50'
                            }`}
                            style={{ width: `${activityPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-semibold min-w-[24px] ${isMaxActivities ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {month.activities}
                      </span>
                      {isMaxActivities && (
                        <Trophy className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </td>
                  <td className={`p-4 text-right text-sm ${isMaxDistance ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                    {month.distance > 0 ? formatDistance(month.distance) : '-'}
                  </td>
                  <td className="p-4 text-right text-sm text-gray-300">
                    {month.duration > 0 ? formatDuration(month.duration) : '-'}
                  </td>
                  <td className="p-4 text-right text-sm text-gray-300">
                    {month.elevation > 0 ? `${month.elevation.toLocaleString('fr-FR')} m` : '-'}
                  </td>
                  <td className={`p-4 text-right text-sm ${isMaxTrimp ? 'text-amber-400 font-semibold' : 'text-gray-300'}`}>
                    {month.trimp > 0 ? month.trimp.toLocaleString('fr-FR') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-[#8BC34A]/10 to-transparent">
              <td className="p-4">
                <span className="font-bold text-white">Total annuel</span>
              </td>
              <td className="p-4">
                <span className="font-bold text-emerald-400">{stats.totalActivities}</span>
              </td>
              <td className="p-4 text-right">
                <span className="font-bold text-blue-400">{formatDistance(stats.totalDistance)}</span>
              </td>
              <td className="p-4 text-right">
                <span className="font-bold text-purple-400">{formatDuration(stats.totalDuration)}</span>
              </td>
              <td className="p-4 text-right">
                <span className="font-bold text-orange-400">{stats.totalElevation.toLocaleString('fr-FR')} m</span>
              </td>
              <td className="p-4 text-right">
                <span className="font-bold text-amber-400">{stats.totalTrimp.toLocaleString('fr-FR')}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
