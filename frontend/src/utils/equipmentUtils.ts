/**
 * Utilitaires pour le module Équipement
 */

import type { Equipment, MaintenanceStatus } from "../types/equipment";

export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(0) + " km";
}

export function getTypeIcon(type: string): string {
  if (type.includes("Vélo")) return "🚴";
  if (type.includes("Chaussures")) return "👟";
  if (type === "Cardio") return "⌚";
  if (type === "Capteur Puissance") return "⚡";
  return "🔧";
}

export function getMaintenanceStatus(item: Equipment): MaintenanceStatus | null {
  if (!item.alertDistance) return null;

  const distanceSinceNew = item.currentDistance - item.initialDistance;
  const remaining = item.alertDistance - distanceSinceNew;
  const percentage = (distanceSinceNew / item.alertDistance) * 100;

  if (remaining <= 0) {
    return { status: "urgent", label: "Maintenance urgente !", color: "bg-danger", percentage: 100 };
  } else if (remaining <= 500000) {
    return { status: "soon", label: `Maintenance dans ${formatDistance(remaining)}`, color: "bg-warning", percentage };
  } else {
    return { status: "ok", label: `Prochain entretien: ${formatDistance(remaining)}`, color: "bg-success", percentage };
  }
}
