/**
 * Types et configuration pour la charge d'entraînement
 */

export interface TrainingLoadData {
  date: string;
  trimp: number;
  ctl: number;
  atl: number;
  tsb: number;
}

export interface CurrentLoad {
  ctl: number;
  atl: number;
  tsb: number;
  status: string;
  recommendation: string;
}

export interface StatusInfo {
  label: string;
  color: string;
  emoji: string;
  advice: string;
}

export interface TsbZone {
  min: number;
  max: number;
  label: string;
  color: string;
  textColor: string;
}

export const PERIOD_OPTIONS = [
  { value: "30", label: "30 jours" },
  { value: "60", label: "60 jours" },
  { value: "90", label: "90 jours" },
  { value: "180", label: "180 jours" },
];

export const STATUS_MAP: Record<string, StatusInfo> = {
  fresh: {
    label: "Très frais",
    color: "bg-success/10 text-success border-success/30",
    emoji: "💪",
    advice:
      "Idéal pour une compétition ou un effort maximal. Attention à ne pas rester trop longtemps dans cet état au risque de perdre en forme.",
  },
  rested: {
    label: "Reposé",
    color: "bg-brand/10 text-brand border-brand/30",
    emoji: "😊",
    advice: "Bon équilibre. Vous pouvez augmenter progressivement la charge ou maintenir ce niveau.",
  },
  optimal: {
    label: "Optimal",
    color: "bg-accent/10 text-text-dark border-accent/30",
    emoji: "🎯",
    advice: "Zone idéale pour progresser ! Continuez ainsi en alternant efforts et récupération.",
  },
  tired: {
    label: "Fatigué",
    color: "bg-warning/10 text-warning border-warning/30",
    emoji: "😓",
    advice: "Privilégiez la récupération active (sorties légères Z1-Z2) ou le repos complet.",
  },
  overreached: {
    label: "Surentraîné",
    color: "bg-error/10 text-error border-error/30",
    emoji: "🚨",
    advice: "Risque de blessure ou de surmenage ! Repos impératif pendant plusieurs jours.",
  },
};

export const TSB_ZONES: TsbZone[] = [
  { min: -40, max: -30, label: "Critique", color: "bg-red-500", textColor: "text-red-400" },
  { min: -30, max: -10, label: "Fatigué", color: "bg-orange-500", textColor: "text-orange-400" },
  { min: -10, max: 5, label: "Optimal", color: "bg-green-500", textColor: "text-green-400" },
  { min: 5, max: 25, label: "Reposé", color: "bg-blue-500", textColor: "text-blue-400" },
  { min: 25, max: 40, label: "Très frais", color: "bg-cyan-500", textColor: "text-cyan-400" },
];

export function getTsbPosition(tsb: number): number {
  const clampedTsb = Math.max(-40, Math.min(40, tsb));
  return ((clampedTsb + 40) / 80) * 100;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
