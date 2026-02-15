/**
 * Hook pour le chargement des données du Dashboard
 */

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { getActivityTypeConfigSafe, monthNames } from "../utils/dashboardConfig";
import type {
  DashboardStats,
  DashboardActivity,
  ActivityTypeStats,
  ActivityTimelinePoint,
  WeightEntry,
  WeightStats,
  PeriodType,
} from "../types/dashboard";

interface UseDashboardParams {
  period: PeriodType;
  selectedMonth: number;
  selectedYear: number;
  selectedTypes: string[];
}

interface UseDashboardResult {
  stats: DashboardStats | null;
  typeStats: ActivityTypeStats[];
  typeTotals: Record<string, number>;
  activityTimeline: ActivityTimelinePoint[];
  weightStats: WeightStats | null;
  weightEntries: WeightEntry[];
  recentActivities: DashboardActivity[];
  availableTypes: string[];
  loading: boolean;
  periodLabel: string;
}

// Fonctions utilitaires
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getActivityDay = (dateString: string): string => {
  if (!dateString) return "";
  const [day] = dateString.split("T");
  return day;
};

export const useDashboard = ({
  period,
  selectedMonth,
  selectedYear,
  selectedTypes,
}: UseDashboardParams): UseDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [typeStats, setTypeStats] = useState<ActivityTypeStats[]>([]);
  const [typeTotals, setTypeTotals] = useState<Record<string, number>>({});
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimelinePoint[]>([]);
  const [weightStats, setWeightStats] = useState<WeightStats | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [recentActivities, setRecentActivities] = useState<DashboardActivity[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const getPeriodRange = useCallback(() => {
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (period === "custom") {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      startDate = formatDateLocal(firstDay);
      endDate = formatDateLocal(lastDay);
    } else {
      const now = new Date();
      if (period === "day") {
        const today = formatDateLocal(now);
        startDate = today;
        endDate = today;
      } else {
        const periodDays = parseInt(period);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - (periodDays - 1));
        fromDate.setHours(0, 0, 0, 0);
        startDate = formatDateLocal(fromDate);
        endDate = formatDateLocal(now);
      }
    }

    return { startDate, endDate };
  }, [period, selectedMonth, selectedYear]);

  const getPeriodLabel = useCallback(() => {
    switch (period) {
      case "day":
        return "Aujourd'hui";
      case "7":
        return "7 derniers jours";
      case "30":
        return "30 derniers jours";
      case "90":
        return "90 derniers jours";
      case "365":
        return "Cette année";
      case "custom":
        return `${monthNames[selectedMonth]} ${selectedYear}`;
      default:
        return "";
    }
  }, [period, selectedMonth, selectedYear]);

  const loadRecentActivities = useCallback(async () => {
    const activitiesResponse = await api.get("/api/activities", {
      params: { limit: 5, page: 1 },
    });
    setRecentActivities(activitiesResponse.data.data.data);
  }, []);

  const loadWeightData = useCallback(async () => {
    try {
      const [historiesRes, statsRes] = await Promise.all([
        api.get("/api/weight-histories"),
        api.get("/api/weight-histories/stats"),
      ]);

      setWeightEntries(historiesRes.data.data.data || []);
      setWeightStats(statsRes.data.data);
    } catch {
      // Silencieux - données optionnelles
    }
  }, []);

  const loadTypeStats = useCallback(async () => {
    try {
      const periodBounds = getPeriodRange();
      const params: Record<string, string | number> = {
        limit: 1500,
        page: 1,
      };
      if (periodBounds.startDate) params.startDate = periodBounds.startDate;
      if (periodBounds.endDate) params.endDate = periodBounds.endDate;

      const response = await api.get("/api/activities", { params });
      const allActivities: DashboardActivity[] = response.data.data.data;

      // Extraire tous les types disponibles
      const types = [...new Set(allActivities.map((a) => a.type))];
      setAvailableTypes(types);

      // Filtrer par période
      let activitiesInPeriod: DashboardActivity[] = allActivities;
      if (periodBounds.startDate && periodBounds.endDate) {
        const start = periodBounds.startDate;
        const end = periodBounds.endDate;
        activitiesInPeriod = allActivities.filter((a) => {
          const activityDay = getActivityDay(a.date);
          return activityDay >= start && activityDay <= end;
        });
      }

      // Filtrer par types sélectionnés
      if (selectedTypes.length > 0) {
        activitiesInPeriod = activitiesInPeriod.filter((a) =>
          selectedTypes.includes(a.type)
        );
      }

      const totals: Record<string, number> = {};
      activitiesInPeriod.forEach((activity) => {
        totals[activity.type] = (totals[activity.type] || 0) + 1;
      });
      setTypeTotals(totals);

      // Construire la timeline quotidienne
      const timelineMap = new Map<
        string,
        { distance: number; duration: number; trimp: number; count: number }
      >();
      activitiesInPeriod.forEach((activity) => {
        const dayKey = getActivityDay(activity.date);
        if (!timelineMap.has(dayKey)) {
          timelineMap.set(dayKey, {
            distance: 0,
            duration: 0,
            trimp: 0,
            count: 0,
          });
        }
        const day = timelineMap.get(dayKey)!;
        day.distance += activity.distance;
        day.duration += activity.duration;
        day.trimp += activity.trimp || 0;
        day.count += 1;
      });

      const timelineArray: ActivityTimelinePoint[] = Array.from(
        timelineMap.entries()
      )
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([date, value]) => ({
          date,
          label: new Date(date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          }),
          distanceKm: Number((value.distance / 1000).toFixed(2)),
          duration: value.duration,
          trimp: Math.round(value.trimp),
          count: value.count,
        }));

      setActivityTimeline(timelineArray);

      // Calculer les statistiques globales
      const totalActivities = activitiesInPeriod.length;
      const totalDistance = activitiesInPeriod.reduce(
        (sum, a) => sum + a.distance,
        0
      );
      const totalDuration = activitiesInPeriod.reduce(
        (sum, a) => sum + a.duration,
        0
      );
      const totalTrimp = Math.round(
        activitiesInPeriod.reduce((sum, a) => sum + (a.trimp || 0), 0)
      );

      const activitiesWithHR = activitiesInPeriod.filter((a) => a.avgHeartRate);
      const averageHeartRate =
        activitiesWithHR.length > 0
          ? Math.round(
              activitiesWithHR.reduce(
                (sum, a) => sum + (a.avgHeartRate || 0),
                0
              ) / activitiesWithHR.length
            )
          : null;

      setStats({
        totalActivities,
        totalDistance,
        totalDuration,
        totalTrimp,
        averageDistance:
          totalActivities > 0 ? totalDistance / totalActivities : 0,
        averageDuration:
          totalActivities > 0 ? totalDuration / totalActivities : 0,
        averageHeartRate,
        byType: [],
      });

      // Grouper par type
      const typeMap = new Map<string, DashboardActivity[]>();
      activitiesInPeriod.forEach((activity) => {
        if (!typeMap.has(activity.type)) {
          typeMap.set(activity.type, []);
        }
        typeMap.get(activity.type)!.push(activity);
      });

      // Calculer les stats par type
      const statsArray: ActivityTypeStats[] = [];
      typeMap.forEach((activities, type) => {
        const count = activities.length;
        const totalDistance = activities.reduce(
          (sum, a) => sum + a.distance,
          0
        );
        const totalDuration = activities.reduce(
          (sum, a) => sum + a.duration,
          0
        );
        const totalElevation = activities.reduce(
          (sum, a) => sum + (a.elevationGain || 0),
          0
        );
        const totalTrimp = activities.reduce(
          (sum, a) => sum + (a.trimp || 0),
          0
        );

        const activitiesWithSpeed = activities.filter((a) => a.avgSpeed);
        const averageSpeed =
          activitiesWithSpeed.length > 0
            ? activitiesWithSpeed.reduce(
                (sum, a) => sum + (a.avgSpeed || 0),
                0
              ) / activitiesWithSpeed.length
            : null;

        const activitiesWithHR = activities.filter((a) => a.avgHeartRate);
        const averageHeartRate =
          activitiesWithHR.length > 0
            ? Math.round(
                activitiesWithHR.reduce(
                  (sum, a) => sum + (a.avgHeartRate || 0),
                  0
                ) / activitiesWithHR.length
              )
            : null;

        const config = getActivityTypeConfigSafe(type);

        statsArray.push({
          type,
          count,
          totalDistance,
          totalDuration,
          totalElevation,
          totalTrimp,
          averageDistance: totalDistance / count,
          averageDuration: totalDuration / count,
          averageSpeed,
          averageHeartRate,
          icon: config.icon,
          color: config.color,
          colorDark: config.colorDark,
        });
      });

      // Trier par nombre d'activités
      statsArray.sort((a, b) => b.count - a.count);
      setTypeStats(statsArray);
    } catch {
      // Silencieux - données optionnelles
    }
  }, [getPeriodRange, selectedTypes]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      await Promise.all([
        loadTypeStats(),
        loadRecentActivities(),
        loadWeightData(),
      ]);
    } catch {
      // Erreur gérée silencieusement
    } finally {
      setLoading(false);
    }
  }, [loadTypeStats, loadRecentActivities, loadWeightData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    typeStats,
    typeTotals,
    activityTimeline,
    weightStats,
    weightEntries,
    recentActivities,
    availableTypes,
    loading,
    periodLabel: getPeriodLabel(),
  };
};

export default useDashboard;
