/**
 * =============================================================================
 * REGISTRE DES ICÔNES PNG
 * =============================================================================
 *
 * Ce fichier gère les icônes au format PNG stockées dans /public/icons/
 *
 * Structure des dossiers :
 * /public/icons/
 *   ├── metrics/       (power, heart, trimp, etc.)
 *   ├── activities/    (bike, run, swim, etc.)
 *   ├── navigation/    (arrows, menu, etc.)
 *   ├── status/        (check, warning, etc.)
 *   └── equipment/     (helmet, shoes, etc.)
 *
 * Pour ajouter une icône PNG :
 * 1. Placer le fichier PNG dans le dossier de catégorie approprié
 *    Exemple: /public/icons/activities/mountain-bike.png
 * 2. Ajouter l'entrée dans le tableau pngIcons ci-dessous
 * 3. L'icône sera automatiquement disponible via <Icon name="mountain-bike" />
 *
 * Conventions de nommage :
 * - Utiliser kebab-case : "mountain-bike", pas "mountainBike"
 * - Taille recommandée : 64x64 ou 128x128 pixels
 * - Format : PNG avec transparence
 */

import type { PngIconConfig, IconCategory } from './types'

/**
 * Registre de toutes les icônes PNG disponibles
 *
 * Pour ajouter une nouvelle icône PNG :
 * 1. Ajouter le fichier dans /public/icons/[category]/[nom].png
 * 2. Ajouter une entrée ici avec le même nom
 */
export const pngIcons: PngIconConfig[] = [
  // ==========================================================================
  // MÉTRIQUES - Indicateurs de performance
  // ==========================================================================
  // Exemple :
  // {
  //   name: 'power-meter',
  //   category: 'metrics',
  //   path: 'metrics/power-meter.png',
  //   description: 'Mesure de puissance (watts)',
  //   lucideEquivalent: 'Zap',
  // },

  // ==========================================================================
  // ACTIVITÉS - Types de sports et vélos
  // ==========================================================================
  {
    name: 'rameur',
    category: 'activities',
    path: 'activities/rameur.png',
    description: 'Rameur / Rowing',
    lucideEquivalent: 'Dumbbell',
  },

  // ==========================================================================
  // NAVIGATION - Éléments d'interface
  // ==========================================================================

  // ==========================================================================
  // STATUS - États et indicateurs
  // ==========================================================================

  // ==========================================================================
  // ÉQUIPEMENT - Matériel sportif
  // ==========================================================================
]

/**
 * Créer un Map pour accès rapide par nom
 */
export const pngIconsMap = new Map<string, PngIconConfig>(
  pngIcons.map((icon) => [icon.name, icon])
)

/**
 * Vérifier si une icône PNG existe pour ce nom
 */
export function hasPngIcon(name: string): boolean {
  return pngIconsMap.has(name)
}

/**
 * Obtenir le chemin complet d'une icône PNG
 */
export function getPngIconPath(name: string): string | null {
  const icon = pngIconsMap.get(name)
  return icon ? `/icons/${icon.path}` : null
}

/**
 * Obtenir toutes les icônes PNG d'une catégorie
 */
export function getPngIconsByCategory(category: IconCategory): PngIconConfig[] {
  return pngIcons.filter((icon) => icon.category === category)
}

/**
 * Stats pour le dashboard
 */
export function getPngIconStats() {
  const byCategory: Record<IconCategory, number> = {
    metrics: 0,
    activities: 0,
    navigation: 0,
    status: 0,
    equipment: 0,
  }

  pngIcons.forEach((icon) => {
    byCategory[icon.category]++
  })

  return {
    total: pngIcons.length,
    byCategory,
  }
}
