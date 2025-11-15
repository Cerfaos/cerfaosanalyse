import { DateTime } from 'luxon'
import type Activity from '#models/activity'
import type { TrainingLoadData, TrainingLoadStatus } from '#types/training'

export default class TrainingLoadService {
  /**
   * Calculer le TRIMP (Training Impulse)
   * Basé sur la durée et l'intensité relative par rapport à la FC de réserve
   */
  calculateTrimp(
    duration: number,
    avgHeartRate: number,
    fcMax: number,
    fcRepos: number
  ): number {
    const fcReserve = fcMax - fcRepos

    // Calculer le % de FC de réserve
    const hrr = ((avgHeartRate - fcRepos) / fcReserve) * 100

    // Déterminer la zone et son coefficient
    let zoneCoefficient = 1
    if (hrr >= 90) zoneCoefficient = 5
    else if (hrr >= 80) zoneCoefficient = 4
    else if (hrr >= 70) zoneCoefficient = 3
    else if (hrr >= 60) zoneCoefficient = 2
    else zoneCoefficient = 1

    // TRIMP = durée (min) x coefficient de zone
    const durationMinutes = duration / 60
    return Math.round(durationMinutes * zoneCoefficient)
  }

  /**
   * Calculer CTL/ATL/TSB (Forme/Fatigue/Fraîcheur)
   *
   * CTL (Chronic Training Load) = Forme - Moyenne mobile exponentielle sur 42 jours
   * ATL (Acute Training Load) = Fatigue - Moyenne mobile exponentielle sur 7 jours
   * TSB (Training Stress Balance) = Forme du jour = CTL - ATL
   */
  calculateTrainingLoad(
    activities: Activity[],
    days: number
  ): { history: TrainingLoadData[]; current: TrainingLoadStatus } {
    // Constantes pour les moyennes mobiles exponentielles
    const CTL_DAYS = 42 // Chronic Training Load (forme)
    const ATL_DAYS = 7 // Acute Training Load (fatigue)

    // Facteurs de lissage pour EMA
    const ctlAlpha = 2 / (CTL_DAYS + 1)
    const atlAlpha = 2 / (ATL_DAYS + 1)

    // Initialiser les valeurs
    let ctl = 0
    let atl = 0
    const data: TrainingLoadData[] = []

    // Créer un tableau de tous les jours dans la période
    const allDays: Map<string, number> = new Map()
    for (let i = 0; i < days; i++) {
      const date = DateTime.now()
        .minus({ days: days - i - 1 })
        .toSQLDate()!
      allDays.set(date, 0) // TRIMP = 0 par défaut (jour de repos)
    }

    // Remplir avec les TRIMP réels des activités
    activities.forEach((activity) => {
      const dateStr = activity.date.toSQLDate()!
      const existingTrimp = allDays.get(dateStr) || 0
      allDays.set(dateStr, existingTrimp + (activity.trimp || 0))
    })

    // Calculer CTL/ATL/TSB pour chaque jour
    allDays.forEach((trimp, date) => {
      // Calcul EMA (Exponential Moving Average)
      if (data.length === 0) {
        // Premier jour : initialiser avec le TRIMP du jour
        ctl = trimp
        atl = trimp
      } else {
        // Jours suivants : appliquer la formule EMA
        ctl = trimp * ctlAlpha + ctl * (1 - ctlAlpha)
        atl = trimp * atlAlpha + atl * (1 - atlAlpha)
      }

      const tsb = ctl - atl

      data.push({
        date,
        trimp,
        ctl: Math.round(ctl * 10) / 10,
        atl: Math.round(atl * 10) / 10,
        tsb: Math.round(tsb * 10) / 10,
      })
    })

    // Récupérer les valeurs actuelles (dernier jour)
    const current = data[data.length - 1] || { ctl: 0, atl: 0, tsb: 0 }

    // Déterminer le statut basé sur TSB
    let status = 'neutral'
    let recommendation = 'Continuez votre entraînement normalement'

    if (current.tsb > 25) {
      status = 'fresh'
      recommendation =
        'Vous êtes très frais ! Bon moment pour une compétition ou un entraînement intense.'
    } else if (current.tsb > 5) {
      status = 'rested'
      recommendation = 'Vous êtes bien reposé. Bon équilibre forme/fatigue.'
    } else if (current.tsb > -10) {
      status = 'optimal'
      recommendation = 'Zone optimale pour progresser. Continuez ainsi !'
    } else if (current.tsb > -30) {
      status = 'tired'
      recommendation = 'Vous accumulez de la fatigue. Pensez à intégrer plus de récupération.'
    } else {
      status = 'overreached'
      recommendation = 'Attention au surentraînement ! Prenez du repos.'
    }

    return {
      history: data,
      current: {
        ctl: current.ctl,
        atl: current.atl,
        tsb: current.tsb,
        status,
        recommendation,
      },
    }
  }
}
