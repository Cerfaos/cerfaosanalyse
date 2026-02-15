/**
 * Section graphique d'élévation — Style A Glass
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
    <div
      className="relative rounded-2xl border border-white/[0.08] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15,21,32,0.85) 0%, rgba(15,21,32,0.65) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748b]">
          Profil d'élévation
        </span>
      </div>

      <div className="px-5 pb-5">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.06)" />
              <XAxis dataKey="index" stroke="#475569" hide />
              <YAxis
                stroke="#475569"
                style={{ fontSize: "11px", fontFamily: "var(--font-mono)" }}
                tickFormatter={(value) => `${Math.round(value)}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,21,32,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(8px)",
                }}
                labelStyle={{ color: "#475569", fontSize: "11px" }}
                formatter={(value: number) => [
                  <span key="val" style={{ color: "#10B981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {parseFloat(value.toFixed(1))} m
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

        {/* Footer avec pills colorées */}
        {activity.elevationGain && (
          <div className="relative flex items-center gap-3 mt-4 pt-3">
            {/* Gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {formatElevation(activity.elevationGain)}
              </span>
            </div>
            {activity.elevationLoss && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/15">
                <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-xs font-bold font-mono text-red-400">
                  {formatElevation(activity.elevationLoss)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
