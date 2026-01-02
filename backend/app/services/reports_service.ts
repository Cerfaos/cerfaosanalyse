import { DateTime } from 'luxon'
import Activity from '#models/activity'
import User from '#models/user'
import PersonalRecord from '#models/personal_record'
import HeartRateZoneService from '#services/heart_rate_zone_service'
import TrainingLoadService from '#services/training_load_service'
import PersonalRecordService from '#services/personal_record_service'
import type {
  HeartRateZoneDefinition,
  PolarizationSummary,
  TrainingLoadData,
} from '#types/training'

export interface ReportPeriod {
  type: 'monthly' | 'annual'
  startDate: string
  endDate: string
  label: string
}

export interface ReportSummary {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalElevation: number
  totalCalories: number
  totalTrimp: number
  averageHeartRate: number | null
  averageSpeed: number | null
  indoor: {
    activities: number
    distance: number
    duration: number
    elevation: number
    trimp: number
  }
  outdoor: {
    activities: number
    distance: number
    duration: number
    elevation: number
    trimp: number
  }
}

export interface ReportZoneDistribution {
  zone: number
  name: string
  description: string
  min: number
  max: number
  color: string
  seconds: number
  hours: number
  percentage: number
}

export interface ReportTrainingLoad {
  startCtl: number
  endCtl: number
  ctlChange: number
  startAtl: number
  endAtl: number
  atlChange: number
  history: TrainingLoadData[]
}

export interface ReportActivity {
  id: number
  date: string
  type: string
  subSport: string | null
  distance: number
  duration: number
  trimp: number | null
  elevationGain: number | null
  avgHeartRate: number | null
  avgSpeed: number | null
}

export interface ReportTopActivities {
  byDistance: ReportActivity[]
  byDuration: ReportActivity[]
  byTrimp: ReportActivity[]
  byElevation: ReportActivity[]
}

export interface ReportRecord {
  id: number
  recordType: string
  recordTypeName: string
  activityType: string
  value: number
  unit: string
  achievedAt: string
  previousValue: number | null
  improvement: number | null
}

export interface ReportRecords {
  new: ReportRecord[]
  improved: ReportRecord[]
}

export interface ReportTypeSummary {
  type: string
  count: number
  distance: number
  duration: number
  trimp: number
  indoor: number
  outdoor: number
}

export interface MonthlyBreakdown {
  month: number
  monthName: string
  activities: number
  distance: number
  duration: number
  elevation: number
  trimp: number
  avgSpeed: number | null
  avgHeartRate: number | null
}

export interface ReportData {
  period: ReportPeriod
  summary: ReportSummary
  heartRateZones: HeartRateZoneDefinition[]
  zoneDistribution: ReportZoneDistribution[]
  polarization: PolarizationSummary
  trainingLoad: ReportTrainingLoad
  topActivities: ReportTopActivities
  records: ReportRecords
  byType: ReportTypeSummary[]
  activitiesCount: {
    indoor: number
    outdoor: number
    total: number
  }
  monthlyBreakdown?: MonthlyBreakdown[]
}

const INDOOR_SUBSPORTS = [
  'Home Trainer',
  'Virtuel',
  'Tapis de course',
  'Rameur intérieur',
  'Piscine',
]
const INDOOR_TYPES = ['Rameur', 'Musculation', 'Yoga']

export default class ReportsService {
  private heartRateZoneService: HeartRateZoneService
  private trainingLoadService: TrainingLoadService

  constructor() {
    this.heartRateZoneService = new HeartRateZoneService()
    this.trainingLoadService = new TrainingLoadService()
  }

  async generateMonthlyReport(userId: number, month: number, year: number): Promise<ReportData> {
    const startDate = DateTime.local(year, month, 1).startOf('month')
    const endDate = startDate.endOf('month')

    const label = startDate.setLocale('fr').toFormat('LLLL yyyy')

    return this.generateReport(userId, startDate, endDate, 'monthly', label)
  }

  async generateAnnualReport(userId: number, year: number): Promise<ReportData> {
    const startDate = DateTime.local(year, 1, 1).startOf('year')
    const endDate = startDate.endOf('year')

    const label = `Année ${year}`

    return this.generateReport(userId, startDate, endDate, 'annual', label)
  }

  private async generateReport(
    userId: number,
    startDate: DateTime,
    endDate: DateTime,
    type: 'monthly' | 'annual',
    label: string
  ): Promise<ReportData> {
    const user = await User.findOrFail(userId)
    const fcMax = user.fcMax || 190
    const fcRepos = user.fcRepos || 60

    const activities = await Activity.query()
      .where('userId', userId)
      .where('date', '>=', startDate.toSQL()!)
      .where('date', '<=', endDate.toSQL()!)
      .orderBy('date', 'asc')

    const period: ReportPeriod = {
      type,
      startDate: startDate.toISODate()!,
      endDate: endDate.toISODate()!,
      label,
    }

    const summary = this.calculateSummary(activities)
    const heartRateZones = this.heartRateZoneService.buildZones(fcMax, fcRepos)
    const { zoneDistribution, polarization } = this.calculateZoneDistribution(
      activities,
      heartRateZones
    )
    const trainingLoad = await this.calculateTrainingLoad(userId, startDate, endDate)
    const topActivities = this.getTopActivities(activities)
    const records = await this.getRecordsInPeriod(userId, startDate, endDate)
    const byType = this.calculateByType(activities)
    const activitiesCount = this.calculateActivitiesCount(activities)

    // Calculer les stats mensuelles pour le rapport annuel
    const monthlyBreakdown = type === 'annual'
      ? this.calculateMonthlyBreakdown(activities, startDate.year)
      : undefined

    return {
      period,
      summary,
      heartRateZones,
      zoneDistribution,
      polarization,
      trainingLoad,
      topActivities,
      records,
      byType,
      activitiesCount,
      monthlyBreakdown,
    }
  }

  private calculateSummary(activities: Activity[]): ReportSummary {
    let totalDistance = 0
    let totalDuration = 0
    let totalElevation = 0
    let totalCalories = 0
    let totalTrimp = 0
    let hrSum = 0
    let hrCount = 0
    let speedSum = 0
    let speedCount = 0

    const indoor = { activities: 0, distance: 0, duration: 0, elevation: 0, trimp: 0 }
    const outdoor = { activities: 0, distance: 0, duration: 0, elevation: 0, trimp: 0 }

    for (const activity of activities) {
      const dist = activity.distance || 0
      const dur = activity.duration || 0
      const elev = activity.elevationGain || 0
      const trimp = activity.trimp || 0

      totalDistance += dist
      totalDuration += dur
      totalElevation += elev
      totalCalories += activity.calories || 0
      totalTrimp += trimp

      if (activity.avgHeartRate) {
        hrSum += activity.avgHeartRate
        hrCount++
      }
      if (activity.avgSpeed) {
        speedSum += activity.avgSpeed
        speedCount++
      }

      if (this.isIndoorActivity(activity)) {
        indoor.activities++
        indoor.distance += dist
        indoor.duration += dur
        indoor.elevation += elev
        indoor.trimp += trimp
      } else {
        outdoor.activities++
        outdoor.distance += dist
        outdoor.duration += dur
        outdoor.elevation += elev
        outdoor.trimp += trimp
      }
    }

    return {
      totalActivities: activities.length,
      totalDistance,
      totalDuration,
      totalElevation,
      totalCalories,
      totalTrimp,
      averageHeartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
      averageSpeed: speedCount > 0 ? Math.round((speedSum / speedCount) * 10) / 10 : null,
      indoor,
      outdoor,
    }
  }

  private calculateZoneDistribution(
    activities: Activity[],
    zones: HeartRateZoneDefinition[]
  ): { zoneDistribution: ReportZoneDistribution[]; polarization: PolarizationSummary } {
    const zoneTotals = zones.map(() => 0)

    for (const activity of activities) {
      const result = this.heartRateZoneService.calculateZoneDurations(activity, zones)
      for (let i = 0; i < result.durations.length; i++) {
        zoneTotals[i] += result.durations[i]
      }
    }

    const totalSeconds = zoneTotals.reduce((sum, s) => sum + s, 0)

    const zoneDistribution: ReportZoneDistribution[] = zones.map((zone, index) => ({
      zone: zone.zone,
      name: zone.name,
      description: zone.description,
      min: zone.min,
      max: zone.max,
      color: zone.color,
      seconds: Math.round(zoneTotals[index]),
      hours: Math.round((zoneTotals[index] / 3600) * 100) / 100,
      percentage: totalSeconds > 0 ? Math.round((zoneTotals[index] / totalSeconds) * 1000) / 10 : 0,
    }))

    const zoneBuckets = zoneDistribution.map((z) => ({ zone: z.zone, seconds: z.seconds }))
    const polarization = this.heartRateZoneService.buildPolarizationSummary(zoneBuckets)

    return { zoneDistribution, polarization }
  }

  private async calculateTrainingLoad(
    userId: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<ReportTrainingLoad> {
    const daysInPeriod = Math.ceil(endDate.diff(startDate, 'days').days) + 1
    const extendedStartDate = startDate.minus({ days: 42 })

    const activities = await Activity.query()
      .where('userId', userId)
      .where('date', '>=', extendedStartDate.toSQL()!)
      .where('date', '<=', endDate.toSQL()!)
      .orderBy('date', 'asc')

    const totalDays = Math.ceil(endDate.diff(extendedStartDate, 'days').days) + 1
    const result = this.trainingLoadService.calculateTrainingLoad(activities, totalDays)

    const startIndex = 42
    const periodHistory = result.history.slice(startIndex, startIndex + daysInPeriod)

    const firstDay = periodHistory[0] || { ctl: 0, atl: 0 }
    const lastDay = periodHistory[periodHistory.length - 1] || { ctl: 0, atl: 0 }

    return {
      startCtl: firstDay.ctl,
      endCtl: lastDay.ctl,
      ctlChange: Math.round((lastDay.ctl - firstDay.ctl) * 10) / 10,
      startAtl: firstDay.atl,
      endAtl: lastDay.atl,
      atlChange: Math.round((lastDay.atl - firstDay.atl) * 10) / 10,
      history: periodHistory,
    }
  }

  private getTopActivities(activities: Activity[]): ReportTopActivities {
    const mapActivity = (a: Activity): ReportActivity => ({
      id: a.id,
      date: a.date.toISODate()!,
      type: a.type,
      subSport: a.subSport,
      distance: a.distance || 0,
      duration: a.duration || 0,
      trimp: a.trimp,
      elevationGain: a.elevationGain,
      avgHeartRate: a.avgHeartRate,
      avgSpeed: a.avgSpeed,
    })

    const byDistance = [...activities]
      .filter((a) => a.distance && a.distance > 0)
      .sort((a, b) => (b.distance || 0) - (a.distance || 0))
      .slice(0, 5)
      .map(mapActivity)

    const byDuration = [...activities]
      .filter((a) => a.duration && a.duration > 0)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5)
      .map(mapActivity)

    const byTrimp = [...activities]
      .filter((a) => a.trimp && a.trimp > 0)
      .sort((a, b) => (b.trimp || 0) - (a.trimp || 0))
      .slice(0, 5)
      .map(mapActivity)

    const byElevation = [...activities]
      .filter((a) => a.elevationGain && a.elevationGain > 0)
      .sort((a, b) => (b.elevationGain || 0) - (a.elevationGain || 0))
      .slice(0, 5)
      .map(mapActivity)

    return { byDistance, byDuration, byTrimp, byElevation }
  }

  private async getRecordsInPeriod(
    userId: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<ReportRecords> {
    // Types de records les plus pertinents (exclure FC moyenne max et calories)
    const relevantRecordTypes = [
      'max_distance',
      'max_avg_speed',
      'max_speed',
      'max_trimp',
      'max_elevation',
      'longest_duration',
    ]

    const records = await PersonalRecord.query()
      .where('userId', userId)
      .where('achievedAt', '>=', startDate.toSQL()!)
      .where('achievedAt', '<=', endDate.toSQL()!)
      .whereIn('recordType', relevantRecordTypes)
      .orderBy('achievedAt', 'desc')

    const newRecords: ReportRecord[] = []
    const improvedRecords: ReportRecord[] = []

    for (const record of records) {
      const improvement =
        record.previousValue !== null
          ? Math.round(((record.value - record.previousValue) / record.previousValue) * 1000) / 10
          : null

      // Filtrer les améliorations mineures (< 2%)
      if (improvement !== null && improvement < 2) {
        continue
      }

      const reportRecord: ReportRecord = {
        id: record.id,
        recordType: record.recordType,
        recordTypeName: PersonalRecordService.formatRecordTypeName(record.recordType),
        activityType: record.activityType,
        value: record.value,
        unit: record.unit,
        achievedAt: record.achievedAt.toISODate()!,
        previousValue: record.previousValue,
        improvement,
      }

      if (record.previousValue === null) {
        newRecords.push(reportRecord)
      } else {
        improvedRecords.push(reportRecord)
      }
    }

    // Trier les records améliorés par % d'amélioration (les plus significatifs en premier)
    improvedRecords.sort((a, b) => (b.improvement || 0) - (a.improvement || 0))

    // Limiter à 4 nouveaux records et 4 records améliorés
    return {
      new: newRecords.slice(0, 4),
      improved: improvedRecords.slice(0, 4),
    }
  }

  private calculateByType(activities: Activity[]): ReportTypeSummary[] {
    const typeMap = new Map<string, ReportTypeSummary>()

    for (const activity of activities) {
      const type = activity.type
      const isIndoor = this.isIndoorActivity(activity)

      if (!typeMap.has(type)) {
        typeMap.set(type, {
          type,
          count: 0,
          distance: 0,
          duration: 0,
          trimp: 0,
          indoor: 0,
          outdoor: 0,
        })
      }

      const summary = typeMap.get(type)!
      summary.count++
      summary.distance += activity.distance || 0
      summary.duration += activity.duration || 0
      summary.trimp += activity.trimp || 0
      if (isIndoor) {
        summary.indoor++
      } else {
        summary.outdoor++
      }
    }

    return Array.from(typeMap.values()).sort((a, b) => b.count - a.count)
  }

  private calculateActivitiesCount(activities: Activity[]): {
    indoor: number
    outdoor: number
    total: number
  } {
    let indoor = 0
    let outdoor = 0

    for (const activity of activities) {
      if (this.isIndoorActivity(activity)) {
        indoor++
      } else {
        outdoor++
      }
    }

    return { indoor, outdoor, total: activities.length }
  }

  private isIndoorActivity(activity: Activity): boolean {
    if (activity.subSport && INDOOR_SUBSPORTS.includes(activity.subSport)) {
      return true
    }
    if (INDOOR_TYPES.includes(activity.type)) {
      return true
    }
    if (activity.type === 'Marche' && !activity.gpsData) {
      return true
    }
    return false
  }

  private calculateMonthlyBreakdown(activities: Activity[], _year: number): MonthlyBreakdown[] {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ]

    // Initialiser les 12 mois
    const monthlyData: Map<number, {
      activities: number
      distance: number
      duration: number
      elevation: number
      trimp: number
      speedSum: number
      speedCount: number
      hrSum: number
      hrCount: number
    }> = new Map()

    for (let month = 1; month <= 12; month++) {
      monthlyData.set(month, {
        activities: 0,
        distance: 0,
        duration: 0,
        elevation: 0,
        trimp: 0,
        speedSum: 0,
        speedCount: 0,
        hrSum: 0,
        hrCount: 0,
      })
    }

    // Remplir avec les données des activités
    for (const activity of activities) {
      const month = activity.date.month
      const data = monthlyData.get(month)!

      data.activities++
      data.distance += activity.distance || 0
      data.duration += activity.duration || 0
      data.elevation += activity.elevationGain || 0
      data.trimp += activity.trimp || 0

      if (activity.avgSpeed) {
        data.speedSum += activity.avgSpeed
        data.speedCount++
      }
      if (activity.avgHeartRate) {
        data.hrSum += activity.avgHeartRate
        data.hrCount++
      }
    }

    // Convertir en tableau
    const result: MonthlyBreakdown[] = []
    for (let month = 1; month <= 12; month++) {
      const data = monthlyData.get(month)!
      result.push({
        month,
        monthName: monthNames[month - 1],
        activities: data.activities,
        distance: Math.round(data.distance),
        duration: Math.round(data.duration),
        elevation: Math.round(data.elevation),
        trimp: Math.round(data.trimp),
        avgSpeed: data.speedCount > 0 ? Math.round((data.speedSum / data.speedCount) * 10) / 10 : null,
        avgHeartRate: data.hrCount > 0 ? Math.round(data.hrSum / data.hrCount) : null,
      })
    }

    return result
  }
}
