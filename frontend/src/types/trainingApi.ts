/**
 * Types pour les réponses et données de l'API Training
 */

import type {
  PpgExerciseDefinition,
  PpgCategory,
  DifficultyLevel,
  TrainingProgram,
  ProgramObjective,
  ProgramLevel,
  ProgramPreviewSession,
  FtpHistoryEntry,
} from './training'

// =============================================================================
// Types génériques API
// =============================================================================

/** Réponse API standard */
export interface ApiResponse<T> {
  message: string
  data: T
}

// =============================================================================
// Profil d'entraînement
// =============================================================================

/** Profil d'entraînement de l'utilisateur */
export interface TrainingProfile {
  ftp: number | null
  weight: number | null
  fcMax: number | null
  fcRepos: number | null
  ftpHistory: FtpHistoryEntry[]
}

/** Données pour mise à jour du profil */
export interface UpdateTrainingProfileData {
  ftp?: number | null
  weight?: number | null
  fcMax?: number | null
  fcRepos?: number | null
}

// =============================================================================
// Réponses API Exercices PPG
// =============================================================================

/** Réponse liste d'exercices PPG */
export interface PpgExercisesListResponse {
  exercises: PpgExerciseDefinition[]
  grouped: Record<PpgCategory, PpgExerciseDefinition[]>
  categories: Record<PpgCategory, string>
  difficulties: Record<DifficultyLevel, string>
  total: number
}

// =============================================================================
// Réponses API Programmes
// =============================================================================

/** Réponse liste de programmes */
export interface ProgramsListResponse {
  programs: TrainingProgram[]
  objectives: Record<ProgramObjective, string>
  levels: Record<ProgramLevel, string>
  weekThemes: string[]
}

/** Réponse détail programme */
export interface ProgramDetailResponse extends TrainingProgram {
  enrichedSchedule: unknown[]
}

/** Réponse application programme */
export interface ApplyProgramResponse {
  programId: number
  programName: string
  startDate: string
  endDate: string
  sessionsCreated: number
}

/** Résumé semaine pour prévisualisation */
export interface ProgramWeekSummary {
  weekNumber: number
  theme: string
  sessionsCount: number
  totalDuration: number
  totalTss: number
}

/** Réponse prévisualisation programme */
export interface ProgramPreviewResponse {
  program: {
    id: number
    name: string
    durationWeeks: number
  }
  startDate: string
  endDate: string
  preview: ProgramPreviewSession[]
  weekSummary: ProgramWeekSummary[]
  totalSessions: number
  totalDuration: number
  totalTss: number
}

// =============================================================================
// Types Import MRC
// =============================================================================

/** Bloc MRC importé */
export interface MrcBlock {
  type: 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown'
  duration: string
  percentFtp: number
  reps: number
  notes?: string
}

/** Exercice MRC importé */
export interface MrcExercise {
  name: string
  duration: string
  reps: number | null
  sets: number
  rest: string
  notes?: string
}

/** En-tête fichier MRC */
export interface MrcRawHeader {
  version: number
  units: string
  description: string
  fileName: string
  format: string
}

/** Données de prévisualisation MRC */
export interface MrcPreviewData {
  name: string
  description: string
  category: 'cycling' | 'ppg'
  level: 'beginner' | 'intermediate' | 'expert'
  duration: number
  tss: number | null
  averageIntensity: number
  intensityRef: string | null
  blocks: MrcBlock[] | null
  exercises: MrcExercise[] | null
  rawHeader: MrcRawHeader
  dataPointsCount: number
}

/** Options d'import MRC */
export interface MrcImportOptions {
  name?: string
  level?: 'beginner' | 'intermediate' | 'expert'
  week?: number
  day?: number
}

/** Résultat succès import batch */
export interface MrcBatchSuccessItem {
  fileName: string
  id: number
  name: string
  type: 'template' | 'session'
}

/** Résultat erreur import batch */
export interface MrcBatchErrorItem {
  fileName: string
  error: string
}

/** Résultat import batch MRC */
export interface MrcBatchResult {
  success: MrcBatchSuccessItem[]
  errors: MrcBatchErrorItem[]
}
