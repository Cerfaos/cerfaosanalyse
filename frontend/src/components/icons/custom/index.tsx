/**
 * =============================================================================
 * REGISTRE DES ICÔNES PERSONNALISÉES
 * =============================================================================
 *
 * Organisation par catégories :
 * - metrics.tsx    : Métriques de performance (power, heart, trimp, fitness)
 * - activities.tsx : Types d'activités (road-bike, home-trainer)
 * - navigation.tsx : Navigation et UI (à créer)
 * - status.tsx     : États et indicateurs (à créer)
 * - equipment.tsx  : Équipement sportif (à créer)
 *
 * Pour ajouter une nouvelle icône :
 * 1. Identifier la catégorie appropriée
 * 2. Ajouter l'icône dans le fichier de catégorie
 * 3. L'exporter dans le tableau de la catégorie
 * 4. L'icône sera automatiquement disponible via <Icon name="..." />
 */

import type { CustomIconComponent, IconCategory, IconMetadata } from './types'

// Import des catégories
import { metricsIcons } from './metrics'
import { activitiesIcons } from './activities'

// Import du registre PNG
export {
  pngIcons,
  pngIconsMap,
  hasPngIcon,
  getPngIconPath,
  getPngIconsByCategory,
  getPngIconStats,
} from './pngRegistry'

// =============================================================================
// RE-EXPORTS pour la compatibilité et l'accès direct
// =============================================================================

export type { CustomIconProps, CustomIconComponent, IconCategory, IconMetadata, IconSource, PngIconConfig } from './types'

// Export individuel des icônes (pour import direct si nécessaire)
export { PowerMeter, HeartZone, Trimp, Fitness } from './metrics'
export { RoadBike, HomeTrainer } from './activities'

// =============================================================================
// REGISTRE UNIFIÉ
// =============================================================================

/**
 * Registre de toutes les icônes personnalisées
 * Clé = nom utilisé dans <Icon name="..." />
 */
export const customIcons: Record<string, CustomIconComponent> = {
  ...metricsIcons,
  ...activitiesIcons,
}

// =============================================================================
// MÉTADONNÉES POUR LE DASHBOARD
// =============================================================================

/**
 * Métadonnées complètes des icônes pour le tracking et le dashboard
 */
export const iconMetadata: IconMetadata[] = [
  // Métriques
  {
    name: 'power-meter',
    category: 'metrics',
    description: 'Mesure de puissance (watts)',
    lucideEquivalent: 'Zap',
    hasCustom: true,
  },
  {
    name: 'heart-zone',
    category: 'metrics',
    description: 'Zones de fréquence cardiaque',
    lucideEquivalent: 'HeartPulse',
    hasCustom: true,
  },
  {
    name: 'trimp',
    category: 'metrics',
    description: 'Training Impulse (charge)',
    lucideEquivalent: 'TrendingUp',
    hasCustom: true,
  },
  {
    name: 'fitness',
    category: 'metrics',
    description: 'CTL / Forme physique',
    lucideEquivalent: 'Activity',
    hasCustom: true,
  },
  // Activités
  {
    name: 'road-bike',
    category: 'activities',
    description: 'Vélo de route',
    lucideEquivalent: 'Bike',
    hasCustom: true,
  },
  {
    name: 'home-trainer',
    category: 'activities',
    description: 'Home trainer / Rouleau',
    lucideEquivalent: 'Home',
    hasCustom: true,
  },
]

/**
 * Icônes Lucide utilisées dans l'app qu'on pourrait remplacer
 * (pour le tracking dans le dashboard)
 */
export const lucideIconsInUse: Array<{
  name: string
  category: IconCategory
  usageCount: number
  priority: 'high' | 'medium' | 'low'
  customReplacement?: string
}> = [
  // Activités - HAUTE priorité
  { name: 'Bike', category: 'activities', usageCount: 8, priority: 'high', customReplacement: 'road-bike' },
  { name: 'Dumbbell', category: 'activities', usageCount: 6, priority: 'high' },

  // Métriques - HAUTE priorité
  { name: 'Zap', category: 'metrics', usageCount: 12, priority: 'high', customReplacement: 'power-meter' },
  { name: 'HeartPulse', category: 'metrics', usageCount: 2, priority: 'high', customReplacement: 'heart-zone' },
  { name: 'TrendingUp', category: 'metrics', usageCount: 8, priority: 'medium', customReplacement: 'trimp' },
  { name: 'TrendingDown', category: 'metrics', usageCount: 5, priority: 'medium' },
  { name: 'Activity', category: 'metrics', usageCount: 3, priority: 'medium', customReplacement: 'fitness' },

  // Navigation - MOYENNE priorité
  { name: 'ChevronLeft', category: 'navigation', usageCount: 2, priority: 'medium' },
  { name: 'ChevronRight', category: 'navigation', usageCount: 2, priority: 'medium' },
  { name: 'ChevronUp', category: 'navigation', usageCount: 3, priority: 'low' },
  { name: 'ChevronDown', category: 'navigation', usageCount: 3, priority: 'low' },
  { name: 'Search', category: 'navigation', usageCount: 3, priority: 'medium' },
  { name: 'Filter', category: 'navigation', usageCount: 2, priority: 'low' },
  { name: 'Plus', category: 'navigation', usageCount: 6, priority: 'medium' },
  { name: 'X', category: 'navigation', usageCount: 4, priority: 'low' },

  // Status - MOYENNE priorité
  { name: 'Check', category: 'status', usageCount: 2, priority: 'medium' },
  { name: 'AlertCircle', category: 'status', usageCount: 3, priority: 'medium' },
  { name: 'AlertTriangle', category: 'status', usageCount: 2, priority: 'medium' },
  { name: 'Loader2', category: 'status', usageCount: 5, priority: 'low' },

  // Autres
  { name: 'Calendar', category: 'navigation', usageCount: 3, priority: 'medium' },
  { name: 'Trophy', category: 'status', usageCount: 4, priority: 'high' },
  { name: 'Star', category: 'status', usageCount: 3, priority: 'medium' },
  { name: 'Route', category: 'activities', usageCount: 5, priority: 'high' },
  { name: 'Mountain', category: 'activities', usageCount: 4, priority: 'high' },
  { name: 'Clock', category: 'metrics', usageCount: 4, priority: 'medium' },
]

export default customIcons
