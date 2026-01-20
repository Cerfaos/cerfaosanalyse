import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityTimelinePoint } from "../../types/dashboard";

interface ActivityTimelineCardProps {
  data: ActivityTimelinePoint[];
  formatDuration: (seconds: number) => string;
}

function ActivityTimelineTooltip({
  active,
  payload,
  formatDuration,
}: {
  active?: boolean;
  payload?: { payload: ActivityTimelinePoint }[];
  formatDuration: (seconds: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const day = payload[0].payload as ActivityTimelinePoint;

  return (
    <div className="rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/95 backdrop-blur-sm px-4 py-3 text-xs shadow-xl">
      <p className="font-bold text-sm text-white">{day.label}</p>
      <p className="text-[#8BC34A] font-semibold">
        {day.count} activité{day.count > 1 ? "s" : ""}
      </p>
      <div className="mt-2 space-y-1">
        <p className="text-white">
          Distance:{" "}
          <span className="font-semibold text-[#5CE1E6]">
            {day.distanceKm.toFixed(1)} km
          </span>
        </p>
        <p className="text-white">
          Durée:{" "}
          <span className="text-gray-300">{formatDuration(day.duration)}</span>
        </p>
        <p className="text-white">
          TRIMP:{" "}
          <span className="font-semibold text-[#FFAB40]">{day.trimp}</span>
        </p>
      </div>
    </div>
  );
}

export default function ActivityTimelineCard({
  data,
  formatDuration,
}: ActivityTimelineCardProps) {
  const totalDistance = data.reduce((sum, day) => sum + day.distanceKm, 0);
  const totalTrimp = data.reduce((sum, day) => sum + day.trimp, 0);
  const bestDistanceDay = data.reduce<ActivityTimelinePoint | null>(
    (best, day) => {
      if (!best || day.distanceKm > best.distanceKm) return day;
      return best;
    },
    null
  );
  const bestTrimpDay = data.reduce<ActivityTimelinePoint | null>(
    (best, day) => {
      if (!best || day.trimp > best.trimp) return day;
      return best;
    },
    null
  );

  return (
    <div className="glass-panel p-6 h-full min-w-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            Charge journalière
          </p>
          <h3 className="text-xl font-semibold text-white">
            Volumes d'activité
          </h3>
        </div>
        {data.length > 0 && (
          <span className="text-xs text-gray-400">
            {data.length} jour{data.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {data.length > 0 ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="distanceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="trimpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.4}
              />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis
                yAxisId="distance"
                stroke="#94a3b8"
                tickFormatter={(value) => `${value} km`}
                width={55}
              />
              <YAxis
                yAxisId="trimp"
                orientation="right"
                stroke="#fdba74"
                tickFormatter={(value) => `${value}`}
                width={45}
              />
              <Tooltip
                content={
                  <ActivityTimelineTooltip formatDuration={formatDuration} />
                }
              />
              <Area
                yAxisId="distance"
                type="monotone"
                dataKey="distanceKm"
                stroke="#6366f1"
                fill="url(#distanceGradient)"
                strokeWidth={2}
              />
              <Area
                yAxisId="trimp"
                type="monotone"
                dataKey="trimp"
                stroke="#f97316"
                fill="url(#trimpGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          Pas assez d'activités pour tracer un graphique sur cette période.
        </p>
      )}

      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-gray-400">Distance cumulée</p>
            <p className="text-lg font-semibold text-white">
              {totalDistance.toFixed(1)} km
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-gray-400">Jour le plus long</p>
            <p className="text-lg font-semibold text-white">
              {bestDistanceDay
                ? `${
                    bestDistanceDay.label
                  } · ${bestDistanceDay.distanceKm.toFixed(1)} km`
                : "—"}
            </p>
            {bestDistanceDay && (
              <p className="text-xs text-gray-400">
                {bestDistanceDay.count} sortie
                {bestDistanceDay.count > 1 ? "s" : ""} ·{" "}
                {formatDuration(bestDistanceDay.duration)}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-gray-400">TRIMP cumulé</p>
            <p className="text-lg font-semibold text-white">
              {Math.round(totalTrimp)} pts
            </p>
            {bestTrimpDay && (
              <p className="text-xs text-gray-400">
                Pic : {bestTrimpDay.label} ({bestTrimpDay.trimp} pts)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
