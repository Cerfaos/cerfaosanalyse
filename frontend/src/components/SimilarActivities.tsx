import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface SimilarActivity {
  id: number;
  type: string;
  date: string;
  distance: number;
  duration: number;
  avgSpeed: number | null;
  avgHeartRate: number | null;
  trimp: number | null;
  similarityScore: number;
  comparison: {
    distanceDiff: number;
    durationDiff: number;
    speedDiff: number;
    hrDiff: number;
    elevationDiff: number;
    trimpDiff: number;
  };
}

export default function SimilarActivities({
  activityId,
}: {
  activityId: number;
}) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<SimilarActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const response = await api.get(
          `/api/analytics/activities/${activityId}/similar`
        );
        setActivities(response.data.data);
      } catch (error) {
        // Silencieux
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      fetchSimilar();
    }
  }, [activityId]);

  if (loading) return null;
  if (activities.length === 0) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const formatDiff = (value: number, unit: string, inverse = false) => {
    if (value === 0) return <span className="text-[var(--text-disabled)]">=</span>;
    const isPositive = value > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const color = isGood ? "text-emerald-400" : "text-red-400";
    const bgColor = isGood ? "bg-emerald-500/10 border-emerald-500/15" : "bg-red-500/10 border-red-500/15";
    const sign = isPositive ? "+" : "";
    return (
      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full border ${bgColor} ${color}`}>
        {sign}
        {value} {unit}
      </span>
    );
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(15,21,32,0.6) 100%)",
        border: "1px solid rgba(99,102,241,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          Sessions similaires
        </span>
        <span className="ml-auto text-xs font-bold text-indigo-400/70 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/15">
          {activities.length}
        </span>
      </div>

      <div className="px-4 pb-4 space-y-2.5">
        {activities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => navigate(`/activities/${activity.id}`)}
            className="group rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-indigo-500/15 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white font-mono">
                  {new Date(activity.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    activity.similarityScore >= 80
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  }`}
                >
                  {activity.similarityScore}%
                </span>
              </div>
              <svg className="w-4 h-4 text-[var(--text-disabled)] group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-1">Distance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold font-mono text-sm">
                    {(activity.distance / 1000).toFixed(2)} km
                  </span>
                  {formatDiff(
                    Number(
                      (activity.comparison.distanceDiff / 1000).toFixed(2)
                    ),
                    "km"
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-1">Durée</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold font-mono text-sm">
                    {formatDuration(activity.duration)}
                  </span>
                  {formatDiff(
                    Math.round(activity.comparison.durationDiff / 60),
                    "min"
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-1">Vitesse</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold font-mono text-sm">
                    {activity.avgSpeed != null ? `${activity.avgSpeed.toFixed(1)} km/h` : "-"}
                  </span>
                  {formatDiff(
                    Number(activity.comparison.speedDiff.toFixed(1)),
                    "km/h"
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-1">FC Moy.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold font-mono text-sm">
                    {activity.avgHeartRate != null ? `${activity.avgHeartRate} bpm` : "-"}
                  </span>
                  {formatDiff(activity.comparison.hrDiff, "bpm", true)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
