/**
 * Configuration des types d'activités
 */

export interface ActivityTypeConfig {
  icon: string;
  gradient: string;
  badge: string;
}

export const ACTIVITY_TYPE_CONFIGS: Record<string, ActivityTypeConfig> = {
  Course: {
    icon: "🏃",
    gradient: "from-blue-500 to-indigo-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Cyclisme: {
    icon: "🚴",
    gradient: "from-orange-500 to-amber-600",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  Marche: {
    icon: "🚶",
    gradient: "from-lime-500 to-green-600",
    badge: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  },
  Musculation: {
    icon: "🏋️",
    gradient: "from-indigo-500 to-purple-600",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  Natation: {
    icon: "🏊",
    gradient: "from-cyan-500 to-teal-600",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  Rameur: {
    icon: "🚣",
    gradient: "from-sky-500 to-blue-600",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  Randonnée: {
    icon: "🥾",
    gradient: "from-green-500 to-emerald-600",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  Yoga: {
    icon: "🧘",
    gradient: "from-purple-500 to-violet-600",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  Mobilité: {
    icon: "🤸",
    gradient: "from-indigo-500 to-indigo-700",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
};

const DEFAULT_CONFIG: ActivityTypeConfig = {
  icon: "🏆",
  gradient: "from-gray-500 to-slate-600",
  badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

export const getActivityTypeConfig = (type: string): ActivityTypeConfig => {
  return ACTIVITY_TYPE_CONFIGS[type] || DEFAULT_CONFIG;
};

export const ACTIVITY_TYPES = [
  "Course",
  "Cyclisme",
  "Marche",
  "Musculation",
  "Natation",
  "Rameur",
  "Randonnée",
  "Yoga",
  "Mobilité",
] as const;

export const STATIC_ACTIVITY_TYPES = ["Mobilité", "Yoga", "Musculation"] as const;

export const isStaticActivity = (type: string): boolean => {
  return (STATIC_ACTIVITY_TYPES as readonly string[]).includes(type);
};
