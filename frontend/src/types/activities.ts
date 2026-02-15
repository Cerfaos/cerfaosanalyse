/**
 * Types pour la page Activities
 */

export interface ActivityStats {
  count: number;
  totalDuration: number;
  totalDistance: number;
  totalTrimp: number;
  avgDuration: number;
  avgDistance: number;
  avgTrimp: number;
  avgHeartRate: number;
  byType: Record<string, number>;
}

export interface NewRecord {
  recordType: string;
  recordTypeName: string;
  activityType: string;
  value: number;
  unit: string;
  previousValue: number | null;
  improvement: number | null;
}

export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

export interface ManualFormData {
  date: Date;
  type: string;
  hours: string;
  minutes: string;
  seconds: string;
  distance: string;
  avgHeartRate: string;
  maxHeartRate: string;
  avgSpeed: string;
  maxSpeed: string;
  elevationGain: string;
  calories: string;
  avgCadence: string;
  avgPower: string;
  normalizedPower: string;
  rpe: string;
  feelingNotes: string;
  youtubeUrl: string;
}

export const INITIAL_MANUAL_FORM_DATA: ManualFormData = {
  date: new Date(),
  type: "Cyclisme",
  hours: "",
  minutes: "",
  seconds: "",
  distance: "",
  avgHeartRate: "",
  maxHeartRate: "",
  avgSpeed: "",
  maxSpeed: "",
  elevationGain: "",
  calories: "",
  avgCadence: "",
  avgPower: "",
  normalizedPower: "",
  rpe: "",
  feelingNotes: "",
  youtubeUrl: "",
};
