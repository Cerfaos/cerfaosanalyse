/**
 * Fonctions de formatage pour les activités
 */

export const formatDuration = (seconds: number): string => {
  const totalSeconds = Math.round(seconds);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let secs = totalSeconds % 60;

  if (secs === 60) {
    secs = 0;
    minutes += 1;
  }

  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}min ${secs
      .toString()
      .padStart(2, "0")}s`;
  }
  return `${minutes}min ${secs.toString().padStart(2, "0")}s`;
};

export const formatDistance = (meters: number): string => {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
};

export const formatElevation = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  return `${parseFloat(value.toFixed(3))} m`;
};

export const formatSpeed = (kmh: number | null): string => {
  if (!kmh) return "-";
  return `${kmh.toFixed(1)} km/h`;
};

export const formatPace = (kmh: number | null): string => {
  if (!kmh || kmh === 0) return "-";
  const minPerKm = 60 / kmh;
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
};

export const formatHeartRate = (bpm: number | null): string => {
  if (!bpm) return "-";
  return `${bpm} bpm`;
};

export const formatCalories = (kcal: number | null): string => {
  if (!kcal) return "-";
  return `${kcal} kcal`;
};

export const formatPower = (watts: number | null): string => {
  if (!watts) return "-";
  return `${watts} W`;
};

export const formatCadence = (rpm: number | null): string => {
  if (!rpm) return "-";
  return `${rpm} rpm`;
};

export const formatTemperature = (temp: number | null): string => {
  if (temp === null || temp === undefined) return "-";
  return `${Math.round(temp)}°C`;
};
