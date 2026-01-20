import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import type { Activity, GpsPoint } from "../types/activity";

interface UseActivityDetailResult {
  activity: Activity | null;
  gpsData: GpsPoint[];
  loading: boolean;
  error: string;
  loadActivity: () => Promise<void>;
}

export const useActivityDetail = (id: string | undefined): UseActivityDetailResult => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [gpsData, setGpsData] = useState<GpsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivity = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/activities/${id}`);
      const activityData = response.data.data;

      setActivity(activityData);

      // Parser les données GPS si disponibles
      if (activityData.gpsData) {
        try {
          const parsed = JSON.parse(activityData.gpsData);
          // Filtrer les points GPS invalides
          const validPoints = parsed.filter(
            (point: GpsPoint) =>
              point.lat &&
              point.lon &&
              point.lat !== 0 &&
              point.lon !== 0 &&
              Math.abs(point.lat) <= 90 &&
              Math.abs(point.lon) <= 180
          );
          setGpsData(validPoints);
        } catch {
          // GPS parsing silencieux
          setGpsData([]);
        }
      } else {
        setGpsData([]);
      }
      setError("");
    } catch {
      setError("Impossible de charger l'activité");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return { activity, gpsData, loading, error, loadActivity };
};

export default useActivityDetail;
