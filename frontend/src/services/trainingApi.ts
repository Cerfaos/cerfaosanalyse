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
// Export unifié
// =============================================================================

const trainingApi = {
  templates: templatesApi,
  sessions: sessionsApi,
  planning: planningApi,
  profile: profileApi,
}

export default trainingApi
