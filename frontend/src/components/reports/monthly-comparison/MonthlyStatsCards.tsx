/**
 * Cartes de statistiques clés pour la comparaison mensuelle
 */

import { Trophy, Route, Zap, Mountain, Target, BarChart3 } from 'lucide-react';
import type { MonthlyStats } from './monthlyUtils';
import { formatDistance } from './monthlyUtils';

interface MonthlyStatsCardsProps {
  stats: MonthlyStats;
}

export function MonthlyStatsCards({ stats }: MonthlyStatsCardsProps) {
  return (
    <>
      {/* Statistiques clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mois le plus actif */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Trophy className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Plus actif</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{stats.maxActivitiesMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-emerald-400">{stats.maxActivitiesMonth.activities}</span>
              <span className="text-sm text-[var(--text-tertiary)]">activités</span>
            </div>
          </div>
        </div>

        {/* Plus grande distance */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-5 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Route className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-400/80 uppercase tracking-wider">Plus grande distance</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{stats.maxDistanceMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-blue-400">{formatDistance(stats.maxDistanceMonth.distance)}</span>
            </div>
          </div>
        </div>

        {/* Charge max */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">Charge max</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{stats.maxTrimpMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-amber-400">{stats.maxTrimpMonth.trimp.toLocaleString('fr-FR')}</span>
              <span className="text-sm text-[var(--text-tertiary)]">TRIMP</span>
            </div>
          </div>
        </div>

        {/* Dénivelé max */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 p-5 transition-all duration-300 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Mountain className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs font-medium text-orange-400/80 uppercase tracking-wider">Plus de D+</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{stats.maxElevationMonth.monthName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-orange-400">{stats.maxElevationMonth.elevation.toLocaleString('fr-FR')}</span>
              <span className="text-sm text-[var(--text-tertiary)]">m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Moyennes mensuelles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">Moyenne mensuelle</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.avgActivitiesPerMonth} <span className="text-sm font-normal text-[var(--text-tertiary)]">activités/mois</span></p>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">Distance moyenne</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.avgDistancePerMonth} <span className="text-sm font-normal text-[var(--text-tertiary)]">km/mois</span></p>
          </div>
        </div>
      </div>
    </>
  );
}
