/**
 * Types partagés pour les icônes personnalisées
 */

import React from 'react'

export interface CustomIconProps {
  width?: number
  height?: number
  color?: string
  className?: string
  'aria-label'?: string
}

export type CustomIconComponent = React.ComponentType<CustomIconProps>

/**
 * Catégories d'icônes disponibles
 */
export type IconCategory =
  | 'metrics'      // Métriques de performance (power, heart, trimp, etc.)
  | 'activities'   // Types d'activités (vélo, course, natation, etc.)
  | 'navigation'   // Navigation et UI (menu, arrows, etc.)
  | 'status'       // États et indicateurs (success, warning, etc.)
  | 'equipment'    // Équipement (casque, chaussures, etc.)

/**
 * Type de source d'icône
 */
export type IconSource = 'png' | 'svg' | 'lucide'

/**
 * Métadonnées d'une icône pour le dashboard
 */
export interface IconMetadata {
  name: string
  category: IconCategory
  description?: string
  lucideEquivalent?: string  // Nom de l'icône Lucide qu'elle remplace
  hasCustom: boolean
  source?: IconSource        // Type de source (png, svg, lucide)
  pngPath?: string           // Chemin vers le PNG si disponible
}

/**
 * Configuration d'une icône PNG
 */
export interface PngIconConfig {
  name: string
  category: IconCategory
  path: string               // Chemin relatif depuis /icons/
  description?: string
  lucideEquivalent?: string
}
