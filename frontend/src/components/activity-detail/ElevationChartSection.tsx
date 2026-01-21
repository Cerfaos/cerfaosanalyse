/**
 * Section graphique d'élévation
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "../ui/GlassCard";
import type { Activity } from "../../types/activity";

interface ElevationChartSectionProps {
  data: { index: number; elevation: number | undefined }[];
  activity: Activity;
  formatElevation: (v: number | null | undefined) => string;
}

export default function ElevationChartSection({
  data,
  activity,
  formatElevation,
}: ElevationChartSectionProps) {
  return (
    <GlassCard
      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: "600ms" }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--status-success)]/10 flex items-center justify-center text-2xl border border-[var(--status-success)]/20">
          ⛰️
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--status-success)] font-semibold">
            Altitude
          </p>
          <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Profil d'élévation
          </h3>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="index" stroke="var(--text-tertiary)" hide />
            <YAxis
              stroke="var(--text-tertiary)"
              style={{ fontSize: "11px" }}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              }}
              labelStyle={{ color: "var(--text-tertiary)", fontSize: "11px" }}
              formatter={(value: number) => [
                <span key="val" style={{ color: "#10B981", fontWeight: 600 }}>
                  {value} m
                </span>,
                "Altitude",
              ]}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#elevationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {activity.elevationGain && (
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--status-success)] rounded-full" />
            <span className="text-sm text-[var(--text-tertiary)]">Dénivelé +</span>
            <span className="font-semibold text-[var(--status-success)]">
              {formatElevation(activity.elevationGain)}
            </span>
          </div>
          {activity.elevationLoss && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--status-error)] rounded-full" />
              <span className="text-sm text-[var(--text-tertiary)]">Dénivelé -</span>
              <span className="font-semibold text-[var(--status-error)]">
                {formatElevation(activity.elevationLoss)}
              </span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
