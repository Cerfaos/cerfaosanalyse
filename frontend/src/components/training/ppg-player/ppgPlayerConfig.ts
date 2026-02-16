/**
 * Configuration et utilitaires pour le PpgSessionPlayer
 */

import { Timer, Dumbbell, Coffee } from "lucide-react";
import type { PpgPhase } from "../../../hooks/usePpgSessionTimer";

export interface PhaseConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Timer;
}

export const PHASE_CONFIG: Record<PpgPhase, PhaseConfig> = {
  exercise: {
    label: "EXERCICE",
    color: "var(--brand-primary)",
    bgColor: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
    icon: Dumbbell,
  },
  rest: {
    label: "REPOS",
    color: "var(--brand-secondary)",
    bgColor: "color-mix(in srgb, var(--brand-secondary) 8%, transparent)",
    icon: Coffee,
  },
  circuit_rest: {
    label: "REPOS CIRCUIT",
    color: "var(--metric-energy)",
    bgColor: "color-mix(in srgb, var(--metric-energy) 8%, transparent)",
    icon: Coffee,
  },
};

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
