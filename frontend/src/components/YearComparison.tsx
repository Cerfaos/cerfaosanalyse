import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";

interface MonthData {
  month: string;
  currentYear: number;
  previousYear: number;
}

interface YearStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalTrimp: number;
  avgDistance: number;
  avgDuration: number;
}

export default function YearComparison() {
  const [metric, setMetric] = useState<
    "distance" | "duration" | "trimp" | "count"
  >("distance");
  const [currentYearData, setCurrentYearData] = useState<MonthData[]>([]);
  const [yearStats, setYearStats] = useState<{
    current: YearStats;
    previous: YearStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Années sélectionnables (2025 à 2030)
  const thisYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [comparedYear, setComparedYear] = useState(thisYear - 1);

  // Liste des années disponibles (2025 à 2030)
  const availableYears = [2025, 2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    fetchComparison();
  }, [selectedYear, comparedYear]);

  const fetchComparison = async () => {
    try {
      setLoading(true);

      // Utiliser startDate et endDate pour filtrer par année
      const [currentRes, previousRes] = await Promise.all([
        api.get(`/api/activities?startDate=${selectedYear}-01-01&endDate=${selectedYear}-12-31&limit=1000`),
        api.get(`/api/activities?startDate=${comparedYear}-01-01&endDate=${comparedYear}-12-31&limit=1000`),
      ]);

      const currentActivities = currentRes.data.data.data || currentRes.data.data.activities || [];
      const previousActivities = previousRes.data.data.data || previousRes.data.data.activities || [];

      // Grouper par mois
      const monthNames = [
        "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
        "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
      ];

      const monthlyData: MonthData[] = monthNames.map((month, index) => {
        const currentMonthActivities = currentActivities.filter((a: any) => {
          const date = new Date(a.date);
          return date.getMonth() === index;
        });

        const previousMonthActivities = previousActivities.filter((a: any) => {
          const date = new Date(a.date);
          return date.getMonth() === index;
        });

        return {
          month,
          currentYear: calculateMetric(currentMonthActivities, metric),
          previousYear: calculateMetric(previousMonthActivities, metric),
        };
      });

      setCurrentYearData(monthlyData);

      // Calculer les stats annuelles
      setYearStats({
        current: calculateYearStats(currentActivities),
        previous: calculateYearStats(previousActivities),
      });
    } catch (error) {
      // Silencieux
    } finally {
      setLoading(false);
    }
  };

  const calculateMetric = (activities: any[], metricType: string): number => {
    switch (metricType) {
      case "distance":
        return Math.round(
          activities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000
        );
      case "duration":
        return Math.round(
          activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 3600
        );
      case "trimp":
        return Math.round(
          activities.reduce((sum, a) => sum + (a.trimp || 0), 0)
        );
      case "count":
        return activities.length;
      default:
        return 0;
    }
  };

  const calculateYearStats = (activities: any[]): YearStats => {
    const totalDistance = activities.reduce(
      (sum, a) => sum + (a.distance || 0),
      0
    );
    const totalDuration = activities.reduce(
      (sum, a) => sum + (a.duration || 0),
      0
    );
    const totalTrimp = activities.reduce((sum, a) => sum + (a.trimp || 0), 0);

    return {
      totalActivities: activities.length,
      totalDistance,
      totalDuration,
      totalTrimp,
      avgDistance:
        activities.length > 0 ? totalDistance / activities.length : 0,
      avgDuration:
        activities.length > 0 ? totalDuration / activities.length : 0,
    };
  };

  useEffect(() => {
    if (!loading && yearStats) {
      fetchComparison();
    }
  }, [metric]);

  const getMetricLabel = () => {
    switch (metric) {
      case "distance":
        return "Distance (km)";
      case "duration":
        return "Durée (heures)";
      case "trimp":
        return "TRIMP (points)";
      case "count":
        return "Nombre d'activités";
    }
  };

  const formatDifference = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+∞" : "—";
    const diff = ((current - previous) / previous) * 100;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)]">
        Chargement de la comparaison...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteurs d'années */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-tertiary)]">Comparer</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <span className="text-sm text-[var(--text-tertiary)]">vs</span>
          <select
            value={comparedYear}
            onChange={(e) => setComparedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Sélecteur de métrique */}
        <div className="flex flex-wrap gap-2 ml-auto">
          {[
            { value: "distance", label: "Distance" },
            { value: "duration", label: "Durée" },
            { value: "trimp", label: "TRIMP" },
            { value: "count", label: "Activités" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setMetric(option.value as typeof metric)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                metric === option.value
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats annuelles comparées */}
      {yearStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Activités</div>
            <div className="text-2xl font-display font-bold text-[var(--text-primary)]">
              {yearStats.current.totalActivities}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[var(--text-tertiary)]">
                vs {yearStats.previous.totalActivities}
              </span>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded ${
                  yearStats.current.totalActivities >= yearStats.previous.totalActivities
                    ? "bg-[var(--status-success)]/20 text-[var(--status-success)]"
                    : "bg-[var(--status-error)]/20 text-[var(--status-error)]"
                }`}
              >
                {formatDifference(
                  yearStats.current.totalActivities,
                  yearStats.previous.totalActivities
                )}
              </span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Distance</div>
            <div className="text-2xl font-display font-bold text-[var(--accent-primary)]">
              {Math.round(yearStats.current.totalDistance / 1000)} km
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[var(--text-tertiary)]">
                vs {Math.round(yearStats.previous.totalDistance / 1000)} km
              </span>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded ${
                  yearStats.current.totalDistance >= yearStats.previous.totalDistance
                    ? "bg-[var(--status-success)]/20 text-[var(--status-success)]"
                    : "bg-[var(--status-error)]/20 text-[var(--status-error)]"
                }`}
              >
                {formatDifference(
                  yearStats.current.totalDistance,
                  yearStats.previous.totalDistance
                )}
              </span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Durée</div>
            <div className="text-2xl font-display font-bold text-[var(--accent-secondary)]">
              {Math.round(yearStats.current.totalDuration / 3600)} h
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[var(--text-tertiary)]">
                vs {Math.round(yearStats.previous.totalDuration / 3600)} h
              </span>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded ${
                  yearStats.current.totalDuration >= yearStats.previous.totalDuration
                    ? "bg-[var(--status-success)]/20 text-[var(--status-success)]"
                    : "bg-[var(--status-error)]/20 text-[var(--status-error)]"
                }`}
              >
                {formatDifference(
                  yearStats.current.totalDuration,
                  yearStats.previous.totalDuration
                )}
              </span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">TRIMP</div>
            <div className="text-2xl font-display font-bold text-[var(--status-error)]">
              {Math.round(yearStats.current.totalTrimp)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[var(--text-tertiary)]">
                vs {Math.round(yearStats.previous.totalTrimp)}
              </span>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded ${
                  yearStats.current.totalTrimp >= yearStats.previous.totalTrimp
                    ? "bg-[var(--status-success)]/20 text-[var(--status-success)]"
                    : "bg-[var(--status-error)]/20 text-[var(--status-error)]"
                }`}
              >
                {formatDifference(
                  yearStats.current.totalTrimp,
                  yearStats.previous.totalTrimp
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Graphique comparatif */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentYearData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis
              dataKey="month"
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            />
            <YAxis
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ color: "var(--text-primary)" }}
              labelStyle={{ color: "var(--text-secondary)", fontWeight: 600 }}
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
              formatter={(value: number, name: string) => [
                `${value} ${
                  metric === "distance"
                    ? "km"
                    : metric === "duration"
                    ? "h"
                    : metric === "trimp"
                    ? "pts"
                    : ""
                }`,
                name === "currentYear" ? `${selectedYear}` : `${comparedYear}`,
              ]}
            />
            {selectedYear !== comparedYear && (
              <Legend
                formatter={(value) =>
                  value === "currentYear" ? `${selectedYear}` : `${comparedYear}`
                }
                wrapperStyle={{ color: 'var(--text-secondary)' }}
              />
            )}
            {selectedYear !== comparedYear && (
              <Bar
                dataKey="previousYear"
                fill="var(--text-disabled)"
                name="previousYear"
                radius={[4, 4, 0, 0]}
              />
            )}
            <Bar
              dataKey="currentYear"
              fill="var(--accent-primary)"
              name="currentYear"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-sm text-[var(--text-tertiary)]">
        {selectedYear !== comparedYear ? (
          <>
            {getMetricLabel()} par mois — <span className="text-[var(--accent-primary)] font-medium">{selectedYear}</span> vs <span className="text-[var(--text-disabled)] font-medium">{comparedYear}</span>
          </>
        ) : (
          <>
            {getMetricLabel()} par mois — <span className="text-[var(--accent-primary)] font-medium">{selectedYear}</span>
            <span className="block mt-1 text-xs opacity-75">Sélectionnez une autre année pour comparer</span>
          </>
        )}
      </div>
    </div>
  );
}
