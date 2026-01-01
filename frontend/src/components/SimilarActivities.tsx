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
    if (value === 0) return <span className="text-gray-500">=</span>;
    const isPositive = value > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const color = isGood ? "text-emerald-500" : "text-red-500";
    const sign = isPositive ? "+" : "";
    return (
      <span className={`text-xs font-medium ${color}`}>
        {sign}
        {value} {unit}
      </span>
    );
  };

  return (
    <div className="glass-panel p-6 mt-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          Sessions similaires <span className="text-2xl">👯</span>
        </h3>
        <p className="text-sm text-gray-400">
          Basé sur la distance, durée et intensité
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => navigate(`/activities/${activity.id}`)}
            className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-primary/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-primary">
                  {new Date(activity.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300">
                  {activity.similarityScore}% similaire
                </div>
              </div>
              <div className="text-gray-400 text-sm">➜</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Distance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-medium">
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
                <p className="text-xs text-gray-500 mb-1">Durée</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-medium">
                    {formatDuration(activity.duration)}
                  </span>
                  {formatDiff(
                    Math.round(activity.comparison.durationDiff / 60),
                    "min"
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Vitesse</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-medium">
                    {activity.avgSpeed?.toFixed(1)} km/h
                  </span>
                  {formatDiff(
                    Number(activity.comparison.speedDiff.toFixed(1)),
                    "km/h"
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">FC Moy.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-medium">
                    {activity.avgHeartRate} bpm
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
