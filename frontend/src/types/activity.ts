/**
 * Types partagés pour les activités
 */

export interface Activity {
  id: number;
  date: string;
  type: string;
  duration: number;
  movingTime: number | null;
  distance: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  elevationGain: number | null;
  elevationLoss: number | null;
  calories: number | null;
  avgCadence: number | null;
  avgPower: number | null;
  normalizedPower: number | null;
  avgTemperature: number | null;
  maxTemperature: number | null;
  subSport: string | null;
  trimp: number | null;
  rpe: number | null;
  feelingNotes: string | null;
  youtubeUrl: string | null;
  fileName: string | null;
  gpsData: string | null;
  weather: string | null;
  createdAt: string;
}

export interface GpsPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

export interface ActivityEditForm {
  type: string;
  date: string;
  time: string;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  distanceKm: string;
  avgHeartRate: string;
  maxHeartRate: string;
  avgSpeed: string;
  maxSpeed: string;
  avgPower: string;
  normalizedPower: string;
  avgCadence: string;
  elevationGain: string;
  calories: string;
  rpe: string;
  feelingNotes: string;
  weatherCondition: string;
  weatherTemperature: string;
  weatherWindSpeed: string;
  weatherWindDirection: string;
}

export const createEmptyEditForm = (): ActivityEditForm => ({
  type: "",
  date: "",
  time: "",
  durationHours: "",
  durationMinutes: "",
  durationSeconds: "",
  distanceKm: "",
  avgHeartRate: "",
  maxHeartRate: "",
  avgSpeed: "",
  maxSpeed: "",
  avgPower: "",
  normalizedPower: "",
  avgCadence: "",
  elevationGain: "",
  calories: "",
  rpe: "",
  feelingNotes: "",
  weatherCondition: "",
  weatherTemperature: "",
  weatherWindSpeed: "",
  weatherWindDirection: "",
});

export const activityToEditForm = (activity: Activity): ActivityEditForm => {
  const dateObj = new Date(activity.date);

  return {
    type: activity.type,
    date: dateObj.toISOString().split("T")[0],
    time: dateObj.toTimeString().slice(0, 5),
    durationHours: Math.floor(activity.duration / 3600).toString(),
    durationMinutes: Math.floor((activity.duration % 3600) / 60).toString(),
    durationSeconds: (activity.duration % 60).toString(),
    distanceKm: activity.distance ? (activity.distance / 1000).toFixed(2) : "",
    avgHeartRate: activity.avgHeartRate?.toString() || "",
    maxHeartRate: activity.maxHeartRate?.toString() || "",
    avgSpeed: activity.avgSpeed?.toString() || "",
    maxSpeed: activity.maxSpeed?.toString() || "",
    avgPower: activity.avgPower?.toString() || "",
    normalizedPower: activity.normalizedPower?.toString() || "",
    avgCadence: activity.avgCadence?.toString() || "",
    elevationGain: activity.elevationGain?.toString() || "",
    calories: activity.calories?.toString() || "",
    rpe: activity.rpe?.toString() || "",
    feelingNotes: activity.feelingNotes || "",
    weatherCondition: "",
    weatherTemperature: "",
    weatherWindSpeed: "",
    weatherWindDirection: "",
  };
};
