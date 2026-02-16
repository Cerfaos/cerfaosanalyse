/**
 * Cartes des métriques CTL/ATL/TSB
 */

import MetricInfo from "../ui/MetricInfo";
import type { CurrentLoad } from "../../types/trainingLoad";

interface MetricCardsProps {
  currentLoad: CurrentLoad;
}

export function MetricCards({ currentLoad }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CTL */}
      <div className="glass-panel p-5 border">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-text-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-secondary"></span>
            CTL - Forme
          </p>
          <MetricInfo metric="ctl" />
        </div>
        <p className="text-3xl font-semibold text-brand-secondary">{currentLoad.ctl}</p>
        <p className="text-xs text-text-muted mt-1">Charge chronique sur 42 jours</p>
        <div className="mt-3 pt-3 border-t border-border-base/30">
          <p className="text-xs text-text-secondary">
            {currentLoad.ctl < 30 && "Niveau débutant. Augmentez progressivement."}
            {currentLoad.ctl >= 30 && currentLoad.ctl < 60 && "Niveau intermédiaire. Bonne base d'endurance."}
            {currentLoad.ctl >= 60 && currentLoad.ctl < 100 && "Niveau avancé. Forme solide !"}
            {currentLoad.ctl >= 100 && "Niveau expert. Excellente condition physique."}
          </p>
        </div>
      </div>

      {/* ATL */}
      <div className="glass-panel p-5 border">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-text-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-metric-alert"></span>
            ATL - Fatigue
          </p>
          <MetricInfo metric="atl" />
        </div>
        <p className="text-3xl font-semibold text-metric-alert">{currentLoad.atl}</p>
        <p className="text-xs text-text-muted mt-1">Charge aiguë sur 7 jours</p>
        <div className="mt-3 pt-3 border-t border-border-base/30">
          <p className="text-xs text-text-secondary">
            {currentLoad.atl <= currentLoad.ctl * 0.8 && "Fatigue basse. Marge pour intensifier."}
            {currentLoad.atl > currentLoad.ctl * 0.8 &&
              currentLoad.atl <= currentLoad.ctl * 1.2 &&
              "Fatigue modérée. Bon équilibre charge/récup."}
            {currentLoad.atl > currentLoad.ctl * 1.2 && "Fatigue élevée. Pensez à récupérer."}
          </p>
        </div>
      </div>

      {/* TSB */}
      <div className="glass-panel p-5 border">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-text-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-primary"></span>
            TSB - Équilibre
          </p>
          <MetricInfo metric="tsb" />
        </div>
        <p
          className={`text-3xl font-semibold ${currentLoad.tsb > 0 ? "text-success" : currentLoad.tsb < -20 ? "text-error" : "text-warning"}`}
        >
          {currentLoad.tsb > 0 ? "+" : ""}
          {currentLoad.tsb}
        </p>
        <p className="text-xs text-text-muted mt-1">CTL - ATL = Fraîcheur</p>
      </div>
    </div>
  );
}
