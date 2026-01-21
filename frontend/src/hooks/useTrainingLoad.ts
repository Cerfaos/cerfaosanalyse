/**
 * Hook pour la gestion de la charge d'entraînement
 */

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import type { TrainingLoadData, CurrentLoad } from "../types/trainingLoad";

export function useTrainingLoad(initialPeriod: string = "90") {
  const [period, setPeriod] = useState(initialPeriod);
  const [currentLoad, setCurrentLoad] = useState<CurrentLoad | null>(null);
  const [history, setHistory] = useState<TrainingLoadData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainingLoad = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/activities/training-load?days=${period}`);
      setCurrentLoad(response.data.data.current);
      setHistory(response.data.data.history);
    } catch {
      // Erreur gérée par toast
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTrainingLoad();
  }, [fetchTrainingLoad]);

  return {
    period,
    setPeriod,
    currentLoad,
    history,
    loading,
  };
}
