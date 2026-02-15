/**
 * Configuration et constantes pour le Dashboard
 */

import type { PeriodOption, PeriodDetail, ActivityTypeConfig } from "../types/dashboard";

export const periodOptions: PeriodOption[] = [
  { value: "day", label: "Aujourd'hui" },
  { value: "7", label: "7 jours" },
  { value: "30", label: "30 jours" },
  { value: "90", label: "90 jours" },
  { value: "365", label: "Année" },
  { value: "custom", label: "Personnalisé" },
];

export const periodDetails: Record<string, PeriodDetail> = {
  day: {
    title: "Aujourd'hui",
    subtitle: "Focus quotidien",
    icon: "☀️",
    accent: "from-sky-500/25 via-sky-500/10",
  },
  "7": {
    title: "7 jours",
    subtitle: "Vue hebdo",
    icon: "📅",
    accent: "from-blue-500/25 via-blue-500/10",
  },
  "30": {
    title: "30 jours",
    subtitle: "Bilan mensuel",
    icon: "🗓️",
    accent: "from-emerald-500/25 via-emerald-500/10",
  },
  "90": {
    title: "90 jours",
    subtitle: "Tendance trimestrielle",
    icon: "📈",
    accent: "from-orange-500/25 via-orange-500/10",
  },
  "365": {
    title: "Année",
    subtitle: "Macro objectif",
    icon: "🏆",
    accent: "from-purple-500/25 via-purple-500/10",
  },
  custom: {
    title: "Personnalisé",
    subtitle: "Choisissez un mois précis",
    icon: "✨",
    accent: "from-pink-500/25 via-pink-500/10",
  },
};

export const activityTypeConfig: Record<string, ActivityTypeConfig> = {
  Course: {
    icon: "🏃",
    color: "text-orange-600",
    colorDark: "dark:text-orange-400",
    bgColor: "bg-orange-50",
    bgDark: "dark:bg-orange-950/30",
  },
  Cyclisme: {
    icon: "🚴",
    color: "text-blue-600",
    colorDark: "dark:text-blue-400",
    bgColor: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
  },
  Marche: {
    icon: "🚶",
    color: "text-green-600",
    colorDark: "dark:text-green-400",
    bgColor: "bg-green-50",
    bgDark: "dark:bg-green-950/30",
  },
  Musculation: {
    icon: "🏋️",
    color: "text-indigo-600",
    colorDark: "dark:text-indigo-400",
    bgColor: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/30",
  },
  Natation: {
    icon: "🏊",
    color: "text-teal-600",
    colorDark: "dark:text-teal-400",
    bgColor: "bg-teal-50",
    bgDark: "dark:bg-teal-950/30",
  },
  Rameur: {
    icon: "🚣",
    color: "text-cyan-600",
    colorDark: "dark:text-cyan-400",
    bgColor: "bg-cyan-50",
    bgDark: "dark:bg-cyan-950/30",
  },
  Randonnée: {
    icon: "🥾",
    color: "text-amber-600",
    colorDark: "dark:text-amber-400",
    bgColor: "bg-amber-50",
    bgDark: "dark:bg-amber-950/30",
  },
  Yoga: {
    icon: "🧘",
    color: "text-purple-600",
    colorDark: "dark:text-purple-400",
    bgColor: "bg-purple-50",
    bgDark: "dark:bg-purple-950/30",
  },
  Mobilité: {
    icon: "🤸",
    color: "text-pink-600",
    colorDark: "dark:text-pink-400",
    bgColor: "bg-pink-50",
    bgDark: "dark:bg-pink-950/30",
  },
};

export const defaultActivityTypeConfig: ActivityTypeConfig = {
  icon: "📈",
  color: "text-gray-600",
  colorDark: "dark:text-gray-400",
  bgColor: "bg-gray-50",
  bgDark: "dark:bg-gray-950/30",
};

export const getActivityTypeConfigSafe = (type: string): ActivityTypeConfig => {
  return activityTypeConfig[type] || defaultActivityTypeConfig;
};

export const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Fonctions utilitaires de formatage
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

export const formatDistance = (meters: number): string => {
  return `${(meters / 1000).toFixed(2)} km`;
};
