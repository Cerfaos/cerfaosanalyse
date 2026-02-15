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
    color: "#8BC34A",
    bgColor: "#8BC34A15",
    icon: Dumbbell,
  },
  rest: {
    label: "REPOS",
    color: "#5CE1E6",
    bgColor: "#5CE1E615",
    icon: Coffee,
  },
  circuit_rest: {
    label: "REPOS CIRCUIT",
    color: "#FFAB40",
    bgColor: "#FFAB4015",
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
