import type { DashboardActivity } from "../../types/dashboard";
import { getActivityTypeConfigSafe } from "../../utils/dashboardConfig";

interface ActivityRowProps {
  activity: DashboardActivity;
  onClick: () => void;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
}

const getTrimpColor = (trimp: number | null) => {
  if (!trimp) return "text-gray-400";
  if (trimp < 50) return "text-[#8BC34A]";
  if (trimp < 100) return "text-[#FFAB40]";
  if (trimp < 200) return "text-[#FF5252]";
  return "text-[#FF5252]";
};

export default function ActivityRow({
  activity,
  onClick,
  formatDistance,
  formatDuration,
}: ActivityRowProps) {
  const config = getActivityTypeConfigSafe(activity.type);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 border border-[#8BC34A]/20 rounded-2xl hover:border-[#8BC34A]/40 hover:bg-white/5 transition-all duration-300 text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
          {config.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#8BC34A]">{activity.type}</p>
            {activity.trimp && (
              <span
                className={`text-xs font-medium ${getTrimpColor(
                  activity.trimp
                )}`}
              >
                TRIMP {Math.round(activity.trimp)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {new Date(activity.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" à "}
            {new Date(activity.date).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-white">
          {formatDistance(activity.distance)}
        </p>
        <p className="text-xs text-gray-400">
          {formatDuration(activity.duration)}
        </p>
        {activity.avgHeartRate && (
          <p className="text-xs text-[#FF5252] font-medium">
            ❤️ {activity.avgHeartRate} bpm
          </p>
        )}
      </div>
    </button>
  );
}
