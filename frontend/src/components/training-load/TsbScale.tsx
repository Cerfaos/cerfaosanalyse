/**
 * Échelle visuelle du TSB
 */

import { TSB_ZONES, getTsbPosition } from "../../types/trainingLoad";

interface TsbScaleProps {
  tsb: number;
}

export function TsbScale({ tsb }: TsbScaleProps) {
  return (
    <div className="glass-panel p-6 border">
      <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-4 flex items-center gap-2">
        <span>⚖️</span> Votre équilibre actuel
      </h3>

      {/* Barre de progression TSB */}
      <div className="relative mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {TSB_ZONES.map((zone, i) => (
            <div key={i} className={`${zone.color} opacity-60`} style={{ width: `${((zone.max - zone.min) / 80) * 100}%` }} />
          ))}
        </div>

        {/* Marqueur de position */}
        <div
          className="absolute top-0 h-8 w-1 bg-white shadow-lg transition-all duration-500"
          style={{ left: `${getTsbPosition(tsb)}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
            {tsb > 0 ? "+" : ""}
            {tsb}
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>-40</span>
          <span>-20</span>
          <span>0</span>
          <span>+20</span>
          <span>+40</span>
        </div>
      </div>

      {/* Légende des zones */}
      <div className="flex flex-wrap gap-3 justify-center">
        {TSB_ZONES.map((zone, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className={`w-3 h-3 rounded-full ${zone.color}`}></span>
            <span className={zone.textColor}>{zone.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
