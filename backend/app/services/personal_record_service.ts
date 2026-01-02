import Activity from '#models/activity'
import PersonalRecord from '#models/personal_record'
import { DateTime } from 'luxon'

interface RecordDefinition {
  type: string
  unit: string
  getValue: (activity: Activity) => number | null
  isBetter: (newValue: number, oldValue: number) => boolean
}

interface NewRecord {
  recordType: string
  activityType: string
  value: number
  unit: string
  previousValue: number | null
  previousAchievedAt: DateTime | null
  improvement: number | null
}

export default class PersonalRecordService {
  private static recordDefinitions: RecordDefinition[] = [
    {
      type: 'max_distance',
      unit: 'km',
      getValue: (a) => (a.distance ? a.distance / 1000 : null),
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'max_avg_speed',
      unit: 'km/h',
      getValue: (a) => a.avgSpeed,
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'max_speed',
      unit: 'km/h',
      getValue: (a) => a.maxSpeed,
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'max_trimp',
      unit: 'points',
      getValue: (a) => a.trimp,
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'max_elevation',
      unit: 'm',
      getValue: (a) => a.elevationGain,
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'longest_duration',
      unit: 'min',
      getValue: (a) => (a.duration ? a.duration / 60 : null),
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'max_avg_heart_rate',
      unit: 'bpm',
      getValue: (a) => a.avgHeartRate,
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
    {
      type: 'max_calories',
      unit: 'kcal',
      getValue: (a) => a.calories,
      isBetter: (newVal, oldVal) => newVal > oldVal,
    },
  ]

  /**
   * Vérifie si une activité bat des records personnels
   * @returns Liste des nouveaux records établis
   */
  static async checkForNewRecords(activity: Activity): Promise<NewRecord[]> {
    const newRecords: NewRecord[] = []

    for (const definition of this.recordDefinitions) {
      const value = definition.getValue(activity)

      // Skip si pas de valeur pour ce type
      if (value === null || value === undefined || value <= 0) {
        continue
      }

      // Chercher le record actuel pour ce type et cette activité
      const currentRecord = await PersonalRecord.query()
        .where('userId', activity.userId)
        .where('recordType', definition.type)
        .where('activityType', activity.type)
        .where('isCurrent', true)
        .first()

      let isNewRecord = false
      let previousValue: number | null = null
      let previousAchievedAt: DateTime | null = null

      if (!currentRecord) {
        // Premier record de ce type
        isNewRecord = true
      } else if (definition.isBetter(value, currentRecord.value)) {
        // Nouveau record !
        isNewRecord = true
        previousValue = currentRecord.value
        previousAchievedAt = currentRecord.achievedAt

        // Marquer l'ancien comme non-current
        currentRecord.isCurrent = false
        await currentRecord.save()
      }

      if (isNewRecord) {
        // Créer le nouveau record
        await PersonalRecord.create({
          userId: activity.userId,
          activityId: activity.id,
          recordType: definition.type,
          activityType: activity.type,
          value: value,
          achievedAt: activity.date,
          previousValue: previousValue,
          previousAchievedAt: previousAchievedAt,
          isCurrent: true,
          unit: definition.unit,
        })

        const improvement =
          previousValue !== null ? ((value - previousValue) / previousValue) * 100 : null

        newRecords.push({
          recordType: definition.type,
          activityType: activity.type,
          value: value,
          unit: definition.unit,
          previousValue: previousValue,
          previousAchievedAt: previousAchievedAt,
          improvement: improvement,
        })
      }
    }

    return newRecords
  }

  /**
   * Récupère tous les records actuels d'un utilisateur
   */
  static async getCurrentRecords(userId: number) {
    const records = await PersonalRecord.query()
      .where('userId', userId)
      .where('isCurrent', true)
      .preload('activity')
      .orderBy('activityType')
      .orderBy('recordType')

    return records
  }

  /**
   * Récupère les records par type d'activité
   */
  static async getRecordsByActivityType(userId: number, activityType: string) {
    const records = await PersonalRecord.query()
      .where('userId', userId)
      .where('activityType', activityType)
      .where('isCurrent', true)
      .preload('activity')
      .orderBy('recordType')

    return records
  }

  /**
   * Récupère l'historique d'un record spécifique
   */
  static async getRecordHistory(userId: number, recordType: string, activityType: string) {
    const records = await PersonalRecord.query()
      .where('userId', userId)
      .where('recordType', recordType)
      .where('activityType', activityType)
      .preload('activity')
      .orderBy('achievedAt', 'desc')

    return records
  }

  /**
   * Récupère les records récents (derniers 30 jours)
   * Ne retourne que les records actuels qui ont été battus récemment
   */
  static async getRecentRecords(userId: number, days: number = 30) {
    const cutoffDate = DateTime.now().minus({ days })

    const records = await PersonalRecord.query()
      .where('userId', userId)
      .where('isCurrent', true)
      .where('achievedAt', '>=', cutoffDate.toSQL())
      .preload('activity')
      .orderBy('achievedAt', 'desc')

    return records
  }

  /**
   * Recalculer tous les records d'un utilisateur (utile après import massif)
   */
  static async recalculateAllRecords(userId: number): Promise<number> {
    // Supprimer tous les records existants
    await PersonalRecord.query().where('userId', userId).delete()

    // Récupérer toutes les activités triées par date
    const activities = await Activity.query()
      .where('userId', userId)
      .orderBy('date', 'asc')

    let totalNewRecords = 0

    // Parcourir chaque activité et vérifier les records
    for (const activity of activities) {
      const newRecords = await this.checkForNewRecords(activity)
      totalNewRecords += newRecords.length
    }

    return totalNewRecords
  }

  /**
   * Formater le nom d'un type de record pour l'affichage
   */
  static formatRecordTypeName(recordType: string): string {
    const names: Record<string, string> = {
      max_distance: 'Distance maximale',
      max_avg_speed: 'Vitesse moyenne max',
      max_speed: 'Vitesse maximale',
      max_trimp: 'TRIMP maximum',
      max_elevation: 'Dénivelé maximum',
      longest_duration: 'Durée la plus longue',
      max_avg_heart_rate: 'FC moyenne max',
      max_calories: 'Calories max',
    }
    return names[recordType] || recordType
  }
}
