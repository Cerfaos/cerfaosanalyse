/**
 * Types pour les statistiques cardio/cyclisme
 */

export type ZoneComputationSource = 'samples' | 'average' | 'none';

export interface HeartRateZone {
  zone: number;
  name: string;
  description: string;
  min: number;
  max: number;
  color: string;
}

export interface ZoneDistribution extends HeartRateZone {
  seconds: number;
  hours: number;
  percentage: number;
}

export interface ActivityZoneDuration {
  zone: number;
  label: string;
  seconds: number;
  percentage: number;
  color: string;
}

export interface CyclingActivity {
  id: number;
  date: string;
  type: string;
  subSport: string | null;
  isIndoor: boolean;
  duration: number;
  distance: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  trimp: number | null;
  zoneDurations: ActivityZoneDuration[];
  dominantZone: number;
  dominantZoneLabel: string;
  dataSource: ZoneComputationSource;
}

export interface TypeSummary {
  type: string;
  count: number;
  duration: number;
  distance: number;
  trimp: number;
  indoor: number;
  outdoor: number;
}

export interface PolarizationSummary {
  totals: {
    low: number;
    moderate: number;
    high: number;
  };
  percentages: {
    low: number;
    moderate: number;
    high: number;
  };
  target: {
    low: number;
    moderate: number;
    high: number;
  };
  score: number;
  focus: string;
  message: string;
}

export interface CyclingStatsPayload {
  filters: {
    period: string;
    startDate: string | null;
    endDate: string | null;
    types: string | null;
    indoor: string | null;
  };
  summary: {
    sessions: number;
    totalDistance: number;
    totalDuration: number;
    totalTrimp: number;
    avgHeartRate: number | null;
    avgSpeed: number | null;
    indoorCount: number;
    outdoorCount: number;
  };
  availableTypes: string[];
  byType: TypeSummary[];
  heartRateZones: HeartRateZone[];
  zoneDistribution: ZoneDistribution[];
  polarization: PolarizationSummary;
  sampling: Record<ZoneComputationSource, number>;
  activities: CyclingActivity[];
}
