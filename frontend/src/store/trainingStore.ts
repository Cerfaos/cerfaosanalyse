import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { templatesApi, sessionsApi, planningApi, profileApi } from '../services/trainingApi'
import type { UpdateTrainingProfileData } from '../services/trainingApi'
import type {
  TrainingTemplate,
  TrainingSession,
  PlannedSession,
  PlanningByDate,
  WeekStats,
  CreateTemplateData,
  UpdateTemplateData,
  CreateSessionData,
  UpdateSessionData,
  CompleteSessionData,
  FtpHistoryEntry,
} from '../types/training'

// =============================================================================
// Types
// =============================================================================

interface UserTrainingProfile {
  ftp: number | null
  weight: number | null
  fcMax: number | null
  fcRepos: number | null
  ftpHistory: FtpHistoryEntry[]
}

interface TrainingState {
  // Data
  templates: TrainingTemplate[]
  sessions: TrainingSession[]
  planning: PlanningByDate
  weekStats: WeekStats | null
  profile: UserTrainingProfile

  // UI State
  loading: boolean
  error: string | null
  currentMonth: number
  currentYear: number

  // Template Actions
  fetchTemplates: (params?: { category?: string; week?: number }) => Promise<void>
  createTemplate: (data: CreateTemplateData) => Promise<TrainingTemplate>
  updateTemplate: (id: number, data: UpdateTemplateData) => Promise<TrainingTemplate>
  deleteTemplate: (id: number) => Promise<void>
  duplicateTemplate: (id: number) => Promise<TrainingTemplate>

  // Session Actions
  fetchSessions: (params?: { category?: string }) => Promise<void>
  createSession: (data: CreateSessionData) => Promise<TrainingSession>
  updateSession: (id: number, data: UpdateSessionData) => Promise<TrainingSession>
  deleteSession: (id: number) => Promise<void>

  // Planning Actions
  fetchPlanning: (month?: number, year?: number) => Promise<void>
  addToPlanning: (sessionId: number, date: string) => Promise<PlannedSession>
  removeFromPlanning: (id: number) => Promise<void>
  completeSession: (id: number, data?: CompleteSessionData) => Promise<PlannedSession>
  uncompleteSession: (id: number) => Promise<PlannedSession>
  moveSession: (id: number, newDate: string) => Promise<PlannedSession>

  // Stats Actions
  fetchWeekStats: (date?: string) => Promise<void>

  // Profile Actions
  fetchProfile: () => Promise<void>
  updateProfile: (profile: Partial<UserTrainingProfile>) => void
  updateProfileApi: (data: UpdateTrainingProfileData) => Promise<void>
  updateFtp: (ftp: number) => Promise<void>
  syncProfileFromUser: (user: {
    ftp?: number | null
    weightCurrent?: number | null
    fcMax?: number | null
    fcRepos?: number | null
  }) => void

  // UI Actions
  setCurrentMonth: (month: number, year: number) => void
  clearError: () => void
}

// =============================================================================
// Initial State
// =============================================================================

const initialProfile: UserTrainingProfile = {
  ftp: null,
  weight: null,
  fcMax: null,
  fcRepos: null,
  ftpHistory: [],
}

// =============================================================================
// Store
// =============================================================================

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      // Initial State
      templates: [],
      sessions: [],
      planning: {},
      weekStats: null,
      profile: initialProfile,
      loading: false,
      error: null,
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),

      // =========================================================================
      // Template Actions
      // =========================================================================

      fetchTemplates: async (params) => {
        set({ loading: true, error: null })
        try {
          const templates = await templatesApi.list(params)
          set({ templates, loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des templates',
            loading: false,
          })
        }
      },

      createTemplate: async (data) => {
        set({ loading: true, error: null })
        try {
          const template = await templatesApi.create(data)
          set((state) => ({
            templates: [template, ...state.templates],
            loading: false,
          }))
          return template
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la création du template',
            loading: false,
          })
          throw error
        }
      },

      updateTemplate: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const template = await templatesApi.update(id, data)
          set((state) => ({
            templates: state.templates.map((t) => (t.id === id ? template : t)),
            loading: false,
          }))
          return template
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du template',
            loading: false,
          })
          throw error
        }
      },

      deleteTemplate: async (id) => {
        set({ loading: true, error: null })
        try {
          await templatesApi.delete(id)
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
            loading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression du template',
            loading: false,
          })
          throw error
        }
      },

      duplicateTemplate: async (id) => {
        set({ loading: true, error: null })
        try {
          const template = await templatesApi.duplicate(id)
          set((state) => ({
            templates: [template, ...state.templates],
            loading: false,
          }))
          return template
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la duplication du template',
            loading: false,
          })
          throw error
        }
      },

      // =========================================================================
      // Session Actions
      // =========================================================================

      fetchSessions: async (params) => {
        set({ loading: true, error: null })
        try {
          const sessions = await sessionsApi.list(params)
          set({ sessions, loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des séances',
            loading: false,
          })
        }
      },

      createSession: async (data) => {
        set({ loading: true, error: null })
        try {
          const session = await sessionsApi.create(data)
          set((state) => ({
            sessions: [session, ...state.sessions],
            loading: false,
          }))
          return session
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la création de la séance',
            loading: false,
          })
          throw error
        }
      },

      updateSession: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const session = await sessionsApi.update(id, data)
          set((state) => ({
            sessions: state.sessions.map((s) => (s.id === id ? session : s)),
            loading: false,
          }))
          return session
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la séance',
            loading: false,
          })
          throw error
        }
      },

      deleteSession: async (id) => {
        set({ loading: true, error: null })
        try {
          await sessionsApi.delete(id)
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== id),
            loading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la séance',
            loading: false,
          })
          throw error
        }
      },

      // =========================================================================
      // Planning Actions
      // =========================================================================

      fetchPlanning: async (month, year) => {
        const m = month ?? get().currentMonth
        const y = year ?? get().currentYear
        set({ loading: true, error: null, currentMonth: m, currentYear: y })
        try {
          const response = await planningApi.getByMonth(m, y)
          set({ planning: response.planning, loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors du chargement du planning',
            loading: false,
          })
        }
      },

      addToPlanning: async (sessionId, date) => {
        set({ loading: true, error: null })
        try {
          const planned = await planningApi.add({ sessionId, date })
          set((state) => {
            const newPlanning = { ...state.planning }
            if (!newPlanning[date]) {
              newPlanning[date] = []
            }
            newPlanning[date] = [...newPlanning[date], planned]
            return { planning: newPlanning, loading: false }
          })
          return planned
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout au planning',
            loading: false,
          })
          throw error
        }
      },

      removeFromPlanning: async (id) => {
        set({ loading: true, error: null })
        try {
          await planningApi.remove(id)
          set((state) => {
            const newPlanning: PlanningByDate = {}
            for (const [date, sessions] of Object.entries(state.planning)) {
              const filtered = sessions.filter((s) => s.id !== id)
              if (filtered.length > 0) {
                newPlanning[date] = filtered
              }
            }
            return { planning: newPlanning, loading: false }
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression du planning',
            loading: false,
          })
          throw error
        }
      },

      completeSession: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const planned = await planningApi.complete(id, data)
          set((state) => {
            const newPlanning = { ...state.planning }
            for (const date of Object.keys(newPlanning)) {
              newPlanning[date] = newPlanning[date].map((s) =>
                s.id === id ? planned : s
              )
            }
            return { planning: newPlanning, loading: false }
          })
          return planned
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la complétion de la séance',
            loading: false,
          })
          throw error
        }
      },

      uncompleteSession: async (id) => {
        set({ loading: true, error: null })
        try {
          const planned = await planningApi.uncomplete(id)
          set((state) => {
            const newPlanning = { ...state.planning }
            for (const date of Object.keys(newPlanning)) {
              newPlanning[date] = newPlanning[date].map((s) =>
                s.id === id ? planned : s
              )
            }
            return { planning: newPlanning, loading: false }
          })
          return planned
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de l\'annulation de la complétion',
            loading: false,
          })
          throw error
        }
      },

      moveSession: async (id, newDate) => {
        set({ loading: true, error: null })
        try {
          const planned = await planningApi.move(id, newDate)
          set((state) => {
            const newPlanning: PlanningByDate = {}
            // Retirer de l'ancienne date
            for (const [date, sessions] of Object.entries(state.planning)) {
              const filtered = sessions.filter((s) => s.id !== id)
              if (filtered.length > 0) {
                newPlanning[date] = filtered
              }
            }
            // Ajouter à la nouvelle date
            if (!newPlanning[newDate]) {
              newPlanning[newDate] = []
            }
            newPlanning[newDate] = [...newPlanning[newDate], planned]
            return { planning: newPlanning, loading: false }
          })
          return planned
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors du déplacement de la séance',
            loading: false,
          })
          throw error
        }
      },

      // =========================================================================
      // Stats Actions
      // =========================================================================

      fetchWeekStats: async (date) => {
        set({ loading: true, error: null })
        try {
          const weekStats = await planningApi.weekStats(date)
          set({ weekStats, loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des stats',
            loading: false,
          })
        }
      },

      // =========================================================================
      // Profile Actions
      // =========================================================================

      fetchProfile: async () => {
        set({ loading: true, error: null })
        try {
          const profileData = await profileApi.get()
          set({
            profile: {
              ftp: profileData.ftp,
              weight: profileData.weight,
              fcMax: profileData.fcMax,
              fcRepos: profileData.fcRepos,
              ftpHistory: profileData.ftpHistory || [],
            },
            loading: false,
          })
        } catch (error) {
          // Si erreur (ex: non authentifié), ne pas bloquer
          set({ loading: false })
          // Silencieux
        }
      },

      updateProfile: (profile) => {
        set((state) => ({
          profile: { ...state.profile, ...profile },
        }))
      },

      updateProfileApi: async (data) => {
        set({ loading: true, error: null })
        try {
          const profileData = await profileApi.update(data)
          set({
            profile: {
              ftp: profileData.ftp,
              weight: profileData.weight,
              fcMax: profileData.fcMax,
              fcRepos: profileData.fcRepos,
              ftpHistory: profileData.ftpHistory || [],
            },
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
            loading: false,
          })
          throw error
        }
      },

      updateFtp: async (ftp) => {
        // Mise à jour optimiste locale
        set((state) => ({
          profile: {
            ...state.profile,
            ftp,
          },
        }))

        // Synchronisation avec l'API
        try {
          const profileData = await profileApi.update({ ftp })
          set({
            profile: {
              ftp: profileData.ftp,
              weight: profileData.weight,
              fcMax: profileData.fcMax,
              fcRepos: profileData.fcRepos,
              ftpHistory: profileData.ftpHistory || [],
            },
          })
        } catch (error) {
          // Silencieux
          // En cas d'erreur, on recharge le profil depuis l'API
          try {
            const profileData = await profileApi.get()
            set({
              profile: {
                ftp: profileData.ftp,
                weight: profileData.weight,
                fcMax: profileData.fcMax,
                fcRepos: profileData.fcRepos,
                ftpHistory: profileData.ftpHistory || [],
              },
            })
          } catch {
            // Ignorer si on ne peut pas recharger
          }
          throw error
        }
      },

      syncProfileFromUser: (user) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ftp: user.ftp ?? state.profile.ftp,
            weight: user.weightCurrent ?? state.profile.weight,
            fcMax: user.fcMax ?? state.profile.fcMax,
            fcRepos: user.fcRepos ?? state.profile.fcRepos,
          },
        }))
      },

      // =========================================================================
      // UI Actions
      // =========================================================================

      setCurrentMonth: (month, year) => {
        set({ currentMonth: month, currentYear: year })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'training-store',
      // Ne persister que le profil
      partialize: (state) => ({
        profile: state.profile,
        currentMonth: state.currentMonth,
        currentYear: state.currentYear,
      }),
    }
  )
)

// =============================================================================
// Selectors
// =============================================================================

/** Sélecteur pour les templates par catégorie */
export const selectTemplatesByCategory = (category: 'cycling' | 'ppg') =>
  useTrainingStore.getState().templates.filter((t) => t.category === category)

/** Sélecteur pour les templates par défaut */
export const selectDefaultTemplates = () =>
  useTrainingStore.getState().templates.filter((t) => t.isDefault)

/** Sélecteur pour les templates personnels */
export const selectUserTemplates = () =>
  useTrainingStore.getState().templates.filter((t) => !t.isDefault)

/** Sélecteur pour les séances d'une date spécifique */
export const selectSessionsByDate = (date: string) =>
  useTrainingStore.getState().planning[date] || []

/** Sélecteur pour vérifier si le profil est complet pour le training */
export const selectIsProfileComplete = () => {
  const { profile } = useTrainingStore.getState()
  return profile.ftp !== null && profile.fcMax !== null
}
