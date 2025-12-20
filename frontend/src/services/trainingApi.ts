import api from './api'
import type {
  TrainingTemplate,
  CreateTemplateData,
  UpdateTemplateData,
  TrainingSession,
  CreateSessionData,
  UpdateSessionData,
  PlannedSession,
  CreatePlannedSessionData,
  CompleteSessionData,
  PlanningResponse,
  WeekStats,
  FtpHistoryEntry,
  PpgExerciseDefinition,
  PpgCategory,
  DifficultyLevel,
  TrainingProgram,
  CreateProgramData,
  ApplyProgramData,
  ProgramPreviewSession,
  ProgramObjective,
  ProgramLevel,
} from '../types/training'

// =============================================================================
// Types pour le profil d'entraînement
// =============================================================================

export interface TrainingProfile {
  ftp: number | null
  weight: number | null
  fcMax: number | null
  fcRepos: number | null
  ftpHistory: FtpHistoryEntry[]
}

export interface UpdateTrainingProfileData {
  ftp?: number | null
  weight?: number | null
  fcMax?: number | null
  fcRepos?: number | null
}

// =============================================================================
// Profile API
// =============================================================================

export const profileApi = {
  /**
   * Récupérer le profil d'entraînement
   */
  async get(): Promise<TrainingProfile> {
    const response = await api.get<ApiResponse<TrainingProfile>>(
      '/api/users/training-profile'
    )
    return response.data.data
  },

  /**
   * Mettre à jour le profil d'entraînement
   */
  async update(data: UpdateTrainingProfileData): Promise<TrainingProfile> {
    const response = await api.put<ApiResponse<TrainingProfile>>(
      '/api/users/training-profile',
      data
    )
    return response.data.data
  },
}

// =============================================================================
// Types de réponse API
// =============================================================================

interface ApiResponse<T> {
  message: string
  data: T
}

// =============================================================================
// Templates API
// =============================================================================

export const templatesApi = {
  /**
   * Lister tous les templates (défaut + utilisateur)
   */
  async list(params?: { category?: string; week?: number }): Promise<TrainingTemplate[]> {
    const response = await api.get<ApiResponse<TrainingTemplate[]>>(
      '/api/training/templates',
      { params }
    )
    return response.data.data
  },

  /**
   * Récupérer un template par ID
   */
  async get(id: number): Promise<TrainingTemplate> {
    const response = await api.get<ApiResponse<TrainingTemplate>>(
      `/api/training/templates/${id}`
    )
    return response.data.data
  },

  /**
   * Créer un template personnel
   */
  async create(data: CreateTemplateData): Promise<TrainingTemplate> {
    const response = await api.post<ApiResponse<TrainingTemplate>>(
      '/api/training/templates',
      data
    )
    return response.data.data
  },

  /**
   * Modifier un template personnel
   */
  async update(id: number, data: UpdateTemplateData): Promise<TrainingTemplate> {
    const response = await api.put<ApiResponse<TrainingTemplate>>(
      `/api/training/templates/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Supprimer un template personnel
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/templates/${id}`)
  },

  /**
   * Dupliquer un template
   */
  async duplicate(id: number): Promise<TrainingTemplate> {
    const response = await api.post<ApiResponse<TrainingTemplate>>(
      `/api/training/templates/${id}/duplicate`
    )
    return response.data.data
  },
}

// =============================================================================
// Sessions API
// =============================================================================

export const sessionsApi = {
  /**
   * Lister les séances de l'utilisateur
   */
  async list(params?: { category?: string }): Promise<TrainingSession[]> {
    const response = await api.get<ApiResponse<TrainingSession[]>>(
      '/api/training/sessions',
      { params }
    )
    return response.data.data
  },

  /**
   * Récupérer une séance par ID
   */
  async get(id: number): Promise<TrainingSession> {
    const response = await api.get<ApiResponse<TrainingSession>>(
      `/api/training/sessions/${id}`
    )
    return response.data.data
  },

  /**
   * Créer une séance
   */
  async create(data: CreateSessionData): Promise<TrainingSession> {
    const response = await api.post<ApiResponse<TrainingSession>>(
      '/api/training/sessions',
      data
    )
    return response.data.data
  },

  /**
   * Modifier une séance
   */
  async update(id: number, data: UpdateSessionData): Promise<TrainingSession> {
    const response = await api.put<ApiResponse<TrainingSession>>(
      `/api/training/sessions/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Supprimer une séance
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/sessions/${id}`)
  },
}

// =============================================================================
// Planning API
// =============================================================================

export const planningApi = {
  /**
   * Récupérer le planning par mois
   */
  async getByMonth(month: number, year: number): Promise<PlanningResponse> {
    const response = await api.get<ApiResponse<PlanningResponse>>(
      '/api/training/planning',
      { params: { month, year } }
    )
    return response.data.data
  },

  /**
   * Récupérer le planning par période
   */
  async getByRange(start: string, end: string): Promise<PlanningResponse> {
    const response = await api.get<ApiResponse<PlanningResponse>>(
      '/api/training/planning',
      { params: { start, end } }
    )
    return response.data.data
  },

  /**
   * Ajouter une séance au planning
   */
  async add(data: CreatePlannedSessionData): Promise<PlannedSession> {
    try {
      const response = await api.post<ApiResponse<PlannedSession>>(
        '/api/training/planning',
        data
      )
      return response.data.data
    } catch (error) {
      // Gérer l'erreur 409 (séance déjà planifiée)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
        if (axiosError.response?.status === 409) {
          throw new Error(axiosError.response.data?.message || 'Cette séance est déjà planifiée pour cette date')
        }
      }
      throw error
    }
  },

  /**
   * Retirer une séance du planning
   */
  async remove(id: number): Promise<void> {
    await api.delete(`/api/training/planning/${id}`)
  },

  /**
   * Marquer une séance comme complétée
   */
  async complete(id: number, data?: CompleteSessionData): Promise<PlannedSession> {
    const response = await api.post<ApiResponse<PlannedSession>>(
      `/api/training/planning/${id}/complete`,
      data || {}
    )
    return response.data.data
  },

  /**
   * Annuler la complétion d'une séance
   */
  async uncomplete(id: number): Promise<PlannedSession> {
    const response = await api.post<ApiResponse<PlannedSession>>(
      `/api/training/planning/${id}/uncomplete`
    )
    return response.data.data
  },

  /**
   * Déplacer une séance à une autre date
   */
  async move(id: number, newDate: string): Promise<PlannedSession> {
    const response = await api.post<ApiResponse<PlannedSession>>(
      `/api/training/planning/${id}/move`,
      { newDate }
    )
    return response.data.data
  },

  /**
   * Statistiques de la semaine
   */
  async weekStats(date?: string): Promise<WeekStats> {
    const response = await api.get<ApiResponse<WeekStats>>(
      '/api/training/stats/week',
      { params: date ? { date } : undefined }
    )
    return response.data.data
  },
}

// =============================================================================
// PPG Exercises API
// =============================================================================

interface PpgExercisesListResponse {
  exercises: PpgExerciseDefinition[]
  grouped: Record<PpgCategory, PpgExerciseDefinition[]>
  categories: Record<PpgCategory, string>
  difficulties: Record<DifficultyLevel, string>
  total: number
}

export const ppgExercisesApi = {
  /**
   * Lister les exercices PPG (filtrable par catégorie/difficulté/recherche)
   */
  async list(params?: {
    category?: PpgCategory
    difficulty?: DifficultyLevel
    search?: string
  }): Promise<PpgExercisesListResponse> {
    const response = await api.get<ApiResponse<PpgExercisesListResponse>>(
      '/api/training/ppg-exercises',
      { params }
    )
    return response.data.data
  },

  /**
   * Récupérer un exercice par ID
   */
  async get(id: number): Promise<PpgExerciseDefinition> {
    const response = await api.get<ApiResponse<PpgExerciseDefinition>>(
      `/api/training/ppg-exercises/${id}`
    )
    return response.data.data
  },

  /**
   * Créer un exercice personnalisé
   */
  async create(data: Partial<PpgExerciseDefinition>): Promise<PpgExerciseDefinition> {
    const response = await api.post<ApiResponse<PpgExerciseDefinition>>(
      '/api/training/ppg-exercises',
      data
    )
    return response.data.data
  },

  /**
   * Modifier un exercice personnalisé
   */
  async update(id: number, data: Partial<PpgExerciseDefinition>): Promise<PpgExerciseDefinition> {
    const response = await api.put<ApiResponse<PpgExerciseDefinition>>(
      `/api/training/ppg-exercises/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Supprimer un exercice personnalisé
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/ppg-exercises/${id}`)
  },
}

// =============================================================================
// Programs API
// =============================================================================

interface ProgramsListResponse {
  programs: TrainingProgram[]
  objectives: Record<ProgramObjective, string>
  levels: Record<ProgramLevel, string>
  weekThemes: string[]
}

interface ProgramDetailResponse extends TrainingProgram {
  enrichedSchedule: any[]
}

interface ApplyProgramResponse {
  programId: number
  programName: string
  startDate: string
  endDate: string
  sessionsCreated: number
}

interface ProgramPreviewResponse {
  program: {
    id: number
    name: string
    durationWeeks: number
  }
  startDate: string
  endDate: string
  preview: ProgramPreviewSession[]
  weekSummary: Array<{
    weekNumber: number
    theme: string
    sessionsCount: number
    totalDuration: number
    totalTss: number
  }>
  totalSessions: number
  totalDuration: number
  totalTss: number
}

export const programsApi = {
  /**
   * Lister les programmes (filtrable par objectif/niveau)
   */
  async list(params?: {
    objective?: ProgramObjective
    level?: ProgramLevel
  }): Promise<ProgramsListResponse> {
    const response = await api.get<ApiResponse<ProgramsListResponse>>(
      '/api/training/programs',
      { params }
    )
    return response.data.data
  },

  /**
   * Récupérer un programme avec détails complets
   */
  async get(id: number): Promise<ProgramDetailResponse> {
    const response = await api.get<ApiResponse<ProgramDetailResponse>>(
      `/api/training/programs/${id}`
    )
    return response.data.data
  },

  /**
   * Créer un programme
   */
  async create(data: CreateProgramData): Promise<TrainingProgram> {
    const response = await api.post<ApiResponse<TrainingProgram>>(
      '/api/training/programs',
      data
    )
    return response.data.data
  },

  /**
   * Modifier un programme
   */
  async update(id: number, data: Partial<CreateProgramData>): Promise<TrainingProgram> {
    const response = await api.put<ApiResponse<TrainingProgram>>(
      `/api/training/programs/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Supprimer un programme
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/programs/${id}`)
  },

  /**
   * Dupliquer un programme
   */
  async duplicate(id: number, name?: string): Promise<TrainingProgram> {
    const response = await api.post<ApiResponse<TrainingProgram>>(
      `/api/training/programs/${id}/duplicate`,
      { name }
    )
    return response.data.data
  },

  /**
   * Appliquer un programme au calendrier
   */
  async apply(id: number, data: ApplyProgramData): Promise<ApplyProgramResponse> {
    const response = await api.post<ApiResponse<ApplyProgramResponse>>(
      `/api/training/programs/${id}/apply`,
      data
    )
    return response.data.data
  },

  /**
   * Prévisualiser l'application d'un programme
   */
  async preview(id: number, startDate: string): Promise<ProgramPreviewResponse> {
    const response = await api.get<ApiResponse<ProgramPreviewResponse>>(
      `/api/training/programs/${id}/preview`,
      { params: { startDate } }
    )
    return response.data.data
  },
}

// =============================================================================
// Export unifié
// =============================================================================

const trainingApi = {
  templates: templatesApi,
  sessions: sessionsApi,
  planning: planningApi,
  profile: profileApi,
  ppgExercises: ppgExercisesApi,
  programs: programsApi,
}

export default trainingApi
