/**
 * Section des statistiques de la semaine
 */

import { TrendingUp, TrendingDown } from "lucide-react";

interface WeekStats {
  sessionCount: number;
  completedCount: number;
  totalTss: number;
  totalDuration: number;
  completionRate: number;
}

interface WeekStatsSectionProps {
  weekStats: WeekStats;
}

export function WeekStatsSection({ weekStats }: WeekStatsSectionProps) {
  const completionStatus =
    weekStats.completionRate >= 80
      ? { label: "Excellent", color: "text-green-500", Icon: TrendingUp }
      : weekStats.completionRate >= 50
        ? { label: "En cours", color: "text-yellow-500", Icon: TrendingUp }
        : { label: "À améliorer", color: "text-red-500", Icon: TrendingDown };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
        <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Séances</p>
        <p className="text-xl md:text-2xl font-bold text-white">{weekStats.sessionCount}</p>
      </div>
      <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
        <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Complétées</p>
        <p className="text-xl md:text-2xl font-bold text-[#8BC34A]">{weekStats.completedCount}</p>
      </div>
      <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
        <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">TSS Total</p>
        <p className="text-xl md:text-2xl font-bold text-[#5CE1E6]">{weekStats.totalTss}</p>
      </div>
      <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
        <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Durée</p>
        <p className="text-xl md:text-2xl font-bold text-[#FFAB40]">{Math.round(weekStats.totalDuration / 60)}h</p>
      </div>
      <div className="glass-panel p-3 md:p-4 text-center col-span-2 sm:col-span-1 hover:scale-[1.02] transition-transform">
        <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Complétion</p>
        <div className="flex items-center justify-center gap-2">
          <completionStatus.Icon className={`h-4 w-4 md:h-5 md:w-5 ${completionStatus.color}`} />
          <p className={`text-xl md:text-2xl font-bold ${completionStatus.color}`}>{weekStats.completionRate}%</p>
        </div>
        <p className={`text-xs ${completionStatus.color}`}>{completionStatus.label}</p>
      </div>
    </div>
  );
}
