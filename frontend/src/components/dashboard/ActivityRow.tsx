import type { DashboardActivity } from "../../types/dashboard";
import { getActivityTypeConfigSafe } from "../../utils/dashboardConfig";

interface ActivityRowProps {
  activity: DashboardActivity;
  onClick: () => void;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
}

const getTrimpColor = (trimp: number | null) => {
  if (!trimp) return "text-[var(--text-tertiary)]";
  if (trimp < 50) return "text-brand-primary";
  if (trimp < 100) return "text-metric-energy";
  if (trimp < 200) return "text-metric-alert";
  return "text-metric-alert";
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
      className="w-full flex items-center justify-between p-4 border border-[var(--brand-primary)]/20 rounded-2xl hover:border-[var(--brand-primary)]/40 hover:bg-white/5 transition-all duration-300 text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
          {config.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-brand-primary">{activity.type}</p>
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
          <p className="text-xs text-[var(--text-tertiary)]">
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
        <p className="font-semibold text-[var(--text-primary)]">
          {formatDistance(activity.distance)}
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {formatDuration(activity.duration)}
        </p>
        {activity.avgHeartRate && (
          <p className="text-xs text-metric-alert font-medium">
            ❤️ {activity.avgHeartRate} bpm
          </p>
        )}
      </div>
    </button>
  );
}
