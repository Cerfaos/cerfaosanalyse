import { useNavigate } from "react-router-dom";
import {
  type Activity,
  type WeatherData,
  getActivityColor,
  getActivityIcon,
  formatDuration,
  formatDistance,
  getTrimpColor,
  getTrimpLevel,
} from "./activityUtils";

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

export default function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const navigate = useNavigate();
  const colors = getActivityColor(activity.type);
  const isStaticActivity = ["Yoga", "Mobilité", "Musculation"].includes(activity.type);

  return (
    <div
      className="group relative bg-[#0A191A]/60 rounded-2xl border border-[#8BC34A]/20 hover:border-[#8BC34A]/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
      onClick={() => navigate(`/activities/${activity.id}`)}
    >
      {/* Bande de couleur à gauche */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.bg} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Icône avec fond gradient */}
            <div
              className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-white">{activity.type}</h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8BC34A]/20 text-[#8BC34A] shadow-sm">
                  {new Date(activity.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {new Date(activity.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">
                  {new Date(activity.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                  })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(activity);
              }}
              className="opacity-0 group-hover:opacity-100 text-brand hover:text-brand/80 hover:bg-brand/10 p-2 rounded-lg transition-all duration-200"
              title="Modifier"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(activity.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200"
              title="Supprimer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Métriques */}
        {isStaticActivity ? (
          <StaticActivityMetrics activity={activity} />
        ) : (
          <DynamicActivityMetrics activity={activity} />
        )}
      </div>

      {/* Indicateur de navigation */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-6 h-6 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function StaticActivityMetrics({ activity }: { activity: Activity }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard label="Durée" value={formatDuration(activity.duration)} />
      <MetricCard
        label="Calories"
        value={activity.calories ? `${activity.calories}` : "-"}
        unit={activity.calories ? "kcal" : undefined}
        valueClass="text-amber-400"
      />
      <MetricCard
        label="FC moy"
        value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "-"}
        unit={activity.avgHeartRate ? "bpm" : undefined}
        valueClass="text-[#FF5252]"
      />
      <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">TRIMP</p>
        <p className={`text-lg font-bold ${getTrimpColor(activity.trimp)}`}>
          {activity.trimp || "-"}
        </p>
        {activity.trimp && (
          <p className="text-xs text-gray-400 mt-0.5">{getTrimpLevel(activity.trimp)}</p>
        )}
      </div>
    </div>
  );
}

function DynamicActivityMetrics({ activity }: { activity: Activity }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      <MetricCard label="Distance" value={formatDistance(activity.distance)} />
      <MetricCard label="Durée" value={formatDuration(activity.duration)} />
      <MetricCard
        label={activity.avgSpeed ? "Vitesse" : "Dénivelé"}
        value={
          activity.avgSpeed
            ? `${activity.avgSpeed.toFixed(1)}`
            : activity.elevationGain
              ? `${activity.elevationGain}`
              : "-"
        }
        unit={activity.avgSpeed ? "km/h" : activity.elevationGain ? "m" : undefined}
        valueClass="text-cyan-400"
      />
      <MetricCard
        label="FC moy"
        value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "-"}
        unit={activity.avgHeartRate ? "bpm" : undefined}
        valueClass="text-[#FF5252]"
      />
      <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">TRIMP</p>
        <p className={`text-lg font-bold ${getTrimpColor(activity.trimp)}`}>
          {activity.trimp || "-"}
        </p>
        {activity.trimp && (
          <p className="text-xs text-gray-400 mt-0.5">{getTrimpLevel(activity.trimp)}</p>
        )}
      </div>
      <WeatherMetric weather={activity.weather} />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  valueClass?: string;
}

function MetricCard({ label, value, unit, valueClass = "text-white" }: MetricCardProps) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>
        {value}
        {unit && <span className="text-xs font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function WeatherMetric({ weather }: { weather: string | null }) {
  if (!weather) {
    return (
      <div className="bg-white/5 rounded-xl p-3 border border-white/10 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 text-center">
          Météo
        </p>
        <p className="text-lg font-bold text-white text-center">-</p>
      </div>
    );
  }

  try {
    const weatherData: WeatherData = JSON.parse(weather);
    return (
      <div className="bg-white/5 rounded-xl p-3 border border-white/10 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 text-center">
          Météo
        </p>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`}
              alt={weatherData.description}
              className="w-8 h-8"
            />
            <p className="text-lg font-bold text-white">{Math.round(weatherData.temperature)}°</p>
          </div>
          <p className="text-xs text-gray-400 truncate max-w-full">
            💨 {weatherData.windSpeed} km/h
          </p>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="bg-white/5 rounded-xl p-3 border border-white/10 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 text-center">
          Météo
        </p>
        <p className="text-lg font-bold text-white text-center">-</p>
      </div>
    );
  }
}
