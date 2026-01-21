/**
 * Section données supplémentaires (cardio, vitesse, puissance, autres)
 */

import { GlassCard } from "../ui/GlassCard";
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cardio */}
      {(activity.avgHeartRate || activity.maxHeartRate) && (
        <GlassCard
          className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "700ms" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-error)]/10 flex items-center justify-center text-lg border border-[var(--status-error)]/20 group-hover:scale-110 transition-transform duration-300">
              ❤️
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Cardio</h3>
          </div>
          <div className="space-y-3">
            {activity.avgHeartRate && (
              <DataRow label="FC moyenne" value={activity.avgHeartRate} unit="bpm" />
            )}
            {activity.maxHeartRate && (
              <DataRow label="FC maximale" value={activity.maxHeartRate} unit="bpm" />
            )}
            {activity.trimp && (
              <DataRow
                label="TRIMP"
                value={activity.trimp}
                colorClass={getTrimpColor(activity.trimp)}
                noBorder
              />
            )}
          </div>
        </GlassCard>
      )}

      {/* Vitesse */}
      {(activity.avgSpeed || activity.maxSpeed) && (
        <GlassCard
          className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "750ms" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-info)]/10 flex items-center justify-center text-lg border border-[var(--status-info)]/20 group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Vitesse</h3>
          </div>
          <div className="space-y-3">
            {activity.avgSpeed && (
              <DataRow label="Vitesse moyenne" value={formatSpeed(activity.avgSpeed)} />
            )}
            {activity.maxSpeed && (
              <DataRow label="Vitesse maximale" value={formatSpeed(activity.maxSpeed)} />
            )}
            {activity.avgSpeed && (
              <DataRow
                label="Allure moyenne"
                value={formatPace(activity.avgSpeed)}
                colorClass="text-[var(--accent-primary)]"
                noBorder
              />
            )}
          </div>
        </GlassCard>
      )}

      {/* Puissance */}
      {(activity.avgPower || activity.normalizedPower) && (
        <GlassCard
          className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "800ms" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 flex items-center justify-center text-lg border border-[var(--accent-secondary)]/20 group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Puissance
            </h3>
          </div>
          <div className="space-y-3">
            {activity.avgPower && (
              <DataRow label="Puissance moyenne" value={activity.avgPower} unit="W" />
            )}
            {activity.normalizedPower && (
              <DataRow
                label="Puissance normalisée"
                value={activity.normalizedPower}
                unit="W"
                colorClass="text-[var(--accent-secondary)]"
                noBorder
              />
            )}
          </div>
        </GlassCard>
      )}

      {/* Autres */}
      {(activity.avgCadence || activity.calories) && (
        <GlassCard
          className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "850ms" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Autres données
            </h3>
          </div>
          <div className="space-y-3">
            {activity.avgCadence && (
              <DataRow label="Cadence moyenne" value={activity.avgCadence} unit="rpm" />
            )}
            {activity.calories && (
              <DataRow
                label="Calories"
                value={activity.calories}
                unit="kcal"
                colorClass="text-[var(--accent-primary)]"
                noBorder
              />
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

interface DataRowProps {
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string;
  noBorder?: boolean;
}

function DataRow({
  label,
  value,
  unit,
  colorClass = "text-[var(--text-primary)]",
  noBorder = false,
}: DataRowProps) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${
        noBorder ? "" : "border-b border-[var(--border-subtle)]"
      }`}
    >
      <span className="text-sm text-[var(--text-tertiary)]">{label}</span>
      <span className={`font-semibold ${colorClass}`}>
        {value}
        {unit && <span className="text-xs text-[var(--text-tertiary)] ml-1">{unit}</span>}
      </span>
    </div>
  );
}
