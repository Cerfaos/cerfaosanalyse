/**
 * Hook pour charger les statistiques cardio/cyclisme
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import type { CyclingStatsPayload } from '../types/cyclingStats';
import { formatDate } from '../utils/cyclingStatsConfig';

interface UseCyclingStatsReturn {
  stats: CyclingStatsPayload | null;
  loading: boolean;
  error: string;
  period: string;
  setPeriod: (period: string) => void;
  selectedTypes: string[];
  toggleType: (type: string) => void;
  resetTypes: () => void;
  indoorFilter: string;
  setIndoorFilter: (filter: string) => void;
  durationHours: number;
  analysisRangeLabel: string;
}

export function useCyclingStats(): UseCyclingStatsReturn {
  const [period, setPeriod] = useState('90');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [indoorFilter, setIndoorFilter] = useState('');
  const [stats, setStats] = useState<CyclingStatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, string> = { period };
        if (selectedTypes.length > 0) {
          params.types = selectedTypes.join(',');
        }
        if (indoorFilter) {
          params.indoor = indoorFilter;
        }
        const response = await api.get('/api/activities/cycling-stats', { params });
        if (mounted) {
          setStats(response.data.data);
        }
      } catch (err) {
        if (mounted) {
          let message = 'Impossible de charger les statistiques cardio';
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            message = axiosErr.response?.data?.message || message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          setError(message);
          setStats(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, [period, selectedTypes, indoorFilter]);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const resetTypes = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  const durationHours = useMemo(() => {
    if (!stats) return 0;
    return stats.summary.totalDuration / 3600;
  }, [stats]);

  const analysisRangeLabel = useMemo(() => {
    if (!stats?.filters.startDate) {
      return 'Historique sélectionné';
    }
    const startFormatted = formatDate(stats.filters.startDate);
    const endSource = stats.filters.endDate ?? stats.filters.startDate;
    const endFormatted = formatDate(endSource);
    return `Du ${startFormatted} au ${endFormatted}`;
  }, [stats]);

  return {
    stats,
    loading,
    error,
    period,
    setPeriod,
    selectedTypes,
    toggleType,
    resetTypes,
    indoorFilter,
    setIndoorFilter,
    durationHours,
    analysisRangeLabel,
  };
}
