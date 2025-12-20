// =============================================================================
// Types pour le module Training Planner
// =============================================================================

// -----------------------------------------------------------------------------
// Types de base (unions)
// -----------------------------------------------------------------------------

/** Type de bloc d'entraînement cycling */
export type BlockType = 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown'

/** Catégorie de séance */
export type SessionCategory = 'cycling' | 'ppg'

/** Niveau de difficulté */
export type SessionLevel = 'beginner' | 'intermediate' | 'expert'

/** Lieu de pratique */
export type SessionLocation = 'indoor' | 'outdoor' | 'both'

// -----------------------------------------------------------------------------
// Blocs et exercices
// -----------------------------------------------------------------------------

/** Bloc d'entraînement pour séance cycling */
export interface CyclingBlock {
  /** Type de bloc */
  type: BlockType
  /** Durée au format "MM:SS" */
  duration: string
  /** Intensité en % de la FTP (0-300) */
  percentFtp: number
  /** Nombre de répétitions */
  reps: number
  /** Notes additionnelles (optionnel) */
  notes?: string
}

/** Exercice pour séance PPG */
export interface PpgExercise {
  /** Nom de l'exercice */
  name: string
  /** Durée au format "MM:SS" */
  duration: string
  /** Nombre de répétitions (null si exercice en temps) */
  reps: number | null
  /** Nombre de séries */
  sets: number
  /** Temps de repos au format "MM:SS" */
  rest: string
  /** Zone cardiaque cible (ex: "115-153") (optionnel) */
  hrTarget?: string
  /** Notes additionnelles (optionnel) */
  notes?: string
}

// -----------------------------------------------------------------------------
// Templates
// -----------------------------------------------------------------------------

/** Template de séance d'entraînement */
export interface TrainingTemplate {
  id: number
  userId: number | null
  name: string
  category: SessionCategory
  level: SessionLevel
  location: SessionLocation | null
  intensityRef: string
  week: number | null
  duration: number
  tss: number | null
  description: string | null
  blocks: CyclingBlock[] | null
  exercises: PpgExercise[] | null
  isDefault: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

/** Données pour créer un template */
export interface CreateTemplateData {
  name: string
  category: SessionCategory
  level?: SessionLevel
  location?: SessionLocation
  intensityRef?: string
  week?: number
  duration: number
  tss?: number
  description?: string
  blocks?: CyclingBlock[]
  exercises?: PpgExercise[]
}

/** Données pour modifier un template */
export interface UpdateTemplateData extends Partial<CreateTemplateData> {}

// -----------------------------------------------------------------------------
// Séances
// -----------------------------------------------------------------------------

/** Séance d'entraînement utilisateur */
export interface TrainingSession {
  id: number
  userId: number
  templateId: number | null
  name: string
  category: SessionCategory
  level: SessionLevel
  location: SessionLocation | null
  intensityRef: string
  duration: number
  tss: number | null
  description: string | null
  blocks: CyclingBlock[] | null
  exercises: PpgExercise[] | null
  createdAt: string
  updatedAt: string
}

/** Données pour créer une séance */
export interface CreateSessionData {
  name: string
  category: SessionCategory
  level?: SessionLevel
  location?: SessionLocation
  intensityRef?: string
  duration: number
  tss?: number
  description?: string
  blocks?: CyclingBlock[]
  exercises?: PpgExercise[]
  templateId?: number
}

/** Données pour modifier une séance */
export interface UpdateSessionData extends Partial<CreateSessionData> {}

// -----------------------------------------------------------------------------
// Planning
// -----------------------------------------------------------------------------

/** Séance planifiée */
export interface PlannedSession {
  id: number
  userId: number
  sessionId: number
  plannedDate: string
  order: number
  completed: boolean
  completedAt: string | null
  notes: string | null
  activityId: number | null
  createdAt: string
  updatedAt: string
  /** Séance liée (preloaded) */
  session?: TrainingSession
}

/** Données pour ajouter une séance au planning */
export interface CreatePlannedSessionData {
  sessionId: number
  date: string
}

/** Données pour marquer une séance comme complétée */
export interface CompleteSessionData {
  activityId?: number
  notes?: string
}

/** Planning groupé par date */
export interface PlanningByDate {
  [date: string]: PlannedSession[]
}

/** Réponse de l'API planning */
export interface PlanningResponse {
  startDate: string
  endDate: string
  planning: PlanningByDate
}

// -----------------------------------------------------------------------------
// Statistiques
// -----------------------------------------------------------------------------

/** Statistiques par catégorie */
export interface CategoryStats {
  count: number
  duration: number
  tss: number
}

/** Statistiques de la semaine */
export interface WeekStats {
  startDate: string
  endDate: string
  sessionCount: number
  completedCount: number
  completionRate: number
  totalDuration: number
  totalTss: number
  byCategory: {
    cycling: CategoryStats
    ppg: CategoryStats
  }
}

// -----------------------------------------------------------------------------
// Profil utilisateur (training-related)
// -----------------------------------------------------------------------------

/** Entrée historique FTP */
export interface FtpHistoryEntry {
  ftp: number
  date: string
}

/** Profil utilisateur pour le training */
export interface UserTrainingProfile {
  /** Puissance au seuil fonctionnel (watts) */
  ftp: number | null
  /** Poids actuel (kg) */
  weight: number | null
  /** Fréquence cardiaque maximale (bpm) */
  fcMax: number | null
  /** Fréquence cardiaque au repos (bpm) */
  fcRepos: number | null
  /** Historique des valeurs FTP */
  ftpHistory: FtpHistoryEntry[] | null
}

// -----------------------------------------------------------------------------
// Helpers et utilitaires
// -----------------------------------------------------------------------------

/** Labels pour les types de blocs */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  warmup: 'Échauffement',
  interval: 'Intervalle',
  effort: 'Effort',
  recovery: 'Récupération',
  cooldown: 'Retour au calme',
}

/** Couleurs pour les types de blocs */
export const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
  warmup: '#22c55e',    // green-500
  interval: '#f97316',  // orange-500
  effort: '#ef4444',    // red-500
  recovery: '#3b82f6',  // blue-500
  cooldown: '#8b5cf6',  // violet-500
}

/** Labels pour les catégories */
export const CATEGORY_LABELS: Record<SessionCategory, string> = {
  cycling: 'Vélo',
  ppg: 'PPG',
}

/** Labels pour les niveaux */
export const LEVEL_LABELS: Record<SessionLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  expert: 'Expert',
}

/** Labels pour les lieux */
export const LOCATION_LABELS: Record<SessionLocation, string> = {
  indoor: 'Intérieur',
  outdoor: 'Extérieur',
  both: 'Les deux',
}

/** Icônes pour les catégories */
export const CATEGORY_ICONS: Record<SessionCategory, string> = {
  cycling: '🚴',
  ppg: '🏋️',
}

/** Icônes pour les niveaux */
export const LEVEL_ICONS: Record<SessionLevel, string> = {
  beginner: '🌱',
  intermediate: '🌿',
  expert: '🌳',
}

// -----------------------------------------------------------------------------
// Fonctions utilitaires
// -----------------------------------------------------------------------------

/**
 * Convertir une durée "MM:SS" en secondes
 */
export function durationToSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number)
  return (minutes || 0) * 60 + (seconds || 0)
}

/**
 * Convertir des secondes en durée "MM:SS"
 */
export function secondsToDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Calculer la durée totale des blocs (en minutes)
 */
export function calculateBlocksDuration(blocks: CyclingBlock[]): number {
  return blocks.reduce((total, block) => {
    const seconds = durationToSeconds(block.duration)
    return total + (seconds * block.reps) / 60
  }, 0)
}

/**
 * Calculer les watts à partir du % FTP
 */
export function percentFtpToWatts(percentFtp: number, ftp: number): number {
  return Math.round((percentFtp / 100) * ftp)
}

/**
 * Obtenir la zone d'intensité basée sur le % FTP
 */
export function getIntensityZone(percentFtp: number): string {
  if (percentFtp <= 55) return 'Z1 - Récupération'
  if (percentFtp <= 75) return 'Z2 - Endurance'
  if (percentFtp <= 90) return 'Z3 - Tempo'
  if (percentFtp <= 105) return 'Z4 - Seuil'
  if (percentFtp <= 120) return 'Z5 - VO2max'
  return 'Z6 - Anaérobie'
}

/**
 * Obtenir la couleur de la zone d'intensité
 */
export function getIntensityZoneColor(percentFtp: number): string {
  if (percentFtp <= 55) return '#94a3b8'  // gray
  if (percentFtp <= 75) return '#22c55e'  // green
  if (percentFtp <= 90) return '#eab308'  // yellow
  if (percentFtp <= 105) return '#f97316' // orange
  if (percentFtp <= 120) return '#ef4444' // red
  return '#dc2626'                         // dark red
}
