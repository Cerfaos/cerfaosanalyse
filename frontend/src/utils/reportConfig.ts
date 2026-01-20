/**
 * Configuration et constantes pour les exports de rapports
 */

// Couleurs (format hex pour compatibilité jsPDF)
export const REPORT_COLORS = {
  primary: '#8BC34A',
  primaryDark: '#689F38',
  bgDark: '#0c1017',
  bgCard: '#142320',
  textPrimary: '#ffffff',
  textSecondary: '#9CA3AF',
  border: '#2a3f3a',
  blue: '#3B82F6',
  purple: '#A855F7',
  green: '#22C55E',
  red: '#EF4444',
  yellow: '#FACC15',
  cyan: '#0EA5E9',
  orange: '#F97316',
  pink: '#EC4899',
  teal: '#14B8A6',
};

export const TYPE_COLORS = [
  REPORT_COLORS.primary,
  REPORT_COLORS.blue,
  REPORT_COLORS.purple,
  REPORT_COLORS.orange,
  REPORT_COLORS.pink,
  REPORT_COLORS.teal,
  REPORT_COLORS.yellow,
];

// Dimensions PDF A4
export const PDF_DIMENSIONS = {
  pageWidth: 210,
  pageHeight: 297,
  margin: 15,
  get contentWidth() {
    return this.pageWidth - 2 * this.margin;
  },
};

// Formatage
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: decimals });
}

export function formatGeneratedDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFullDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
