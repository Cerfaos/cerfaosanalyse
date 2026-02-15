/**
 * Section analyse des zones de fréquence cardiaque — Style B Raised
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
import type { Activity } from "../../types/activity";
import type { HRZonesResult } from "../../utils/heartRateCalculations";

interface HRZonesSectionProps {
  hrZonesData: HRZonesResult;
  activity: Activity;
}

export default function HRZonesSection({ hrZonesData, activity }: HRZonesSectionProps) {
  return (
    <div
      className="relative rounded-2xl border border-[#1e293b]/60 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0f1520 0%, #0c1017 100%)" }}
    >
      {/* Accent bar gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-red-500/60 via-red-500/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]/40">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748b]">
            Analyse des zones FC
          </span>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg border text-xs font-bold"
          style={{
            backgroundColor: `${hrZonesData.currentZone.color}15`,
            borderColor: `${hrZonesData.currentZone.color}40`,
            color: hrZonesData.currentZone.color,
          }}
        >
          {hrZonesData.currentZone.name}
        </div>
      </div>

      <div className="p-5">
        {/* Zone info banner gradient */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-5 border border-red-500/10"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
          }}
        >
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-[#475569]">
              Zone :{" "}
              <strong className="text-white font-mono">
                {hrZonesData.currentZone.min}-{hrZonesData.currentZone.max} bpm
              </strong>
            </span>
            <span className="text-[#475569]">
              FC moyenne :{" "}
              <strong className="text-red-400 font-mono">{activity.avgHeartRate} bpm</strong>
            </span>
            <span className="text-[#475569]">
              FC max :{" "}
              <strong className="text-white font-mono">
                {activity.maxHeartRate} bpm
              </strong>
            </span>
          </div>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hrZonesData.zones} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.06)" />
              <XAxis
                dataKey="name"
                stroke="#475569"
                style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
                tick={{ fill: "#475569" }}
              />
              <YAxis
                stroke="#475569"
                style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
                tick={{ fill: "#475569" }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,21,32,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                }}
                labelStyle={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="min" fill="#3B82F6" name="Min BPM" radius={[4, 4, 0, 0]} />
              <Bar dataKey="max" fill="#f8712f" name="Max BPM" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Légende avec mini-cards hover */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#1e293b]/40">
          {hrZonesData.zones.map((zone) => (
            <div
              key={zone.zone}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-transparent hover:border-white/[0.06] transition-all duration-200 cursor-default"
              style={{ backgroundColor: `${zone.color}08` }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_var(--glow)]"
                style={{
                  backgroundColor: zone.color,
                  "--glow": `${zone.color}40`,
                } as React.CSSProperties}
              />
              <span className="text-[#64748b]">{zone.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
