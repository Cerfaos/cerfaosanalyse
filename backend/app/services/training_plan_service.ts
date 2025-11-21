import Activity from '#models/activity'
import { DateTime } from 'luxon'

interface WeeklyPlan {
  weekNumber: number
  startDate: string
  endDate: string
  totalLoad: number
  sessions: PlannedSession[]
  focus: string
  notes: string
}

interface PlannedSession {
  day: string
  dayOfWeek: number
  type: string
  intensity: 'recovery' | 'easy' | 'moderate' | 'hard' | 'very_hard'
  duration: number // en minutes
  distance?: number // en km
  description: string
  targetHRZone?: number
  estimatedTrimp: number
}

interface ManualSessionInput {
  type: string
  duration?: number
}

interface ManualScheduleEntry {
  dayOfWeek: number
  sessions: ManualSessionInput[]
}

interface TrainingPlanConfig {
  goal: 'maintain' | 'improve' | 'peak'
  weeklyHours: number
  preferredDays: number[] // 0=dim, 1=lun, ...
  mainActivityType: string
  customSchedule?: ManualScheduleEntry[]
}

export default class TrainingPlanService {
  /**
   * Génère un plan d'entraînement sur 4 semaines
   */
  static async generatePlan(userId: number, config?: Partial<TrainingPlanConfig>): Promise<WeeklyPlan[]> {
    const now = DateTime.now()
    const thirtyDaysAgo = now.minus({ days: 30 })

    // Récupérer l'historique récent
    const recentActivities = await Activity.query()
      .where('userId', userId)
      .where('date', '>=', thirtyDaysAgo.toISO() || thirtyDaysAgo.toJSDate().toISOString())
      .orderBy('date', 'desc')

    // Analyser les patterns
    const analysis = this.analyzeTrainingPatterns(recentActivities)

    const manualSchedule = (config?.customSchedule || [])
      .map((entry) => ({
        dayOfWeek: typeof entry.dayOfWeek === 'number' ? entry.dayOfWeek : Number(entry.dayOfWeek),
        sessions: Array.isArray(entry.sessions)
          ? entry.sessions
              .map((session) => ({
                type: typeof session.type === 'string' ? session.type.trim() : '',
                duration:
                  session.duration && Number.isFinite(Number(session.duration)) && Number(session.duration) > 0
                    ? Number(session.duration)
                    : undefined,
              }))
              .filter((session) => session.type.length > 0)
          : [],
      }))
      .filter((entry) => Number.isInteger(entry.dayOfWeek) && entry.dayOfWeek >= 0 && entry.dayOfWeek <= 6 && entry.sessions.length)

    // Configuration par défaut basée sur l'analyse
    const finalConfig: TrainingPlanConfig = {
      goal: config?.goal || 'improve',
      weeklyHours: config?.weeklyHours || analysis.avgWeeklyHours || 5,
      preferredDays: config?.preferredDays || analysis.preferredDays,
      mainActivityType: config?.mainActivityType || analysis.mainActivityType,
      customSchedule: manualSchedule.length ? manualSchedule : undefined,
    }

    // Démarrer sur la prochaine semaine complète
    const nextWeekStart = now.plus({ weeks: 1 }).startOf('week')

    // Générer les 4 semaines suivantes
    const plans: WeeklyPlan[] = []
    for (let week = 1; week <= 4; week++) {
      const weekStart = nextWeekStart.plus({ weeks: week - 1 })
      const weekEnd = weekStart.endOf('week')

      const weekPlan = this.generateWeekPlan(week, weekStart, weekEnd, finalConfig, analysis)
      plans.push(weekPlan)
    }

    return plans
  }

  private static analyzeTrainingPatterns(activities: Activity[]) {
    // Analyser les jours préférés
    const dayCount: number[] = [0, 0, 0, 0, 0, 0, 0]
    const typeCount: Record<string, number> = {}
    let totalDuration = 0
    let totalTrimp = 0

    activities.forEach((a) => {
      const date = DateTime.fromISO(a.date.toString())
      dayCount[date.weekday % 7]++

      if (!typeCount[a.type]) typeCount[a.type] = 0
      typeCount[a.type]++

      totalDuration += a.duration || 0
      totalTrimp += a.trimp || 0
    })

    // Trouver les jours préférés (top 3-4)
    const preferredDays = dayCount
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .filter((d) => d.count > 0)
      .map((d) => d.day)

    // Trouver le type principal
    const mainActivityType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Cyclisme'

    // Calculer la charge moyenne
    const weeks = Math.max(1, 30 / 7)
    const avgWeeklyHours = totalDuration / weeks / 3600
    const avgWeeklyTrimp = totalTrimp / weeks

    return {
      preferredDays: preferredDays.length > 0 ? preferredDays : [1, 3, 5], // Défaut : Lun, Mer, Ven
      mainActivityType,
      avgWeeklyHours,
      avgWeeklyTrimp,
      activityCount: activities.length,
    }
  }

  private static generateWeekPlan(
    weekNumber: number,
    weekStart: DateTime,
    weekEnd: DateTime,
    config: TrainingPlanConfig,
    _analysis: ReturnType<typeof this.analyzeTrainingPatterns>
  ): WeeklyPlan {
    const sessions: PlannedSession[] = []

    // Déterminer le focus de la semaine (périodisation)
    let focus: string
    let loadMultiplier: number
    let notes: string

    switch (weekNumber) {
      case 1:
        focus = 'Base & Volume'
        loadMultiplier = 0.9
        notes = 'Semaine de fondation - concentrez-vous sur la régularité'
        break
      case 2:
        focus = 'Développement'
        loadMultiplier = 1.0
        notes = 'Augmentation progressive de l\'intensité'
        break
      case 3:
        focus = 'Surcharge'
        loadMultiplier = config.goal === 'peak' ? 1.15 : 1.1
        notes = 'Semaine la plus chargée - restez à l\'écoute de votre corps'
        break
      case 4:
        focus = 'Récupération'
        loadMultiplier = 0.7
        notes = 'Semaine de décharge - favorisez la récupération'
        break
      default:
        focus = 'Standard'
        loadMultiplier = 1.0
        notes = ''
    }

    const targetWeeklyMinutes = config.weeklyHours * 60 * loadMultiplier

    const manualScheduleMap = new Map<number, ManualSessionInput[]>(
      (config.customSchedule || []).map((entry) => [entry.dayOfWeek, entry.sessions])
    )

    const orderedDays = [...config.preferredDays]
    manualScheduleMap.forEach((_, day) => {
      if (!orderedDays.includes(day)) {
        orderedDays.push(day)
      }
    })

    if (!orderedDays.length) {
      orderedDays.push(1)
    }

    type SessionSlot = {
      dayOfWeek: number
      activityType: string
      manual: boolean
      presetDuration?: number
    }

    const sessionSlots: SessionSlot[] =
      orderedDays
        .map((dayOfWeek) => {
          const manualSessions = manualScheduleMap.get(dayOfWeek)
          if (manualSessions && manualSessions.length) {
            return manualSessions.map((session) => ({
              dayOfWeek,
              activityType: session.type || config.mainActivityType,
              manual: true,
              presetDuration:
                session.duration && Number.isFinite(session.duration) && session.duration > 0 ? session.duration : undefined,
            }))
          }
          return [{ dayOfWeek, activityType: config.mainActivityType, manual: false }]
        })
        .flat() || []

    if (!sessionSlots.length) {
      sessionSlots.push({ dayOfWeek: 1, activityType: config.mainActivityType, manual: false })
    }

    const sessionsCount = sessionSlots.length
    const minutesPerSession = targetWeeklyMinutes / (sessionsCount || 1)

    const profileForIndex = (slotIndex: number) => {
      if (weekNumber === 4) {
        return {
          intensity: 'easy' as PlannedSession['intensity'],
          durationMultiplier: 0.8,
          targetHRZone: 2,
          description: 'Séance de récupération active - Zone 2',
        }
      }
      if (slotIndex === 0) {
        return {
          intensity: 'moderate' as PlannedSession['intensity'],
          durationMultiplier: 1.0,
          targetHRZone: 3,
          description: 'Séance tempo - Zone 3 avec quelques intervalles',
        }
      }
      if (slotIndex === sessionsCount - 1 && sessionsCount >= 3) {
        return {
          intensity: 'easy' as PlannedSession['intensity'],
          durationMultiplier: 1.4,
          targetHRZone: 2,
          description: 'Sortie longue endurance - Zone 2',
        }
      }
      if (weekNumber === 3 && slotIndex === 1) {
        return {
          intensity: 'hard' as PlannedSession['intensity'],
          durationMultiplier: 0.9,
          targetHRZone: 4,
          description: 'Séance intensive - Intervalles Zone 4',
        }
      }
      return {
        intensity: 'easy' as PlannedSession['intensity'],
        durationMultiplier: 1.0,
        targetHRZone: 2,
        description: 'Endurance fondamentale - Zone 2',
      }
    }

    sessionSlots.forEach((slot, index) => {
      const dayOfWeek = slot.dayOfWeek
      const weekdayNumber = (dayOfWeek === 0 ? 7 : dayOfWeek) as 1 | 2 | 3 | 4 | 5 | 6 | 7
      const sessionDate = weekStart.set({ weekday: weekdayNumber })
      const dayName = sessionDate.toFormat('EEEE', { locale: 'fr' })

      const { intensity, durationMultiplier, description: baseDescription, targetHRZone } = profileForIndex(index)
      const baseDuration = slot.presetDuration ?? minutesPerSession * durationMultiplier
      const sessionDuration = Math.max(20, Math.round(baseDuration))
      const description = slot.manual ? `Séance choisie (${slot.activityType}) - ${baseDescription}` : baseDescription

      // Estimer le TRIMP basé sur l'intensité
      const trimpPerMinute: Record<string, number> = {
        recovery: 0.5,
        easy: 1.0,
        moderate: 1.5,
        hard: 2.5,
        very_hard: 3.5,
      }

      const estimatedTrimp = Math.round(sessionDuration * trimpPerMinute[intensity])

      // Estimer la distance selon le type d'activité
      let distance: number | undefined
      const activitySpeeds: Record<string, Record<string, number>> = {
        Cyclisme: { recovery: 20, easy: 25, moderate: 28, hard: 30, very_hard: 32 },
        Course: { recovery: 8, easy: 10, moderate: 11, hard: 12, very_hard: 13 },
        Marche: { recovery: 4, easy: 5, moderate: 5.5, hard: 6, very_hard: 6.5 },
        Natation: { recovery: 1.5, easy: 2, moderate: 2.3, hard: 2.6, very_hard: 2.8 },
        Rameur: { recovery: 6, easy: 8, moderate: 9, hard: 10, very_hard: 11 },
        Randonnée: { recovery: 3, easy: 4, moderate: 4.5, hard: 5, very_hard: 5.5 },
        Repos: { recovery: 0, easy: 0, moderate: 0, hard: 0, very_hard: 0 },
      }

      const activityType = slot.activityType || config.mainActivityType

      if (activitySpeeds[activityType]) {
        const speeds = activitySpeeds[activityType]
        distance = Math.round((sessionDuration / 60) * speeds[intensity] * 10) / 10
      }

      sessions.push({
        day: dayName,
        dayOfWeek,
        type: activityType,
        intensity,
        duration: sessionDuration,
        distance,
        description,
        targetHRZone,
        estimatedTrimp,
      })
    })

    // Trier par jour de la semaine
    sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek)

    const totalLoad = sessions.reduce((sum, s) => sum + s.estimatedTrimp, 0)

    return {
      weekNumber,
      startDate: weekStart.toISODate() || '',
      endDate: weekEnd.toISODate() || '',
      totalLoad,
      sessions,
      focus,
      notes,
    }
  }

  /**
   * Obtient des recommandations rapides pour la prochaine séance
   */
  static async getNextSessionRecommendation(userId: number): Promise<PlannedSession | null> {
    const now = DateTime.now()
    const sevenDaysAgo = now.minus({ days: 7 })

    const recentActivities = await Activity.query()
      .where('userId', userId)
      .where('date', '>=', sevenDaysAgo.toISO() || sevenDaysAgo.toJSDate().toISOString())
      .orderBy('date', 'desc')

    const lastActivity = recentActivities[0]
    const daysSinceLastActivity = lastActivity
      ? now.diff(DateTime.fromISO(lastActivity.date.toString()), 'days').days
      : 999

    // Calculer la charge récente
    const recentTrimp = recentActivities.reduce((sum, a) => sum + (a.trimp || 0), 0)
    const avgDailyTrimp = recentTrimp / 7

    // Recommander en fonction de la fatigue
    let intensity: PlannedSession['intensity']
    let description: string
    let duration: number
    let targetHRZone: number

    if (daysSinceLastActivity >= 3 || avgDailyTrimp < 20) {
      // Peu d'activité récente -> séance modérée pour reprendre
      intensity = 'moderate'
      duration = 60
      targetHRZone = 3
      description = 'Reprise progressive - alternez Zone 2 et Zone 3'
    } else if (avgDailyTrimp > 80) {
      // Charge élevée -> récupération
      intensity = 'recovery'
      duration = 30
      targetHRZone = 1
      description = 'Récupération active légère - Zone 1/2 uniquement'
    } else if (daysSinceLastActivity >= 2) {
      // 2 jours de repos -> prêt pour une bonne séance
      intensity = 'hard'
      duration = 75
      targetHRZone = 4
      description = 'Séance qualité - Intervalles en Zone 4'
    } else {
      // Activité récente -> endurance facile
      intensity = 'easy'
      duration = 45
      targetHRZone = 2
      description = 'Endurance fondamentale - Zone 2'
    }

    const trimpPerMinute: Record<string, number> = {
      recovery: 0.5,
      easy: 1.0,
      moderate: 1.5,
      hard: 2.5,
      very_hard: 3.5,
    }

    const mainType =
      recentActivities.length > 0
        ? recentActivities[0].type
        : 'Cyclisme'

    return {
      day: now.toFormat('EEEE', { locale: 'fr' }),
      dayOfWeek: now.weekday % 7,
      type: mainType,
      intensity,
      duration,
      description,
      targetHRZone,
      estimatedTrimp: Math.round(duration * trimpPerMinute[intensity]),
    }
  }
}
