import type { HttpContext } from '@adonisjs/core/http'
import AnalyticsService from '#services/analytics_service'

export default class AnalyticsController {
  /**
   * Trouver des activités similaires
   */
  async similarActivities({ params, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const activityId = parseInt(params.id)

    try {
      const similar = await AnalyticsService.findSimilarActivities(activityId, userId, 5)

      return response.ok({
        data: similar.map((s) => ({
          id: s.activity.id,
          type: s.activity.type,
          date: s.activity.date,
          distance: s.activity.distance,
          duration: s.activity.duration,
          avgSpeed: s.activity.avgSpeed,
          avgHeartRate: s.activity.avgHeartRate,
          trimp: s.activity.trimp,
          similarityScore: Math.round(s.similarityScore),
          comparison: {
            distanceDiff: Math.round(s.comparison.distanceDiff),
            durationDiff: Math.round(s.comparison.durationDiff),
            speedDiff: Math.round(s.comparison.speedDiff * 10) / 10,
            hrDiff: Math.round(s.comparison.hrDiff),
            elevationDiff: Math.round(s.comparison.elevationDiff),
            trimpDiff: Math.round(s.comparison.trimpDiff),
          },
        })),
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Prédire la performance pour une distance donnée
   */
  async predictPerformance({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const { activityType, targetDistance } = request.only(['activityType', 'targetDistance'])

    if (!activityType || !targetDistance) {
      return response.badRequest({ message: 'Type d\'activité et distance cible requis' })
    }

    try {
      const prediction = await AnalyticsService.predictPerformance(
        userId,
        activityType,
        targetDistance * 1000 // Convertir km en mètres
      )

      return response.ok({
        data: {
          ...prediction,
          predictedTimeFormatted: this.formatDuration(prediction.predictedTime),
        },
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Analyser la fatigue et les risques
   */
  async fatigueAnalysis({ auth, response }: HttpContext) {
    const userId = auth.user!.id

    try {
      const analysis = await AnalyticsService.analyzeFatigue(userId)

      return response.ok({
        data: analysis,
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min ${secs.toString().padStart(2, '0')}s`
    }
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`
  }
}
