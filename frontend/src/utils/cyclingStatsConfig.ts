/**
 * Configuration et utilitaires pour les statistiques cardio/cyclisme
 */

import type { ZoneComputationSource } from '../types/cyclingStats';

export const PERIOD_OPTIONS = [
  { label: '7 jours', value: '7' },
  { label: '30 jours', value: '30' },
  { label: '90 jours', value: '90' },
  { label: '1 an', value: '365' },
  { label: 'Tout', value: 'all' },
];

export const INDOOR_OPTIONS = [
  { label: 'Tous', value: '' },
  { label: 'Extérieur', value: 'false' },
  { label: 'Intérieur', value: 'true' },
];

export const DATA_SOURCE_LABELS: Record<ZoneComputationSource, string> = {
  samples: 'Trace cardio',
  average: 'FC moyenne',
  none: 'Non disponible',
};

export const INTENSITY_COLORS = {
  low: '#0EA5E9',
  moderate: '#FACC15',
  high: '#EF4444',
};

export const TYPE_COLORS: Record<string, string> = {
  Cyclisme: '#3B82F6',
  Course: '#F97316',
  Rameur: '#06B6D4',
  Natation: '#0EA5E9',
  Marche: '#22C55E',
  Randonnée: '#A855F7',
  Musculation: '#EF4444',
  Yoga: '#EC4899',
};

export function formatDuration(seconds: number): string {
  const totalSeconds = Math.round(seconds || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }
  if (minutes > 0) {
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
