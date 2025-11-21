import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ManualSessionConfig {
  type: string
  duration?: number
}

export type ManualSchedule = Record<number, ManualSessionConfig[]>

export interface SavedWeekPlan {
  goal: string
  weeklyHours: number
  selectedDays: number[]
  activityType: string
  manualSchedule: ManualSchedule
}

export interface SavedTrainingPlan {
  id: number
  name: string
  goal: string
  weeklyHours: number
  mainActivityType: string
  preferredDays: number[]
  isActive: boolean
  startDate: string
  endDate: string
  createdAt: string
}

export interface LoadedTrainingPlan extends SavedTrainingPlan {
  plan: WeeklyPlanData[]
}

export interface WeeklyPlanData {
  weekNumber: number
  startDate: string
  endDate: string
  totalLoad: number
  sessions: PlannedSessionData[]
  focus: string
  notes: string
}

export interface PlannedSessionData {
  day: string
  dayOfWeek: number
  type: string
  intensity: 'recovery' | 'easy' | 'moderate' | 'hard' | 'very_hard'
  duration: number
  distance?: number
  description: string
  targetHRZone?: number
  estimatedTrimp: number
}

interface TrainingPlanStore {
  savedWeek: SavedWeekPlan | null
  currentPlanId: number | null
  savedPlans: SavedTrainingPlan[]
  saveWeek: (plan: SavedWeekPlan) => void
  clearWeek: () => void
  setCurrentPlanId: (id: number | null) => void
  setSavedPlans: (plans: SavedTrainingPlan[]) => void
}

export const useTrainingPlanStore = create<TrainingPlanStore>()(
  persist(
    (set) => ({
      savedWeek: null,
      currentPlanId: null,
      savedPlans: [],
      saveWeek: (plan) => set({ savedWeek: plan }),
      clearWeek: () => set({ savedWeek: null }),
      setCurrentPlanId: (id) => set({ currentPlanId: id }),
      setSavedPlans: (plans) => set({ savedPlans: plans }),
    }),
    {
      name: 'training-plan-week',
    }
  )
)
