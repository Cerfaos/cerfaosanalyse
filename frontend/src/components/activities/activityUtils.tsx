import {
  FaBicycle,
  FaRunning,
  FaWalking,
  FaSwimmer,
  FaHiking,
  FaDumbbell,
} from "react-icons/fa";
import { GiPaddles, GiMeditation, GiBodyBalance } from "react-icons/gi";

export const formatDuration = (seconds: number) => {
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

export const formatDistance = (meters: number) => {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
};

export const getActivityIcon = (type: string) => {
  const iconClass = "w-6 h-6";
  switch (type) {
    case "Cyclisme":
      return <FaBicycle className={iconClass} />;
    case "Course":
      return <FaRunning className={iconClass} />;
    case "Marche":
      return <FaWalking className={iconClass} />;
    case "Rameur":
      return <GiPaddles className={iconClass} />;
    case "Randonnée":
      return <FaHiking className={iconClass} />;
    case "Natation":
      return <FaSwimmer className={iconClass} />;
    case "Yoga":
      return <GiMeditation className={iconClass} />;
    case "Mobilité":
      return <GiBodyBalance className={iconClass} />;
    case "Musculation":
      return <FaDumbbell className={iconClass} />;
    default:
      return <FaBicycle className={iconClass} />;
  }
};

export interface ActivityColors {
  bg: string;
  text: string;
  badge: string;
}

export const getActivityColor = (type: string): ActivityColors => {
  switch (type) {
    case "Cyclisme":
      return {
        bg: "bg-gradient-to-br from-orange-500 to-amber-600",
        text: "text-white",
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      };
    case "Course":
      return {
        bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
        text: "text-white",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
    case "Marche":
      return {
        bg: "bg-gradient-to-br from-green-500 to-emerald-600",
        text: "text-white",
        badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    case "Rameur":
      return {
        bg: "bg-gradient-to-br from-cyan-500 to-teal-600",
        text: "text-white",
        badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      };
    case "Randonnée":
      return {
        bg: "bg-gradient-to-br from-yellow-500 to-lime-600",
        text: "text-white",
        badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      };
    case "Natation":
      return {
        bg: "bg-gradient-to-br from-sky-500 to-blue-600",
        text: "text-white",
        badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
      };
    case "Mobilité":
      return {
        bg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
        text: "text-white",
        badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
      };
    case "Yoga":
      return {
        bg: "bg-gradient-to-br from-violet-500 to-purple-600",
        text: "text-white",
        badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
      };
    case "Musculation":
      return {
        bg: "bg-gradient-to-br from-red-500 to-rose-600",
        text: "text-white",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      };
    default:
      return {
        bg: "bg-gradient-to-br from-gray-500 to-slate-600",
        text: "text-white",
        badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
      };
  }
};

export const getTrimpColor = (trimp: number | null) => {
  if (!trimp) return "text-gray-400";
  if (trimp < 50) return "text-emerald-400";
  if (trimp < 100) return "text-cyan-400";
  if (trimp < 200) return "text-amber-400";
  return "text-red-400";
};

export const getTrimpLevel = (trimp: number | null) => {
  if (!trimp) return null;
  if (trimp < 50) return "Léger";
  if (trimp < 100) return "Modéré";
  if (trimp < 200) return "Intense";
  return "Très intense";
};

export interface Activity {
  id: number;
  date: string;
  type: string;
  duration: number;
  distance: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  elevationGain: number | null;
  calories: number | null;
  avgCadence: number | null;
  avgPower: number | null;
  normalizedPower: number | null;
  trimp: number | null;
  rpe: number | null;
  feelingNotes: string | null;
  fileName: string | null;
  weather: string | null;
  createdAt: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  clouds: number;
  visibility: number;
}
