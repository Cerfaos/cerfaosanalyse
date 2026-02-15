/**
 * Section données supplémentaires — Style B Raised, compact
 */

import type { Activity } from "../../types/activity";

interface AdditionalDataSectionProps {
  activity: Activity;
  formatSpeed: (kmh: number | null) => string;
  formatPace: (kmh: number | null) => string;
  getTrimpColor: (t: number | null) => string;
}

export default function AdditionalDataSection({
  activity,
  formatSpeed,
  formatPace,
  getTrimpColor,
}: AdditionalDataSectionProps) {
  // Collecter les cards qui ont des données
  const cards: { accentColor: string; title: string; rows: { label: string; value: string | number; unit?: string; colorClass?: string }[] }[] = [];

  if (activity.avgHeartRate || activity.maxHeartRate) {
    const rows: typeof cards[0]["rows"] = [];
    if (activity.avgHeartRate) rows.push({ label: "FC moy.", value: activity.avgHeartRate, unit: "bpm" });
    if (activity.maxHeartRate) rows.push({ label: "FC max.", value: activity.maxHeartRate, unit: "bpm" });
    if (activity.trimp) rows.push({ label: "TRIMP", value: activity.trimp, colorClass: getTrimpColor(activity.trimp) });
    cards.push({ accentColor: "#ef4444", title: "Cardio", rows });
  }

  if (activity.avgSpeed || activity.maxSpeed) {
    const rows: typeof cards[0]["rows"] = [];
    if (activity.avgSpeed) rows.push({ label: "Vit. moy.", value: formatSpeed(activity.avgSpeed) });
    if (activity.maxSpeed) rows.push({ label: "Vit. max.", value: formatSpeed(activity.maxSpeed) });
    if (activity.avgSpeed) rows.push({ label: "Allure", value: formatPace(activity.avgSpeed), colorClass: "text-[var(--accent-primary)]" });
    cards.push({ accentColor: "#3b82f6", title: "Vitesse", rows });
  }

  if (activity.avgPower || activity.normalizedPower) {
    const rows: typeof cards[0]["rows"] = [];
    if (activity.avgPower) rows.push({ label: "Puiss. moy.", value: activity.avgPower, unit: "W" });
    if (activity.normalizedPower) rows.push({ label: "Puiss. norm.", value: activity.normalizedPower, unit: "W", colorClass: "text-amber-400" });
    cards.push({ accentColor: "#f59e0b", title: "Puissance", rows });
  }

  if (activity.avgCadence || activity.calories) {
    const rows: typeof cards[0]["rows"] = [];
    if (activity.avgCadence) rows.push({ label: "Cadence", value: activity.avgCadence, unit: "rpm" });
    if (activity.calories) rows.push({ label: "Calories", value: activity.calories, unit: "kcal", colorClass: "text-[var(--accent-primary)]" });
    cards.push({ accentColor: "#a855f7", title: "Autres", rows });
  }

  if (cards.length === 0) return null;

  // Grille adaptative : 2 cols si 2 cards, 3 cols si 3+, 4 cols si 4
  const gridClass = cards.length === 1
    ? "grid-cols-1 max-w-md"
    : cards.length === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : cards.length === 3
    ? "grid-cols-1 sm:grid-cols-3"
    : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative rounded-xl border border-[#1e293b]/60 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0f1520 0%, #0c1017 100%)" }}
        >
          {/* Accent bar gauche */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
            style={{ backgroundColor: card.accentColor, opacity: 0.5 }}
          />

          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e293b]/40">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: card.accentColor }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748b]">
              {card.title}
            </span>
          </div>

          <div className="px-4 py-3">
            {card.rows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-1.5 hover:bg-white/[0.02] -mx-1.5 px-1.5 rounded transition-colors duration-150"
              >
                <span className="text-xs text-[#475569]">{row.label}</span>
                <span className={`text-sm font-bold font-mono ${row.colorClass || "text-white"}`}>
                  {row.value}
                  {row.unit && <span className="text-[10px] text-[#475569] ml-0.5">{row.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
