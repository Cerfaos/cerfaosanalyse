/**
 * =============================================================================
 * ICÔNES ACTIVITÉS - Types de vélo et sports
 * =============================================================================
 */

import React from 'react'
import type { CustomIconProps } from './types'

/**
 * Icône Vélo Route custom
 */
export const RoadBike: React.FC<CustomIconProps> = ({
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
)

/**
 * Icône Home Trainer custom
 */
export const HomeTrainer: React.FC<CustomIconProps> = ({
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
)

// Export groupé pour la catégorie
export const activitiesIcons = {
  'road-bike': RoadBike,
  'home-trainer': HomeTrainer,
}
