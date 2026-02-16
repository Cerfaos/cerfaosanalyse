/**
 * Fonctions de couleur dynamique selon les valeurs
 */

export const getTrimpColor = (trimp: number | null): string => {
  if (!trimp) return "text-gray-500";
  if (trimp < 50) return "text-green-600 dark:text-green-400";
  if (trimp < 100) return "text-yellow-600 dark:text-yellow-400";
  if (trimp < 200) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

export const getRpeColor = (rpe: number | null): string => {
  if (!rpe) return "text-gray-500";
  if (rpe <= 3) return "text-green-600 dark:text-green-400";
  if (rpe <= 6) return "text-yellow-600 dark:text-yellow-400";
  if (rpe <= 8) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

export const getHeartRateZoneColor = (zone: number): string => {
  const colors: Record<number, string> = {
    1: "#3B82F6", // blue
    2: "#10B981", // green
    3: "#F59E0B", // amber
    4: "#F97316", // orange
    5: "#EF4444", // red
  };
  return colors[zone] || "#6B7280";
};

export const getTrimpLevel = (trimp: number | null): string | null => {
  if (!trimp) return null;
  if (trimp < 50) return "Léger";
  if (trimp < 100) return "Modéré";
  if (trimp < 200) return "Intense";
  return "Très intense";
};
