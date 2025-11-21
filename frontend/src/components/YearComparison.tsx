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

  // On prépare 2026, donc on compare 2026 (current) vs 2025 (previous)
  const currentYear = new Date().getFullYear() + 1;
  const previousYear = currentYear - 1;

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      setLoading(true);

      const [currentRes, previousRes] = await Promise.all([
        api.get(`/api/activities?year=${currentYear}&limit=1000`),
        api.get(`/api/activities?year=${previousYear}&limit=1000`),
      ]);

      const currentActivities = currentRes.data.data.activities || [];
      const previousActivities = previousRes.data.data.activities || [];

      // Grouper par mois
      const monthNames = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
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
      console.error("Erreur lors du chargement de la comparaison:", error);
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
      // Recalculer les données mensuelles avec la nouvelle métrique
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
    if (previous === 0) return current > 0 ? "+∞" : "0";
    const diff = ((current - previous) / previous) * 100;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-text-muted">
        Chargement de la comparaison...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de métrique */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "distance", label: "Distance" },
          { value: "duration", label: "Durée" },
          { value: "trimp", label: "TRIMP" },
          { value: "count", label: "Activités" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setMetric(option.value as typeof metric)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              metric === option.value
                ? "bg-brand text-white"
                : "bg-bg-gray-100 dark:bg-dark-border text-text-secondary hover:bg-bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats annuelles comparées */}
      {yearStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 text-center">
            <div className="text-sm text-text-muted mb-1">Activités</div>
            <div className="text-xl font-bold">
              {yearStats.current.totalActivities}
              <span className="text-sm text-text-muted ml-1">
                vs {yearStats.previous.totalActivities}
              </span>
            </div>
            <div
              className={`text-sm font-medium ${
                yearStats.current.totalActivities >=
                yearStats.previous.totalActivities
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {formatDifference(
                yearStats.current.totalActivities,
                yearStats.previous.totalActivities
              )}
            </div>
          </div>

          <div className="glass-panel p-4 text-center">
            <div className="text-sm text-text-muted mb-1">Distance totale</div>
            <div className="text-xl font-bold">
              {Math.round(yearStats.current.totalDistance / 1000)} km
            </div>
            <div
              className={`text-sm font-medium ${
                yearStats.current.totalDistance >=
                yearStats.previous.totalDistance
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {formatDifference(
                yearStats.current.totalDistance,
                yearStats.previous.totalDistance
              )}
            </div>
          </div>

          <div className="glass-panel p-4 text-center">
            <div className="text-sm text-text-muted mb-1">Durée totale</div>
            <div className="text-xl font-bold">
              {Math.round(yearStats.current.totalDuration / 3600)} h
            </div>
            <div
              className={`text-sm font-medium ${
                yearStats.current.totalDuration >=
                yearStats.previous.totalDuration
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {formatDifference(
                yearStats.current.totalDuration,
                yearStats.previous.totalDuration
              )}
            </div>
          </div>

          <div className="glass-panel p-4 text-center">
            <div className="text-sm text-text-muted mb-1">TRIMP total</div>
            <div className="text-xl font-bold">
              {Math.round(yearStats.current.totalTrimp)}
            </div>
            <div
              className={`text-sm font-medium ${
                yearStats.current.totalTrimp >= yearStats.previous.totalTrimp
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {formatDifference(
                yearStats.current.totalTrimp,
                yearStats.previous.totalTrimp
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graphique comparatif */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentYearData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--panel-bg)",
                border: "1px solid var(--panel-border)",
                borderRadius: "8px",
              }}
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
                name === "currentYear" ? currentYear : previousYear,
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "currentYear" ? `${currentYear}` : `${previousYear}`
              }
            />
            <Bar
              dataKey="previousYear"
              fill="#9CA3AF"
              name="previousYear"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill="#059669"
              name="currentYear"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-sm text-text-muted">
        {getMetricLabel()} par mois
      </div>
    </div>
  );
}
