import Activity from '#models/activity'
import { DateTime } from 'luxon'

interface SimilarActivity {
  activity: Activity
  similarityScore: number
  comparison: {
    distanceDiff: number
    durationDiff: number
    speedDiff: number
    hrDiff: number
    elevationDiff: number
    trimpDiff: number
  }
}

interface PerformancePrediction {
  predictedTime: number
  predictedAvgSpeed: number
  predictedAvgHR: number
  predictedTrimp: number
  confidence: number
  basedOn: number
}

interface FatigueAnalysis {
  status: 'fresh' | 'normal' | 'tired' | 'overreached' | 'critical'
  riskLevel: number
  indicators: string[]
  recommendations: string[]
  ctlTrend: number
  atlTrend: number
  tsbTrend: number
}

export default class AnalyticsService {
  /**
   * Trouve des activités similaires pour comparaison
   */
  static async findSimilarActivities(
    activityId: number,
    userId: number,
    limit: number = 5
  ): Promise<SimilarActivity[]> {
    const targetActivity = await Activity.find(activityId)
    if (!targetActivity) throw new Error('Activité non trouvée')

    // Récupérer toutes les activités du même type
    const activities = await Activity.query()
      .where('userId', userId)
      .where('type', targetActivity.type)
      .whereNot('id', activityId)
      .orderBy('date', 'desc')

    const similarities: SimilarActivity[] = []

    for (const activity of activities) {
      const score = this.calculateSimilarityScore(targetActivity, activity)
      const comparison = this.calculateComparison(targetActivity, activity)

      similarities.push({
        activity,
        similarityScore: score,
        comparison,
      })
    }

    // Trier par score de similarité et prendre les plus similaires
    return similarities.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, limit)
  }

  private static calculateSimilarityScore(target: Activity, candidate: Activity): number {
    let score = 100

    // Distance (poids: 40%)
    if (target.distance && candidate.distance) {
      const distDiff = Math.abs(target.distance - candidate.distance) / target.distance
      score -= distDiff * 40
    }

    // Durée (poids: 30%)
    if (target.duration && candidate.duration) {
      const durDiff = Math.abs(target.duration - candidate.duration) / target.duration
      score -= durDiff * 30
    }

    // Dénivelé (poids: 20%)
    if (target.elevationGain && candidate.elevationGain) {
      const elevDiff = Math.abs(target.elevationGain - candidate.elevationGain) / target.elevationGain
      score -= elevDiff * 20
    }

    // Sous-type d'activité (poids: 10%)
    if (target.subSport !== candidate.subSport) {
      score -= 10
    }

    return Math.max(0, score)
  }

  private static calculateComparison(
    target: Activity,
    candidate: Activity
  ): SimilarActivity['comparison'] {
    return {
      distanceDiff: candidate.distance && target.distance ? candidate.distance - target.distance : 0,
      durationDiff: candidate.duration && target.duration ? candidate.duration - target.duration : 0,
      speedDiff: candidate.avgSpeed && target.avgSpeed ? candidate.avgSpeed - target.avgSpeed : 0,
      hrDiff:
        candidate.avgHeartRate && target.avgHeartRate
          ? candidate.avgHeartRate - target.avgHeartRate
          : 0,
      elevationDiff:
        candidate.elevationGain && target.elevationGain
          ? candidate.elevationGain - target.elevationGain
          : 0,
      trimpDiff: candidate.trimp && target.trimp ? candidate.trimp - target.trimp : 0,
    }
  }

  /**
   * Prédit la performance pour une distance/durée donnée
   */
  static async predictPerformance(
    userId: number,
    activityType: string,
    targetDistance: number
  ): Promise<PerformancePrediction> {
    // Récupérer les activités similaires en distance
    const activities = await Activity.query()
      .where('userId', userId)
      .where('type', activityType)
      .whereNotNull('distance')
      .whereNotNull('duration')
      .orderBy('date', 'desc')
      .limit(50)

    if (activities.length < 3) {
      throw new Error('Pas assez de données pour une prédiction fiable')
    }

    // Filtrer les activités proches de la distance cible (±30%)
    const relevantActivities = activities.filter((a) => {
      if (!a.distance) return false
      const ratio = a.distance / targetDistance
      return ratio >= 0.7 && ratio <= 1.3
    })

    if (relevantActivities.length < 2) {
      // Utiliser toutes les activités et extrapoler
      return this.extrapolatePerformance(activities, targetDistance)
    }

    // Calculer les moyennes pondérées (plus récent = plus de poids)
    let totalWeight = 0
    let weightedTime = 0
    let weightedSpeed = 0
    let weightedHR = 0
    let weightedTrimp = 0

    relevantActivities.forEach((activity, index) => {
      const weight = 1 / (index + 1) // Plus récent = plus de poids
      const scaleFactor = targetDistance / (activity.distance || targetDistance)

      totalWeight += weight
      weightedTime += (activity.duration || 0) * scaleFactor * weight
      weightedSpeed += (activity.avgSpeed || 0) * weight
      weightedHR += (activity.avgHeartRate || 0) * weight
      weightedTrimp += (activity.trimp || 0) * scaleFactor * weight
    })

    const confidence = Math.min(95, 50 + relevantActivities.length * 5)

    return {
      predictedTime: Math.round(weightedTime / totalWeight),
      predictedAvgSpeed: Math.round((weightedSpeed / totalWeight) * 10) / 10,
      predictedAvgHR: Math.round(weightedHR / totalWeight),
      predictedTrimp: Math.round(weightedTrimp / totalWeight),
      confidence,
      basedOn: relevantActivities.length,
    }
  }

  private static extrapolatePerformance(
    activities: Activity[],
    targetDistance: number
  ): PerformancePrediction {
    // Régression linéaire simple distance -> temps
    const points = activities
      .filter((a) => a.distance && a.duration)
      .map((a) => ({ x: a.distance!, y: a.duration! }))

    if (points.length < 3) {
      throw new Error('Pas assez de données')
    }

    const n = points.length
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const predictedTime = Math.round(slope * targetDistance + intercept)
    const predictedSpeed = (targetDistance / 1000 / (predictedTime / 3600)) // km/h

    // Moyennes pour HR et TRIMP
    const avgHR =
      activities.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) /
      activities.filter((a) => a.avgHeartRate).length
    const avgTrimpPerHour =
      activities.reduce((sum, a) => sum + (a.trimp || 0), 0) /
      activities.reduce((sum, a) => sum + (a.duration || 0) / 3600, 0)

    return {
      predictedTime,
      predictedAvgSpeed: Math.round(predictedSpeed * 10) / 10,
      predictedAvgHR: Math.round(avgHR),
      predictedTrimp: Math.round(avgTrimpPerHour * (predictedTime / 3600)),
      confidence: 60,
      basedOn: activities.length,
    }
  }

  /**
   * Analyse la fatigue et les risques de surentraînement
   */
  static async analyzeFatigue(userId: number): Promise<FatigueAnalysis> {
    const now = DateTime.now()
    const thirtyDaysAgo = now.minus({ days: 30 })
    const sevenDaysAgo = now.minus({ days: 7 })

    const recentActivities = await Activity.query()
      .where('userId', userId)
      .where('date', '>=', thirtyDaysAgo.toISO())
      .orderBy('date', 'desc')

    const indicators: string[] = []
    const recommendations: string[] = []
    let riskLevel = 0

    // Analyser la fréquence
    const last7Days = recentActivities.filter((a) =>
      DateTime.fromISO(a.date.toString()) >= sevenDaysAgo
    )
    const avgActivitiesPerWeek = (recentActivities.length / 30) * 7

    if (last7Days.length > avgActivitiesPerWeek * 1.5) {
      indicators.push('Augmentation significative du volume')
      riskLevel += 20
    }

    // Analyser l'intensité
    const avgTrimp7Days =
      last7Days.reduce((sum, a) => sum + (a.trimp || 0), 0) / Math.max(last7Days.length, 1)
    const avgTrimp30Days =
      recentActivities.reduce((sum, a) => sum + (a.trimp || 0), 0) /
      Math.max(recentActivities.length, 1)

    if (avgTrimp7Days > avgTrimp30Days * 1.3) {
      indicators.push('Intensité moyenne en hausse')
      riskLevel += 15
    }

    // Analyser la récupération
    const lastActivity = recentActivities[0]
    if (lastActivity) {
      const daysSinceLastActivity = now.diff(DateTime.fromISO(lastActivity.date.toString()), 'days')
        .days

      if (daysSinceLastActivity < 1 && last7Days.length > 5) {
        indicators.push('Pas de jour de repos récent')
        riskLevel += 25
      }
    }

    // Analyser la progression du TRIMP
    const trimpTrend = this.calculateTrend(recentActivities.map((a) => a.trimp || 0))
    if (trimpTrend > 0.2) {
      indicators.push('Charge en augmentation rapide')
      riskLevel += 15
    }

    // Vérifier les signes de performance déclinante
    const speedTrend = this.calculateTrend(recentActivities.map((a) => a.avgSpeed || 0))
    const hrTrend = this.calculateTrend(recentActivities.map((a) => a.avgHeartRate || 0))

    if (speedTrend < -0.1 && hrTrend > 0.1) {
      indicators.push('Performance en baisse malgré effort accru')
      riskLevel += 30
    }

    // Déterminer le statut
    let status: FatigueAnalysis['status']
    if (riskLevel >= 80) {
      status = 'critical'
      recommendations.push('Repos complet recommandé pendant 3-5 jours')
      recommendations.push("Consultez un professionnel de santé si fatigue persistante")
    } else if (riskLevel >= 60) {
      status = 'overreached'
      recommendations.push("Réduisez l'intensité de 30-40%")
      recommendations.push('Augmentez les jours de repos')
    } else if (riskLevel >= 40) {
      status = 'tired'
      recommendations.push('Planifiez une semaine de récupération')
      recommendations.push("Privilégiez les activités à faible intensité")
    } else if (riskLevel >= 20) {
      status = 'normal'
      recommendations.push('Maintenez votre rythme actuel')
      recommendations.push('Surveillez les signes de fatigue')
    } else {
      status = 'fresh'
      recommendations.push("Vous pouvez augmenter progressivement l'intensité")
      recommendations.push('Bon moment pour des sessions de qualité')
    }

    return {
      status,
      riskLevel: Math.min(100, riskLevel),
      indicators,
      recommendations,
      ctlTrend: trimpTrend,
      atlTrend: this.calculateTrend(last7Days.map((a) => a.trimp || 0)),
      tsbTrend: speedTrend - hrTrend,
    }
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0

    const n = values.length
    const indices = values.map((_, i) => i)
    const sumX = indices.reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0)
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const avgY = sumY / n

    // Normaliser le slope par la moyenne
    return avgY !== 0 ? slope / avgY : 0
  }
}
