/**
 * Configuration et constantes pour la page Activities
 */

import toast from "react-hot-toast";
import type { NewRecord } from "../../types/activities";

export const RECORD_TYPE_ICONS: Record<string, string> = {
  max_distance: "📏",
  max_avg_speed: "⚡",
  max_speed: "🚀",
  max_trimp: "💪",
  max_elevation: "⛰️",
  longest_duration: "⏱️",
  max_avg_heart_rate: "❤️",
  max_calories: "🔥",
};

export const ITEMS_PER_PAGE = 20;

export const ACTIVITY_TYPES = [
  { value: "Course", label: "🏃 Course" },
  { value: "Cyclisme", label: "🚴 Cyclisme" },
  { value: "Marche", label: "🚶 Marche" },
  { value: "Mobilité", label: "🤸 Mobilité" },
  { value: "Musculation", label: "🏋️ Musculation" },
  { value: "Natation", label: "🏊 Natation" },
  { value: "Rameur", label: "🚣 Rameur" },
  { value: "Randonnée", label: "🥾 Randonnée" },
  { value: "Yoga", label: "🧘 Yoga" },
];

export const STATIC_ACTIVITIES = ["Musculation", "Yoga", "Mobilité"];
export const CARDIO_ACTIVITIES = ["Cyclisme", "Course"];

export const INPUT_CLASSES = {
  default:
    "w-full px-4 py-3 rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/60 text-white placeholder-gray-500 focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 outline-none transition",
  compact:
    "w-full px-3 py-2 rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/60 text-white placeholder-gray-500 focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 outline-none text-center transition",
  label: "block text-sm font-medium text-gray-300 mb-2",
  primaryButton: "btn-primary w-full font-display",
};

export const formatRecordValue = (value: number, unit: string): string => {
  switch (unit) {
    case "km":
      return `${value.toFixed(2)} km`;
    case "km/h":
      return `${value.toFixed(1)} km/h`;
    case "m":
      return `${Math.round(value)} m`;
    case "min": {
      const hours = Math.floor(value / 60);
      const mins = Math.round(value % 60);
      return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
    }
    case "bpm":
      return `${Math.round(value)} bpm`;
    case "kcal":
      return `${Math.round(value)} kcal`;
    case "points":
      return `${Math.round(value)} pts`;
    default:
      return `${value} ${unit}`;
  }
};

export const showRecordNotifications = (newRecords: NewRecord[]): void => {
  if (newRecords.length === 0) return;

  newRecords.forEach((record, index) => {
    setTimeout(() => {
      const icon = RECORD_TYPE_ICONS[record.recordType] || "🏆";
      const improvement = record.improvement
        ? ` (+${record.improvement.toFixed(1)}%)`
        : " (Premier record!)";

      toast.success(
        <div className="flex flex-col">
          <div className="font-bold flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            Nouveau Record!
          </div>
          <div className="text-sm">
            {record.recordTypeName} - {record.activityType}
          </div>
          <div className="font-semibold text-brand">
            {formatRecordValue(record.value, record.unit)}
            <span className="text-success text-xs ml-1">{improvement}</span>
          </div>
        </div>,
        {
          duration: 6000,
          icon: "🏆",
        }
      );
    }, index * 800);
  });
};

export const getPeriodLabel = (period: string): string => {
  switch (period) {
    case "7":
      return "7 derniers jours";
    case "30":
      return "30 derniers jours";
    case "90":
      return "90 derniers jours";
    case "365":
      return "Cette année";
    default:
      return "";
  }
};
