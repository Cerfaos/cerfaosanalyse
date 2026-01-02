/**
 * Configuration des icônes pour les headers de pages
 *
 * Pour ajouter une icône personnalisée :
 * 1. Placer l'image PNG/SVG dans /public/icons/pages/
 * 2. Ajouter/modifier l'entrée correspondante ici
 *
 * Format des images recommandé :
 * - Taille : 64x64 ou 128x128 pixels
 * - Format : PNG (avec transparence) ou SVG
 * - Style : icônes blanches ou claires (sur fond coloré)
 */

export interface PageIconConfig {
  // Chemin vers l'image (relatif à /public/)
  image?: string
  // Emoji de fallback si l'image n'existe pas
  fallback: string
}

export const pageIcons: Record<string, PageIconConfig> = {
  // Dashboard / Tableau de bord
  dashboard: {
    image: '/icons/pages/cerfaos.png',
    fallback: '📊',
  },

  // Rapports
  reports: {
    image: '/icons/pages/cerfaos.png',
    fallback: '📊',
  },

  // Activités
  activities: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🚴',
  },

  // Charge d'entraînement
  trainingLoad: {
    image: '/icons/pages/cerfaos.png',
    fallback: '📈',
  },

  // Planification
  trainingPlanner: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🚴',
  },

  // Statistiques cardio
  cyclingStats: {
    image: '/icons/pages/cerfaos.png',
    fallback: '❤️',
  },

  // Records
  records: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🏆',
  },

  // Équipement
  equipment: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🚲',
  },

  // Poids
  weight: {
    image: '/icons/pages/cerfaos.png',
    fallback: '⚖️',
  },

  // Profil
  profile: {
    image: '/icons/pages/cerfaos.png',
    fallback: '👤',
  },

  // Export
  export: {
    image: '/icons/pages/cerfaos.png',
    fallback: '📦',
  },

  // Insights / Analyses
  insights: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🧠',
  },

  // Sous-sections Dashboard
  distance: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🛣️',
  },

  duration: {
    image: '/icons/pages/cerfaos.png',
    fallback: '⏱️',
  },

  strength: {
    image: '/icons/pages/cerfaos.png',
    fallback: '💪',
  },

  heart: {
    image: '/icons/pages/cerfaos.png',
    fallback: '❤️',
  },

  target: {
    image: '/icons/pages/cerfaos.png',
    fallback: '🎯',
  },
}

/**
 * Récupère la configuration d'icône pour une page
 */
export function getPageIcon(pageKey: string): PageIconConfig {
  return pageIcons[pageKey] || { fallback: '📄' }
}
