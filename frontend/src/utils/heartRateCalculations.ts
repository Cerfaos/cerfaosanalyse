/**
 * Calculs des zones de fréquence cardiaque (méthode Karvonen)
 */

export interface HRZone {
  zone: number;
  name: string;
  min: number;
  max: number;
  color: string;
}

export interface HRZonesResult {
  zones: HRZone[];
  currentZone: HRZone;
}

export interface UserHRData {
  fcMax: number | null;
  fcRepos: number | null;
}

export const calculateHRZones = (
  user: UserHRData | null,
  avgHeartRate: number | null
): HRZonesResult | null => {
  if (!user?.fcMax || !user?.fcRepos || !avgHeartRate) {
    return null;
  }

  const fcReserve = user.fcMax - user.fcRepos;

  const zones: HRZone[] = [
    {
      zone: 1,
      name: "Z1 - Récup",
      min: Math.round(user.fcRepos + 0.5 * fcReserve),
      max: Math.round(user.fcRepos + 0.6 * fcReserve),
      color: "#3B82F6",
    },
    {
      zone: 2,
      name: "Z2 - Endurance",
      min: Math.round(user.fcRepos + 0.6 * fcReserve),
      max: Math.round(user.fcRepos + 0.7 * fcReserve),
      color: "#10B981",
    },
    {
      zone: 3,
      name: "Z3 - Tempo",
      min: Math.round(user.fcRepos + 0.7 * fcReserve),
      max: Math.round(user.fcRepos + 0.8 * fcReserve),
      color: "#F59E0B",
    },
    {
      zone: 4,
      name: "Z4 - Seuil",
      min: Math.round(user.fcRepos + 0.8 * fcReserve),
      max: Math.round(user.fcRepos + 0.9 * fcReserve),
      color: "#F97316",
    },
    {
      zone: 5,
      name: "Z5 - VO2max",
      min: Math.round(user.fcRepos + 0.9 * fcReserve),
      max: user.fcMax,
      color: "#EF4444",
    },
  ];

  // Déterminer la zone de la FC moyenne
  let currentZone = zones[0];
  for (const zone of zones) {
    if (avgHeartRate >= zone.min && avgHeartRate <= zone.max) {
      currentZone = zone;
      break;
    }
  }

  return { zones, currentZone };
};

export const getZoneForHeartRate = (zones: HRZone[], hr: number): HRZone | null => {
  for (const zone of zones) {
    if (hr >= zone.min && hr <= zone.max) {
      return zone;
    }
  }
  return null;
};
