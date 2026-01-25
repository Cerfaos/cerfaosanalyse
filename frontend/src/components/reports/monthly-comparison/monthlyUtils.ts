/**
 * Utilitaires pour la comparaison mensuelle
 */

import type { MonthlyBreakdown } from '../../../types/reports';

export interface MonthlyStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalElevation: number;
  totalTrimp: number;
  activeMonths: number;
  maxActivitiesMonth: MonthlyBreakdown;
  maxDistanceMonth: MonthlyBreakdown;
  maxTrimpMonth: MonthlyBreakdown;
  maxElevationMonth: MonthlyBreakdown;
  avgActivitiesPerMonth: number;
  avgDistancePerMonth: number;
  trend: number;
  trendPercent: number;
}

export interface ChartDataPoint extends MonthlyBreakdown {
  monthShort: string;
  distanceKm: number;
  durationHours: number;
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`;
  }
  return `${minutes}min`;
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(0)} km`;
  }
  return `${meters} m`;
};

export function calculateMonthlyStats(monthlyBreakdown: MonthlyBreakdown[]): MonthlyStats {
  const totalActivities = monthlyBreakdown.reduce((sum, m) => sum + m.activities, 0);
  const totalDistance = monthlyBreakdown.reduce((sum, m) => sum + m.distance, 0);
  const totalDuration = monthlyBreakdown.reduce((sum, m) => sum + m.duration, 0);
  const totalElevation = monthlyBreakdown.reduce((sum, m) => sum + m.elevation, 0);
  const totalTrimp = monthlyBreakdown.reduce((sum, m) => sum + m.trimp, 0);

  const maxActivitiesMonth = monthlyBreakdown.reduce((max, m) => m.activities > max.activities ? m : max, monthlyBreakdown[0]);
  const maxDistanceMonth = monthlyBreakdown.reduce((max, m) => m.distance > max.distance ? m : max, monthlyBreakdown[0]);
  const maxTrimpMonth = monthlyBreakdown.reduce((max, m) => m.trimp > max.trimp ? m : max, monthlyBreakdown[0]);
  const maxElevationMonth = monthlyBreakdown.reduce((max, m) => m.elevation > max.elevation ? m : max, monthlyBreakdown[0]);

  const activeMonths = monthlyBreakdown.filter(m => m.activities > 0).length;

  // Tendance S1 vs S2
  const firstHalf = monthlyBreakdown.slice(0, 6);
  const secondHalf = monthlyBreakdown.slice(6, 12);
  const firstHalfActivities = firstHalf.reduce((sum, m) => sum + m.activities, 0);
  const secondHalfActivities = secondHalf.reduce((sum, m) => sum + m.activities, 0);
  const trend = secondHalfActivities - firstHalfActivities;
  const trendPercent = firstHalfActivities > 0 ? Math.round((trend / firstHalfActivities) * 100) : 0;

  const avgActivitiesPerMonth = activeMonths > 0 ? Math.round((totalActivities / activeMonths) * 10) / 10 : 0;
  const avgDistancePerMonth = activeMonths > 0 ? Math.round(totalDistance / activeMonths / 1000) : 0;

  return {
    totalActivities,
    totalDistance,
    totalDuration,
    totalElevation,
    totalTrimp,
    activeMonths,
    maxActivitiesMonth,
    maxDistanceMonth,
    maxTrimpMonth,
    maxElevationMonth,
    avgActivitiesPerMonth,
    avgDistancePerMonth,
    trend,
    trendPercent,
  };
}

export function prepareChartData(monthlyBreakdown: MonthlyBreakdown[]): ChartDataPoint[] {
  return monthlyBreakdown.map(m => ({
    ...m,
    monthShort: m.monthName.substring(0, 3),
    distanceKm: Math.round(m.distance / 1000),
    durationHours: Math.round(m.duration / 3600 * 10) / 10,
  }));
}
