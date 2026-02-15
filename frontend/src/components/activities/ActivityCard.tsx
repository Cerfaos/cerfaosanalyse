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

  const dateObj = new Date(activity.date);
  const dateStr = dateObj.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dayStr = dateObj.toLocaleDateString("fr-FR", { weekday: "short" });

  return (
    <div
      className="group relative rounded-2xl border border-[#1e293b] bg-[#0f1520] hover:border-[#334155] hover:bg-[#111827] transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/activities/${activity.id}`)}
    >
      {/* Left accent bar - thick and visible */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${colors.bg}`} />

      <div className="flex items-center gap-5 pl-6 pr-5 py-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center text-lg flex-shrink-0 shadow-lg`}>
          {getActivityIcon(activity.type)}
        </div>

        {/* Info block */}
        <div className="min-w-[160px]">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-extrabold text-white tracking-tight">{activity.type}</h3>
            {activity.trimp && activity.trimp >= 200 && (
              <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-[9px] font-black text-red-400 uppercase tracking-wider">
                Intense
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#475569] mt-1 font-mono tabular-nums">
            <span className="text-[#64748b] capitalize">{dayStr}</span>
            <span className="mx-1.5 text-[#1e293b]">|</span>
            {dateStr}
            <span className="mx-1.5 text-[#1e293b]">|</span>
            {timeStr}
          </p>
        </div>

        {/* Metrics - inline */}
        <div className="flex-1">
          {isStaticActivity ? (
            <StaticMetrics activity={activity} />
          ) : (
            <DynamicMetrics activity={activity} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(activity); }}
            className="p-2 rounded-lg text-[#475569] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
            className="p-2 rounded-lg text-[#475569] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <svg className="w-4 h-4 text-[#334155] ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function StaticMetrics({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-center gap-6">
      <Metric label="Durée" value={formatDuration(activity.duration)} />
      <Metric label="Calories" value={activity.calories ? `${activity.calories}` : "–"} unit={activity.calories ? "kcal" : undefined} />
      <Metric label="FC moy" value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "–"} unit={activity.avgHeartRate ? "bpm" : undefined} color="#ef4444" />
      <TrimpMetric trimp={activity.trimp} />
    </div>
  );
}

function DynamicMetrics({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <Metric label="Distance" value={formatDistance(activity.distance)} />
      <Metric label="Durée" value={formatDuration(activity.duration)} />
      <Metric
        label={activity.avgSpeed ? "Vitesse" : "Déniv."}
        value={activity.avgSpeed ? `${activity.avgSpeed.toFixed(1)}` : activity.elevationGain ? `${activity.elevationGain}` : "–"}
        unit={activity.avgSpeed ? "km/h" : activity.elevationGain ? "m" : undefined}
      />
      <Metric label="FC moy" value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "–"} unit={activity.avgHeartRate ? "bpm" : undefined} color="#ef4444" />
      <TrimpMetric trimp={activity.trimp} />
      <WeatherInline weather={activity.weather} />
    </div>
  );
}

function Metric({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="min-w-[70px]">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#334155] mb-0.5">{label}</p>
      <p className="text-sm font-extrabold font-mono tabular-nums leading-tight" style={{ color: color || "#e2e8f0" }}>
        {value}
        {unit && <span className="text-[10px] font-semibold text-[#475569] ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

function TrimpMetric({ trimp }: { trimp: number | null }) {
  const level = getTrimpLevel(trimp);
  return (
    <div className="min-w-[55px]">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#334155] mb-0.5">TRIMP</p>
      <p className={`text-sm font-extrabold font-mono tabular-nums leading-tight ${getTrimpColor(trimp)}`}>
        {trimp || "–"}
      </p>
      {level && <p className="text-[8px] font-bold text-[#334155] mt-0.5">{level}</p>}
    </div>
  );
}

function WeatherInline({ weather }: { weather: string | null }) {
  if (!weather) return null;
  try {
    const data: WeatherData = JSON.parse(weather);
    return (
      <div className="min-w-[55px]">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#334155] mb-0.5">Météo</p>
        <div className="flex items-center gap-1">
          <img src={`https://openweathermap.org/img/wn/${data.icon}.png`} alt={data.description} className="w-5 h-5 -ml-0.5" />
          <span className="text-sm font-extrabold font-mono text-[#e2e8f0]">{Math.round(data.temperature)}°</span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
