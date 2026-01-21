/**
 * Section analyse des zones de fréquence cardiaque
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "../ui/GlassCard";
import type { Activity } from "../../types/activity";
import type { HRZonesResult } from "../../utils/heartRateCalculations";

interface HRZonesSectionProps {
  hrZonesData: HRZonesResult;
  activity: Activity;
}

export default function HRZonesSection({ hrZonesData, activity }: HRZonesSectionProps) {
  return (
    <GlassCard
      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: "650ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--status-error)]/10 flex items-center justify-center text-2xl border border-[var(--status-error)]/20">
            ❤️
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--status-error)] font-semibold">
              Entraînement
            </p>
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              Analyse des zones FC
            </h3>
          </div>
        </div>
        <div
          className="px-4 py-2 rounded-xl border text-sm font-semibold"
          style={{
            backgroundColor: `${hrZonesData.currentZone.color}15`,
            borderColor: `${hrZonesData.currentZone.color}40`,
            color: hrZonesData.currentZone.color,
          }}
        >
          {hrZonesData.currentZone.name}
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl mb-6 bg-gradient-to-r from-[var(--status-error)]/5 via-transparent to-[var(--accent-secondary)]/5 border border-[var(--status-error)]/10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[var(--status-error)] rounded-full animate-pulse" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-[var(--text-tertiary)]">
              Zone:{" "}
              <strong className="text-[var(--text-primary)]">
                {hrZonesData.currentZone.min}-{hrZonesData.currentZone.max} bpm
              </strong>
            </span>
            <span className="text-[var(--text-tertiary)]">
              FC moyenne:{" "}
              <strong className="text-[var(--status-error)]">{activity.avgHeartRate} bpm</strong>
            </span>
            <span className="text-[var(--text-tertiary)]">
              FC max:{" "}
              <strong className="text-[var(--text-secondary)]">
                {activity.maxHeartRate} bpm
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hrZonesData.zones} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis
              dataKey="name"
              stroke="var(--text-tertiary)"
              style={{ fontSize: "10px" }}
              tick={{ fill: "var(--text-tertiary)" }}
            />
            <YAxis
              stroke="var(--text-tertiary)"
              style={{ fontSize: "10px" }}
              tick={{ fill: "var(--text-tertiary)" }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              }}
              labelStyle={{
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Bar dataKey="min" fill="#3B82F6" name="Min BPM" radius={[4, 4, 0, 0]} />
            <Bar dataKey="max" fill="#f8712f" name="Max BPM" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
        {hrZonesData.zones.map((zone) => (
          <div
            key={zone.zone}
            className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${zone.color}10` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
            <span className="text-[var(--text-tertiary)]">{zone.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
