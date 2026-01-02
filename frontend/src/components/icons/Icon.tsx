/**
 * =============================================================================
 * SYSTÈME D'ICÔNES PERSONNALISABLES
 * =============================================================================
 *
 * Ce composant permet d'utiliser :
 * 1. Des icônes PNG personnalisées (priorité maximale)
 * 2. Des icônes SVG personnalisées (priorité haute)
 * 3. Des icônes Lucide (fallback par défaut)
 *
 * Usage :
 * <Icon name="bike" size={24} />           // Utilise PNG > SVG > Lucide
 * <Icon name="mountain-bike" size={24} />  // Icône custom PNG
 *
 * Pour ajouter une icône :
 * - PNG : Ajouter dans /public/icons/[category]/ et enregistrer dans pngRegistry.ts
 * - SVG : Créer dans /src/components/icons/custom/[category].tsx
 */

import React from "react";
import * as LucideIcons from "lucide-react";
import { customIcons } from "./custom";
import { hasPngIcon, getPngIconPath } from "./custom/pngRegistry";

// Types pour les icônes Lucide
type LucideIconName = keyof typeof LucideIcons;

// Props du composant Icon
export interface IconProps {
  /** Nom de l'icône (png, svg custom ou lucide) */
  name: string;
  /** Taille en pixels (défaut: 24) */
  size?: number;
  /** Couleur (défaut: currentColor) - non applicable aux PNG */
  color?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Épaisseur du trait (défaut: 2) - pour Lucide/SVG uniquement */
  strokeWidth?: number;
  /** Accessibilité - label */
  "aria-label"?: string;
  /** Forcer un type spécifique (utile pour debug/dashboard) */
  forceType?: 'png' | 'svg' | 'lucide';
}

/**
 * Composant Icon unifié
 * Ordre de priorité : PNG > SVG Custom > Lucide
 */
export function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
  "aria-label": ariaLabel,
  forceType,
}: IconProps) {
  // 1. Chercher d'abord dans les icônes PNG (priorité maximale)
  if (forceType !== 'svg' && forceType !== 'lucide' && hasPngIcon(name)) {
    const pngPath = getPngIconPath(name);
    if (pngPath) {
      return (
        <img
          src={pngPath}
          alt={ariaLabel || name}
          width={size}
          height={size}
          className={`inline-block ${className}`}
          style={{ objectFit: 'contain' }}
        />
      );
    }
  }

  // 2. Chercher dans les icônes SVG personnalisées
  if (forceType !== 'png' && forceType !== 'lucide') {
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
  }

  // 3. Sinon, chercher dans Lucide
  if (forceType !== 'png' && forceType !== 'svg') {
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
  }

  // 4. Icône non trouvée - afficher un placeholder
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
 * Hook pour vérifier si une icône existe et son type
 */
export function useIconExists(name: string): { exists: boolean; type: 'png' | 'svg' | 'lucide' | null } {
  // Vérifier PNG
  if (hasPngIcon(name)) {
    return { exists: true, type: 'png' };
  }

  // Vérifier SVG custom
  if (customIcons[name]) {
    return { exists: true, type: 'svg' };
  }

  // Vérifier Lucide
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  if (pascalName in LucideIcons) {
    return { exists: true, type: 'lucide' };
  }

  return { exists: false, type: null };
}

/**
 * Liste toutes les icônes disponibles (pour debug/documentation)
 */
export function getAllIconNames(): { png: string[]; custom: string[]; lucide: string[] } {
  // Note: Pour obtenir les PNG, importer directement depuis pngRegistry
  return {
    png: [], // Utiliser getPngIconStats() ou pngIcons directement depuis pngRegistry
    custom: Object.keys(customIcons),
    lucide: Object.keys(LucideIcons).filter(
      (key) => typeof (LucideIcons as Record<string, unknown>)[key] === "function"
    ),
  };
}

export default Icon;
