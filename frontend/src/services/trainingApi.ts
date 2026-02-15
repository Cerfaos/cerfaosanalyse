/**
 * API Training - Services pour la gestion de l'entraînement
 */

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
  PpgExerciseDefinition,
  PpgCategory,
  DifficultyLevel,
  TrainingProgram,
  CreateProgramData,
  ApplyProgramData,
  ProgramObjective,
  ProgramLevel,
} from '../types/training'
import type {
  ApiResponse,
  TrainingProfile,
  UpdateTrainingProfileData,
  PpgExercisesListResponse,
  ProgramsListResponse,
  ProgramDetailResponse,
  ApplyProgramResponse,
  ProgramPreviewResponse,
  MrcPreviewData,
  MrcImportOptions,
  MrcBatchResult,
} from '../types/trainingApi'

// Re-export des types pour faciliter l'import
export type { TrainingProfile, UpdateTrainingProfileData, MrcPreviewData, MrcImportOptions, MrcBatchResult }

// =============================================================================
// Profile API
// =============================================================================

export const profileApi = {
  async get(): Promise<TrainingProfile> {
    const response = await api.get<ApiResponse<TrainingProfile>>('/api/users/training-profile')
    return response.data.data
  },

  async update(data: UpdateTrainingProfileData): Promise<TrainingProfile> {
    const response = await api.put<ApiResponse<TrainingProfile>>('/api/users/training-profile', data)
    return response.data.data
  },
}

// =============================================================================
// Templates API
// =============================================================================

export const templatesApi = {
  async list(params?: { category?: string; week?: number }): Promise<TrainingTemplate[]> {
    const response = await api.get<ApiResponse<TrainingTemplate[]>>('/api/training/templates', { params })
    return response.data.data
  },

  async get(id: number): Promise<TrainingTemplate> {
    const response = await api.get<ApiResponse<TrainingTemplate>>(`/api/training/templates/${id}`)
    return response.data.data
  },

  async create(data: CreateTemplateData): Promise<TrainingTemplate> {
    const response = await api.post<ApiResponse<TrainingTemplate>>('/api/training/templates', data)
    return response.data.data
  },

  async update(id: number, data: UpdateTemplateData): Promise<TrainingTemplate> {
    const response = await api.put<ApiResponse<TrainingTemplate>>(`/api/training/templates/${id}`, data)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/templates/${id}`)
  },

  async duplicate(id: number): Promise<TrainingTemplate> {
    const response = await api.post<ApiResponse<TrainingTemplate>>(`/api/training/templates/${id}/duplicate`)
    return response.data.data
  },
}

// =============================================================================
// Sessions API
// =============================================================================

export const sessionsApi = {
  async list(params?: { category?: string }): Promise<TrainingSession[]> {
    const response = await api.get<ApiResponse<TrainingSession[]>>('/api/training/sessions', { params })
    return response.data.data
  },

  async get(id: number): Promise<TrainingSession> {
    const response = await api.get<ApiResponse<TrainingSession>>(`/api/training/sessions/${id}`)
    return response.data.data
  },

  async create(data: CreateSessionData): Promise<TrainingSession> {
    const response = await api.post<ApiResponse<TrainingSession>>('/api/training/sessions', data)
    return response.data.data
  },

  async update(id: number, data: UpdateSessionData): Promise<TrainingSession> {
    const response = await api.put<ApiResponse<TrainingSession>>(`/api/training/sessions/${id}`, data)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/sessions/${id}`)
  },
}

// =============================================================================
// Planning API
// =============================================================================

export const planningApi = {
  async getByMonth(month: number, year: number): Promise<PlanningResponse> {
    const response = await api.get<ApiResponse<PlanningResponse>>('/api/training/planning', { params: { month, year } })
    return response.data.data
  },

  async getByRange(start: string, end: string): Promise<PlanningResponse> {
    const response = await api.get<ApiResponse<PlanningResponse>>('/api/training/planning', { params: { start, end } })
    return response.data.data
  },

  async add(data: CreatePlannedSessionData): Promise<PlannedSession> {
    try {
      const response = await api.post<ApiResponse<PlannedSession>>('/api/training/planning', data)
      return response.data.data
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
        if (axiosError.response?.status === 409) {
          throw new Error(axiosError.response.data?.message || 'Cette séance est déjà planifiée pour cette date')
        }
      }
      throw error
    }
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/training/planning/${id}`)
  },

  async complete(id: number, data?: CompleteSessionData): Promise<PlannedSession> {
    const response = await api.post<ApiResponse<PlannedSession>>(`/api/training/planning/${id}/complete`, data || {})
    return response.data.data
  },

  async uncomplete(id: number): Promise<PlannedSession> {
    const response = await api.post<ApiResponse<PlannedSession>>(`/api/training/planning/${id}/uncomplete`)
    return response.data.data
  },

  async move(id: number, newDate: string): Promise<PlannedSession> {
    const response = await api.post<ApiResponse<PlannedSession>>(`/api/training/planning/${id}/move`, { newDate })
    return response.data.data
  },

  async weekStats(date?: string): Promise<WeekStats> {
    const response = await api.get<ApiResponse<WeekStats>>('/api/training/stats/week', {
      params: date ? { date } : undefined,
    })
    return response.data.data
  },
}

// =============================================================================
// PPG Exercises API
// =============================================================================

export const ppgExercisesApi = {
  async list(params?: {
    category?: PpgCategory
    difficulty?: DifficultyLevel
    search?: string
  }): Promise<PpgExercisesListResponse> {
    const response = await api.get<ApiResponse<PpgExercisesListResponse>>('/api/training/ppg-exercises', { params })
    return response.data.data
  },

  async get(id: number): Promise<PpgExerciseDefinition> {
    const response = await api.get<ApiResponse<PpgExerciseDefinition>>(`/api/training/ppg-exercises/${id}`)
    return response.data.data
  },

  async create(data: Partial<PpgExerciseDefinition>): Promise<PpgExerciseDefinition> {
    const response = await api.post<ApiResponse<PpgExerciseDefinition>>('/api/training/ppg-exercises', data)
    return response.data.data
  },

  async update(id: number, data: Partial<PpgExerciseDefinition>): Promise<PpgExerciseDefinition> {
    const response = await api.put<ApiResponse<PpgExerciseDefinition>>(`/api/training/ppg-exercises/${id}`, data)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/ppg-exercises/${id}`)
  },
}

// =============================================================================
// Programs API
// =============================================================================

export const programsApi = {
  async list(params?: { objective?: ProgramObjective; level?: ProgramLevel }): Promise<ProgramsListResponse> {
    const response = await api.get<ApiResponse<ProgramsListResponse>>('/api/training/programs', { params })
    return response.data.data
  },

  async get(id: number): Promise<ProgramDetailResponse> {
    const response = await api.get<ApiResponse<ProgramDetailResponse>>(`/api/training/programs/${id}`)
    return response.data.data
  },

  async create(data: CreateProgramData): Promise<TrainingProgram> {
    const response = await api.post<ApiResponse<TrainingProgram>>('/api/training/programs', data)
    return response.data.data
  },

  async update(id: number, data: Partial<CreateProgramData>): Promise<TrainingProgram> {
    const response = await api.put<ApiResponse<TrainingProgram>>(`/api/training/programs/${id}`, data)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/training/programs/${id}`)
  },

  async duplicate(id: number, name?: string): Promise<TrainingProgram> {
    const response = await api.post<ApiResponse<TrainingProgram>>(`/api/training/programs/${id}/duplicate`, { name })
    return response.data.data
  },

  async apply(id: number, data: ApplyProgramData): Promise<ApplyProgramResponse> {
    const response = await api.post<ApiResponse<ApplyProgramResponse>>(`/api/training/programs/${id}/apply`, data)
    return response.data.data
  },

  async preview(id: number, startDate: string): Promise<ProgramPreviewResponse> {
    const response = await api.get<ApiResponse<ProgramPreviewResponse>>(`/api/training/programs/${id}/preview`, {
      params: { startDate },
    })
    return response.data.data
  },
}

// =============================================================================
// MRC Import API
// =============================================================================

const MULTIPART_CONFIG = { headers: { 'Content-Type': 'multipart/form-data' } }

export const mrcImportApi = {
  async preview(file: File): Promise<MrcPreviewData> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<MrcPreviewData>>(
      '/api/training/import-mrc/preview',
      formData,
      MULTIPART_CONFIG
    )
    return response.data.data
  },

  async importAsTemplate(file: File, options?: MrcImportOptions): Promise<TrainingTemplate> {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.name) formData.append('name', options.name)
    if (options?.level) formData.append('level', options.level)
    if (options?.week) formData.append('week', options.week.toString())
    if (options?.day) formData.append('day', options.day.toString())
    const response = await api.post<ApiResponse<TrainingTemplate>>(
      '/api/training/import-mrc/template',
      formData,
      MULTIPART_CONFIG
    )
    return response.data.data
  },

  async importAsSession(file: File, options?: MrcImportOptions): Promise<TrainingSession> {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.name) formData.append('name', options.name)
    if (options?.level) formData.append('level', options.level)
    const response = await api.post<ApiResponse<TrainingSession>>(
      '/api/training/import-mrc/session',
      formData,
      MULTIPART_CONFIG
    )
    return response.data.data
  },

  async importBatch(files: File[], importAs: 'template' | 'session' = 'template'): Promise<MrcBatchResult> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('importAs', importAs)
    const response = await api.post<ApiResponse<MrcBatchResult>>(
      '/api/training/import-mrc/batch',
      formData,
      MULTIPART_CONFIG
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
  mrcImport: mrcImportApi,
}

export default trainingApi
