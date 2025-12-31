/**
 * =============================================================================
 * SYSTÈME D'ICÔNES PERSONNALISABLES
 * =============================================================================
 *
 * Ce composant permet d'utiliser :
 * 1. Des icônes Lucide (par défaut)
 * 2. Des icônes SVG personnalisées (prioritaires si elles existent)
 *
 * Usage :
 * <Icon name="bike" size={24} />           // Utilise lucide OU custom
 * <Icon name="custom-power" size={24} />   // Icône custom uniquement
 *
 * Pour ajouter une icône custom :
 * 1. Créer le SVG dans /src/components/icons/custom/
 * 2. L'exporter dans /src/components/icons/custom/index.ts
 * 3. L'icône sera automatiquement disponible via <Icon name="..." />
 */

import React from "react";
import * as LucideIcons from "lucide-react";
import { customIcons } from "./custom";

// Types pour les icônes Lucide
type LucideIconName = keyof typeof LucideIcons;

// Props du composant Icon
export interface IconProps {
  /** Nom de l'icône (lucide ou custom) */
  name: string;
  /** Taille en pixels (défaut: 24) */
  size?: number;
  /** Couleur (défaut: currentColor) */
  color?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Épaisseur du trait (défaut: 2) */
  strokeWidth?: number;
  /** Accessibilité - label */
  "aria-label"?: string;
}

/**
 * Composant Icon unifié
 * Cherche d'abord dans les icônes custom, puis dans Lucide
 */
export function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
  "aria-label": ariaLabel,
}: IconProps) {
  // 1. Chercher d'abord dans les icônes personnalisées
  const CustomIcon = customIcons[name];
  if (CustomIcon) {
    return (
      <CustomIcon
        width={size}
        height={size}
        color={color}
        className={className}
        aria-label={ariaLabel}
      />
    );
  }

  // 2. Sinon, chercher dans Lucide
  // Convertir le nom en PascalCase pour Lucide (bike → Bike, heart-pulse → HeartPulse)
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as LucideIconName;

  const LucideIcon = LucideIcons[pascalName] as React.ComponentType<{
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
    "aria-label"?: string;
  }>;

  if (LucideIcon) {
    return (
      <LucideIcon
        size={size}
        color={color}
        className={className}
        strokeWidth={strokeWidth}
        aria-label={ariaLabel}
      />
    );
  }

  // 3. Icône non trouvée - afficher un placeholder
  console.warn(`Icon "${name}" not found in custom icons or Lucide`);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel || "Icon not found"}
    >
      <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fill={color}
        stroke="none"
      >
        ?
      </text>
    </svg>
  );
}

/**
 * Hook pour vérifier si une icône existe
 */
export function useIconExists(name: string): boolean {
  if (customIcons[name]) return true;

  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return pascalName in LucideIcons;
}

/**
 * Liste toutes les icônes disponibles (pour debug/documentation)
 */
export function getAllIconNames(): { custom: string[]; lucide: string[] } {
  return {
    custom: Object.keys(customIcons),
    lucide: Object.keys(LucideIcons).filter(
      (key) => typeof (LucideIcons as Record<string, unknown>)[key] === "function"
    ),
  };
}

export default Icon;
