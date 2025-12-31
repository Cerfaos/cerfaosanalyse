/**
 * =============================================================================
 * REGISTRE DES ICÔNES PERSONNALISÉES
 * =============================================================================
 *
 * Pour ajouter une nouvelle icône :
 *
 * 1. Créer un fichier SVG ou composant React :
 *    /src/components/icons/custom/MyIcon.tsx
 *
 * 2. Exporter le composant ici :
 *    export { MyIcon } from './MyIcon';
 *
 * 3. L'ajouter au registre customIcons ci-dessous
 *
 * Format attendu pour une icône custom :
 * - Props: { width, height, color, className, 'aria-label' }
 * - ViewBox: "0 0 24 24" (standard)
 * - Stroke/Fill: utiliser la prop 'color'
 */

import React from "react";

// Type pour les icônes custom
export interface CustomIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

type CustomIconComponent = React.ComponentType<CustomIconProps>;

// =============================================================================
// EXEMPLES D'ICÔNES CUSTOM (à remplacer par tes propres icônes)
// =============================================================================

/**
 * Icône Puissance/Watts custom
 */
export const PowerMeter: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
  >
    {/* Cercle de pédalier */}
    <circle cx="12" cy="12" r="8" />
    {/* Aiguille de puissance */}
    <path d="M12 8v4l3 2" />
    {/* Éclair de puissance */}
    <path d="M11 2l1 3h2l-2 3 1 3-3-2-3 2 1-3-2-3h2l1-3" />
  </svg>
);

/**
 * Icône Zone Cardiaque custom
 */
export const HeartZone: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
  >
    {/* Cœur */}
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    {/* Lignes de zone (niveaux) */}
    <line x1="6" y1="10" x2="18" y2="10" strokeOpacity="0.5" />
    <line x1="7" y1="13" x2="17" y2="13" strokeOpacity="0.5" />
  </svg>
);

/**
 * Icône TRIMP custom
 */
export const Trimp: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
  >
    {/* Graphique de charge */}
    <polyline points="3 17 9 11 13 15 21 7" />
    {/* Flèche montante */}
    <polyline points="17 7 21 7 21 11" />
    {/* Base */}
    <line x1="3" y1="21" x2="21" y2="21" />
  </svg>
);

/**
 * Icône CTL/Fitness custom
 */
export const Fitness: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
  >
    {/* Courbe progressive */}
    <path d="M3 20 Q 6 18, 9 15 T 15 8 T 21 4" />
    {/* Points de progression */}
    <circle cx="9" cy="15" r="2" fill={color} />
    <circle cx="15" cy="8" r="2" fill={color} />
  </svg>
);

/**
 * Icône Vélo Route custom
 */
export const RoadBike: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
  >
    {/* Roue arrière */}
    <circle cx="5" cy="17" r="3" />
    {/* Roue avant */}
    <circle cx="19" cy="17" r="3" />
    {/* Cadre */}
    <path d="M5 17L9 9L15 9L19 17" />
    <path d="M9 9L12 17L15 9" />
    {/* Guidon course */}
    <path d="M15 9L17 7L19 8" />
    {/* Selle */}
    <path d="M9 9L7 7" />
  </svg>
);

/**
 * Icône Home Trainer custom
 */
export const HomeTrainer: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
  "aria-label": ariaLabel,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
  >
    {/* Roue sur rouleau */}
    <circle cx="12" cy="10" r="5" />
    {/* Rouleau */}
    <ellipse cx="12" cy="18" rx="8" ry="2" />
    {/* Support */}
    <line x1="4" y1="18" x2="4" y2="22" />
    <line x1="20" y1="18" x2="20" y2="22" />
    {/* Base */}
    <line x1="2" y1="22" x2="22" y2="22" />
  </svg>
);

// =============================================================================
// REGISTRE DES ICÔNES
// =============================================================================

/**
 * Registre de toutes les icônes personnalisées
 * Clé = nom utilisé dans <Icon name="..." />
 */
export const customIcons: Record<string, CustomIconComponent> = {
  // Métriques cyclistes
  "power-meter": PowerMeter,
  "heart-zone": HeartZone,
  trimp: Trimp,
  fitness: Fitness,

  // Types de vélo/activité
  "road-bike": RoadBike,
  "home-trainer": HomeTrainer,

  // Ajoute tes icônes personnalisées ici :
  // 'mon-icone': MonIconeComponent,
};

export default customIcons;
