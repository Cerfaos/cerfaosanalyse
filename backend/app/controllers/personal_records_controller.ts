import { HttpContext } from '@adonisjs/core/http'
import PersonalRecordService from '#services/personal_record_service'

export default class PersonalRecordsController {
  /**
   * Récupérer tous les records actuels de l'utilisateur
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const records = await PersonalRecordService.getCurrentRecords(user.id)

    // Grouper par type d'activité
    const groupedRecords: Record<string, any[]> = {}

    for (const record of records) {
      if (!groupedRecords[record.activityType]) {
        groupedRecords[record.activityType] = []
      }
      groupedRecords[record.activityType].push({
        id: record.id,
        recordType: record.recordType,
        recordTypeName: PersonalRecordService.formatRecordTypeName(record.recordType),
        value: record.value,
        unit: record.unit,
        achievedAt: record.achievedAt,
        previousValue: record.previousValue,
        previousAchievedAt: record.previousAchievedAt,
        activityId: record.activityId,
        activityDate: record.activity?.date,
      })
    }

    return response.ok({
      data: groupedRecords,
    })
  }

  /**
   * Récupérer les records d'un type d'activité spécifique
   */
  async byActivityType({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const activityType = params.type

    const records = await PersonalRecordService.getRecordsByActivityType(user.id, activityType)

    const formattedRecords = records.map((record) => ({
      id: record.id,
      recordType: record.recordType,
      recordTypeName: PersonalRecordService.formatRecordTypeName(record.recordType),
      value: record.value,
      unit: record.unit,
      achievedAt: record.achievedAt,
      previousValue: record.previousValue,
      previousAchievedAt: record.previousAchievedAt,
      activityId: record.activityId,
      activityDate: record.activity?.date,
    }))

    return response.ok({
      data: formattedRecords,
    })
  }

  /**
   * Récupérer l'historique d'un record spécifique
   */
  async history({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { type, activityType } = params

    const history = await PersonalRecordService.getRecordHistory(user.id, type, activityType)

    const formattedHistory = history.map((record) => ({
      id: record.id,
      value: record.value,
      unit: record.unit,
      achievedAt: record.achievedAt,
      isCurrent: record.isCurrent,
      activityId: record.activityId,
      activityDate: record.activity?.date,
      activityDistance: record.activity?.distance,
      activityDuration: record.activity?.duration,
    }))

    return response.ok({
      data: formattedHistory,
    })
  }

  /**
   * Récupérer les records récents
   */
  async recent({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const days = request.input('days', 30)

    const records = await PersonalRecordService.getRecentRecords(user.id, days)

    const formattedRecords = records.map((record) => ({
      id: record.id,
      recordType: record.recordType,
      recordTypeName: PersonalRecordService.formatRecordTypeName(record.recordType),
      activityType: record.activityType,
      value: record.value,
      unit: record.unit,
      achievedAt: record.achievedAt,
      previousValue: record.previousValue,
      improvement:
        record.previousValue !== null
          ? ((record.value - record.previousValue) / record.previousValue) * 100
          : null,
      createdAt: record.createdAt,
      activityId: record.activityId,
    }))

    return response.ok({
      data: formattedRecords,
    })
  }

  /**
   * Recalculer tous les records (admin/debug)
   */
  async recalculate({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const totalRecords = await PersonalRecordService.recalculateAllRecords(user.id)

    return response.ok({
      message: `${totalRecords} records recalculés avec succès`,
      data: {
        totalRecords,
      },
    })
  }

  /**
   * Statistiques globales des records
   */
  async stats({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const records = await PersonalRecordService.getCurrentRecords(user.id)
    const recentRecords = await PersonalRecordService.getRecentRecords(user.id, 30)

    // Compter par type d'activité
    const byActivityType: Record<string, number> = {}
    for (const record of records) {
      byActivityType[record.activityType] = (byActivityType[record.activityType] || 0) + 1
    }

    return response.ok({
      data: {
        totalRecords: records.length,
        recentRecords: recentRecords.length,
        byActivityType,
      },
    })
  }
}
