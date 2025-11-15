import { DateTime } from 'luxon'
import type Activity from '#models/activity'
import type {
  HeartRateZoneDefinition,
  ParsedGpsPoint,
  ZoneDurationResult,
  PolarizationSummary,
} from '#types/training'

export default class HeartRateZoneService {
  /**
   * Construire les zones cardiaques basées sur la méthode Karvonen
   */
  buildZones(fcMax: number, fcRepos: number): HeartRateZoneDefinition[] {
    const fcReserve = fcMax - fcRepos
    const palette = ['#0EA5E9', '#22C55E', '#FACC15', '#F97316', '#EF4444']

    return [
      {
        zone: 1,
        name: 'Z1 - Récupération',
        description: 'Échauffement et endurance très douce',
        min: Math.round(fcRepos + 0.5 * fcReserve),
        max: Math.round(fcRepos + 0.6 * fcReserve),
        color: palette[0],
      },
      {
        zone: 2,
        name: 'Z2 - Endurance',
        description: 'Endurance fondamentale, sorties longues',
        min: Math.round(fcRepos + 0.6 * fcReserve),
        max: Math.round(fcRepos + 0.7 * fcReserve),
        color: palette[1],
      },
      {
        zone: 3,
        name: 'Z3 - Tempo',
        description: 'Tempo et intensité modérée',
        min: Math.round(fcRepos + 0.7 * fcReserve),
        max: Math.round(fcRepos + 0.8 * fcReserve),
        color: palette[2],
      },
      {
        zone: 4,
        name: 'Z4 - Seuil',
        description: 'Travail au seuil lactique',
        min: Math.round(fcRepos + 0.8 * fcReserve),
        max: Math.round(fcRepos + 0.9 * fcReserve),
        color: palette[3],
      },
      {
        zone: 5,
        name: 'Z5 - VO2 max',
        description: 'Efforts très intenses',
        min: Math.round(fcRepos + 0.9 * fcReserve),
        max: fcMax,
        color: palette[4],
      },
    ]
  }

  /**
   * Résoudre l'index de zone pour une valeur donnée
   */
  resolveZoneIndex(value: number, zones: HeartRateZoneDefinition[]): number {
    if (!zones.length) {
      return 0
    }

    const exactMatch = zones.findIndex((zone) => value >= zone.min && value <= zone.max)
    if (exactMatch !== -1) {
      return exactMatch
    }

    return value < zones[0].min ? 0 : zones.length - 1
  }

  /**
   * Calculer les durées passées dans chaque zone
   */
  calculateZoneDurations(
    activity: Activity,
    zones: HeartRateZoneDefinition[]
  ): ZoneDurationResult {
    const durations = zones.map(() => 0)
    let totalSeconds = 0
    let source: 'samples' | 'average' | 'none' = 'none'

    if (activity.gpsData) {
      try {
        const points = JSON.parse(activity.gpsData) as ParsedGpsPoint[]
        const hrPoints = points.filter(
          (point) => typeof point.hr === 'number' && point.hr! > 0 && point.time
        )

        if (hrPoints.length > 1) {
          source = 'samples'
          hrPoints.sort((a, b) => {
            const at = this.parseGpsPointTime(a)?.toMillis() || 0
            const bt = this.parseGpsPointTime(b)?.toMillis() || 0
            return at - bt
          })

          for (let i = 0; i < hrPoints.length - 1; i++) {
            const currentTime = this.parseGpsPointTime(hrPoints[i])
            const nextTime = this.parseGpsPointTime(hrPoints[i + 1])

            if (!currentTime || !nextTime) {
              continue
            }

            let delta = nextTime.diff(currentTime, 'seconds').seconds
            if (!isFinite(delta) || delta <= 0) {
              continue
            }

            delta = Math.min(Math.max(delta, 1), 30)
            const zoneIndex = this.resolveZoneIndex(hrPoints[i].hr || 0, zones)
            durations[zoneIndex] += delta
            totalSeconds += delta
          }
        }
      } catch (error) {
        console.warn('Impossible de parser les données GPS pour les zones FC', {
          activityId: activity.id,
          error,
        })
      }
    }

    const activityDuration = activity.duration || 0

    if (source === 'samples' && totalSeconds > 0 && activityDuration > 0) {
      const scale = activityDuration / totalSeconds
      if (scale > 0.3 && scale < 3) {
        for (let i = 0; i < durations.length; i++) {
          durations[i] = durations[i] * scale
        }
        totalSeconds = activityDuration
      } else {
        source = 'none'
        totalSeconds = 0
        durations.fill(0)
      }
    }

    if ((source !== 'samples' || totalSeconds === 0) && activity.avgHeartRate) {
      source = 'average'
      const zoneIndex = this.resolveZoneIndex(activity.avgHeartRate, zones)

      // Distribution réaliste: la zone dominante (60%), zones adjacentes (30%), reste (10%)
      durations[zoneIndex] = activityDuration * 0.6 // 60% dans la zone dominante

      // Zones adjacentes
      if (zoneIndex > 0) {
        durations[zoneIndex - 1] = activityDuration * 0.2 // 20% zone inférieure
      }
      if (zoneIndex < zones.length - 1) {
        durations[zoneIndex + 1] = activityDuration * 0.15 // 15% zone supérieure
      }

      // Reste dispersé (5%)
      const remainingTime = activityDuration * 0.05
      for (let i = 0; i < zones.length; i++) {
        if (i !== zoneIndex && i !== zoneIndex - 1 && i !== zoneIndex + 1) {
          durations[i] = remainingTime / Math.max(1, zones.length - 3)
        }
      }

      totalSeconds = activityDuration
    }

    return { durations, totalSeconds, source }
  }

  /**
   * Calculer le résumé de polarisation (80/10/10)
   */
  buildPolarizationSummary(
    zoneBuckets: Array<{ zone: number; seconds: number }>
  ): PolarizationSummary {
    const totals = {
      low: zoneBuckets
        .filter((zone) => zone.zone === 1 || zone.zone === 2)
        .reduce((sum, zone) => sum + zone.seconds, 0),
      moderate: zoneBuckets
        .filter((zone) => zone.zone === 3)
        .reduce((sum, zone) => sum + zone.seconds, 0),
      high: zoneBuckets
        .filter((zone) => zone.zone === 4 || zone.zone === 5)
        .reduce((sum, zone) => sum + zone.seconds, 0),
    }

    const totalSeconds = totals.low + totals.moderate + totals.high
    const toPercent = (value: number) => (totalSeconds > 0 ? (value / totalSeconds) * 100 : 0)
    const percentages = {
      low: toPercent(totals.low),
      moderate: toPercent(totals.moderate),
      high: toPercent(totals.high),
    }

    const target = { low: 80, moderate: 10, high: 10 }
    const deviation =
      Math.abs(percentages.low - target.low) +
      Math.abs(percentages.moderate - target.moderate) +
      Math.abs(percentages.high - target.high)
    const score = Math.max(0, 100 - deviation * 0.8)

    let focus = 'équilibré'
    if (percentages.low < 70) {
      focus = 'base insuffisante'
    } else if (percentages.high < 8) {
      focus = 'intensité haute manquante'
    } else if (percentages.high > 20) {
      focus = "trop d'intensité"
    }

    let message = 'Répartition très proche du 80/10/10, continuez ainsi.'
    if (focus === 'base insuffisante') {
      message = 'Augmentez le volume en Z1/Z2 pour consolider votre base aérobie.'
    } else if (focus === 'intensité haute manquante') {
      message = 'Ajoutez des blocs en Z4/Z5 pour stimuler votre VO2 max.'
    } else if (focus === "trop d'intensité") {
      message = 'Surveillez la fatigue : la part haute est très présente.'
    }

    return {
      totals,
      percentages,
      target,
      score: Math.round(score * 10) / 10,
      focus,
      message,
    }
  }

  /**
   * Parser le timestamp d'un point GPS
   */
  private parseGpsPointTime(point: ParsedGpsPoint): DateTime | null {
    if (!point || !point.time) {
      return null
    }

    if (point.time instanceof Date) {
      return DateTime.fromJSDate(point.time)
    }

    if (typeof point.time === 'number') {
      return DateTime.fromMillis(point.time)
    }

    const parsed = DateTime.fromISO(String(point.time))
    return parsed.isValid ? parsed : null
  }
}
