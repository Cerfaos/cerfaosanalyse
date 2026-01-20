/**
 * Types pour le Dashboard
 */

export interface DashboardStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalTrimp: number;
  averageDistance: number;
  averageDuration: number;
  averageHeartRate: number | null;
  byType: { type: string; count: number; distance: number; duration: number }[];
}

export interface DashboardActivity {
  id: number;
  date: string;
  type: string;
  duration: number;
  distance: number;
  avgHeartRate: number | null;
  avgSpeed: number | null;
  elevationGain: number | null;
  calories: number | null;
  trimp: number | null;
}

export interface ActivityTypeStats {
  type: string;
  count: number;
  totalDistance: number;
  totalDuration: number;
  totalElevation: number;
  totalTrimp: number;
  averageDistance: number;
  averageDuration: number;
  averageSpeed: number | null;
  averageHeartRate: number | null;
  icon: string;
  color: string;
  colorDark: string;
}

export interface ActivityTimelinePoint {
  date: string;
  label: string;
  distanceKm: number;
  duration: number;
  trimp: number;
  count: number;
}

export interface WeightEntry {
  id: number;
  date: string;
  weight: number;
  notes: string | null;
  createdAt: string;
}

export interface WeightStats {
  count: number;
  min: number | null;
  max: number | null;
  average: number | null;
  current: number | null;
  trend30Days: number | null;
  trend90Days: number | null;
  firstDate: string | null;
  lastDate: string | null;
}

export type PeriodType = "day" | "7" | "30" | "90" | "365" | "custom";

export interface PeriodOption {
  value: PeriodType;
  label: string;
}

export interface PeriodDetail {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
}

export interface ActivityTypeConfig {
  icon: string;
  color: string;
  colorDark: string;
  bgColor: string;
  bgDark: string;
}
