import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry, WeightStats } from "../../types/dashboard";

interface WeightSummaryCardProps {
  stats: WeightStats | null;
  entries: WeightEntry[];
  onNavigate: () => void;
}

const formatWeightDate = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

const getTrendText = (trend: number | null) => {
  if (trend === null) return "Stable";
  if (trend > 0) return `+${trend.toFixed(1)} kg`;
  if (trend < 0) return `${trend.toFixed(1)} kg`;
  return "Stable";
};

const getTrendColor = (trend: number | null) => {
  if (trend === null) return "text-gray-400";
  if (trend > 0) return "text-error";
  if (trend < 0) return "text-success";
  return "text-gray-400";
};

export default function WeightSummaryCard({
  stats,
  entries,
  onNavigate,
}: WeightSummaryCardProps) {
  const latestEntry = entries[0];
  const chartData = entries
    .slice(0, 12)
    .reverse()
    .map((entry) => ({
      label: new Date(entry.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      weight: entry.weight,
    }));

  const displayedWeight = latestEntry?.weight ?? stats?.current;

  if (entries.length === 0) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center text-center gap-4">
        <div className="text-5xl">⚖️</div>
        <div>
          <p className="text-lg font-semibold text-white">
            Aucune pesée enregistrée
          </p>
          <p className="text-sm text-gray-400">
            Ajoutez vos mesures pour suivre l'évolution de votre poids depuis ce
            tableau de bord.
          </p>
        </div>
        <button onClick={onNavigate} className="btn-primary px-5 py-2">
          Ajouter une pesée
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 h-full flex flex-col min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            Suivi du poids
          </p>
          <h3 className="text-2xl font-semibold text-white">
            {displayedWeight !== undefined
              ? `${displayedWeight.toFixed(1)} kg`
              : "-- kg"}
          </h3>
          <p className="text-sm text-gray-400">
            {latestEntry
              ? `Dernière pesée ${formatWeightDate(latestEntry.date)}`
              : "Aucune pesée enregistrée"}
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="text-sm font-medium text-[#8BC34A] hover:text-[#8BC34A]-dark dark:text-[#8BC34A] dark:hover:text-[#8BC34A]-light"
        >
          Gérer →
        </button>
      </div>

      <div className="mt-4 h-32">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
            >
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.9)",
                  borderRadius: 12,
                  borderColor: "#1e293b",
                  color: "#f8fafc",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Ajoutez plusieurs pesées pour afficher une tendance
          </div>
        )}
      </div>

      {stats ? (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Moyenne</p>
            <p className="text-lg font-semibold text-white">
              {stats.average ? `${stats.average.toFixed(1)} kg` : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Plage</p>
            <p className="text-lg font-semibold text-white">
              {stats.min !== null && stats.max !== null
                ? `${stats.min.toFixed(1)} – ${stats.max.toFixed(1)} kg`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Trend 30 jours</p>
            <p
              className={`text-lg font-semibold ${getTrendColor(
                stats.trend30Days
              )}`}
            >
              {getTrendText(stats.trend30Days)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Trend 90 jours</p>
            <p
              className={`text-lg font-semibold ${getTrendColor(
                stats.trend90Days
              )}`}
            >
              {getTrendText(stats.trend90Days)}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          Ajoutez vos pesées pour suivre vos progrès directement depuis ce
          tableau de bord.
        </p>
      )}
    </div>
  );
}
