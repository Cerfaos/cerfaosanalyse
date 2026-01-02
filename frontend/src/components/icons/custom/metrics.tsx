/**
 * =============================================================================
 * ICÔNES MÉTRIQUES - Mesures et indicateurs de performance
 * =============================================================================
 */

import React from 'react'
import type { CustomIconProps } from './types'

/**
 * Icône Puissance/Watts custom
 */
export const PowerMeter: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
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
)

/**
 * Icône Zone Cardiaque custom
 */
export const HeartZone: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
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
)

/**
 * Icône TRIMP custom
 */
export const Trimp: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
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
)

/**
 * Icône CTL/Fitness custom
 */
export const Fitness: React.FC<CustomIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
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
)

// Export groupé pour la catégorie
export const metricsIcons = {
  'power-meter': PowerMeter,
  'heart-zone': HeartZone,
  trimp: Trimp,
  fitness: Fitness,
}
