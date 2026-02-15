import type { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import WeightHistory from '#models/weight_history'
import Equipment from '#models/equipment'
import TrainingSession from '#models/training_session'
import TrainingTemplate from '#models/training_template'
import TrainingProgram from '#models/training_program'
import PpgExercise from '#models/ppg_exercise'
import ExportService from '#services/export_service'
import type { ActivityFilters, BackupFileInfo, BackupStatus } from '#types/export'
import { DateTime } from 'luxon'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

export default class ExportsController {
  private exportService = new ExportService()

  /**
   * Exporter toutes les données de l'utilisateur en JSON
   */
  async exportAll({ auth, response }: HttpContext) {
    const user = auth.user!

    const [activities, weightHistories, equipment] = await Promise.all([
      Activity.query().where('user_id', user.id).orderBy('date', 'desc'),
      WeightHistory.query().where('user_id', user.id).orderBy('date', 'desc'),
      Equipment.query().where('user_id', user.id).orderBy('created_at', 'desc'),
    ])

    const exportData = {
      exportDate: DateTime.now().toISO(),
      user: {
        email: user.email,
        fullName: user.fullName,
        fcMax: user.fcMax,
        fcRepos: user.fcRepos,
      },
      activities: activities.map((a) => ({
        date: a.date.toISODate(),
        type: a.type,
        duration: a.duration,
        distance: a.distance,
        avgHeartRate: a.avgHeartRate,
        maxHeartRate: a.maxHeartRate,
        avgSpeed: a.avgSpeed,
        maxSpeed: a.maxSpeed,
        elevationGain: a.elevationGain,
        calories: a.calories,
        avgCadence: a.avgCadence,
        avgPower: a.avgPower,
        normalizedPower: a.normalizedPower,
        trimp: a.trimp,
        fileName: a.fileName,
      })),
      weightHistories: weightHistories.map((w) => ({
        date: w.date.toISODate(),
        weight: w.weight,
        notes: w.notes,
      })),
      equipment: equipment.map((e) => ({
        name: e.name,
        type: e.type,
        brand: e.brand,
        model: e.model,
        initialDistance: e.initialDistance,
        currentDistance: e.currentDistance,
        alertDistance: e.alertDistance,
        purchaseDate: e.purchaseDate?.toISODate(),
        retirementDate: e.retirementDate?.toISODate(),
        isActive: e.isActive,
        notes: e.notes,
      })),
    }

    response.header('Content-Type', 'application/json')
    response.header(
      'Content-Disposition',
      `attachment; filename="${this.exportService.generateExportFilename('export', 'json')}"`
    )

    return response.json(exportData)
  }

  /**
   * Exporter les activités en CSV
   */
  async exportActivitiesCsv({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const filters: ActivityFilters = {
      type: request.input('type'),
      search: request.input('search'),
      startDate: request.input('startDate'),
      endDate: request.input('endDate'),
    }

    const activities = await this.queryActivitiesWithFilters(user.id, filters)
    const csv = this.exportService.generateCsv(
      activities,
      this.exportService.getActivityCsvColumns()
    )

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="${this.exportService.generateExportFilename('activities', 'csv')}"`
    )

    return response.send(csv)
  }

  /**
   * Exporter l'historique de poids en CSV
   */
  async exportWeightCsv({ auth, response }: HttpContext) {
    const user = auth.user!

    const weightHistories = await WeightHistory.query()
      .where('user_id', user.id)
      .orderBy('date', 'desc')

    const csv = this.exportService.generateCsv(weightHistories, [
      { header: 'Date', getValue: (w) => w.date.toISODate() || '' },
      { header: 'Poids (kg)', getValue: (w) => w.weight.toFixed(1) },
      { header: 'Notes', getValue: (w) => this.exportService.escapeCsvValue(w.notes) },
    ])

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="${this.exportService.generateExportFilename('weight', 'csv')}"`
    )

    return response.send(csv)
  }

  /**
   * Exporter l'équipement en CSV
   */
  async exportEquipmentCsv({ auth, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')

    const csv = this.exportService.generateCsv(equipment, [
      { header: 'Nom', getValue: (e) => this.exportService.escapeCsvValue(e.name) },
      { header: 'Type', getValue: (e) => e.type },
      { header: 'Marque', getValue: (e) => e.brand || '' },
      { header: 'Modèle', getValue: (e) => e.model || '' },
      { header: 'Distance Initiale (km)', getValue: (e) => (e.initialDistance / 1000).toFixed(0) },
      { header: 'Distance Actuelle (km)', getValue: (e) => (e.currentDistance / 1000).toFixed(0) },
      {
        header: 'Alerte Maintenance (km)',
        getValue: (e) => (e.alertDistance ? (e.alertDistance / 1000).toFixed(0) : ''),
      },
      { header: 'Date Achat', getValue: (e) => e.purchaseDate?.toISODate() || '' },
      { header: 'Date Retraite', getValue: (e) => e.retirementDate?.toISODate() || '' },
      { header: 'Actif', getValue: (e) => (e.isActive ? 'Oui' : 'Non') },
      { header: 'Notes', getValue: (e) => this.exportService.escapeCsvValue(e.notes) },
    ])

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="${this.exportService.generateExportFilename('equipment', 'csv')}"`
    )

    return response.send(csv)
  }

  /**
   * Exporter une activité en GPX
   */
  async exportActivityGpx({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const activity = await Activity.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!activity) {
      return response.notFound({ message: 'Activité non trouvée' })
    }

    if (!activity.gpsData) {
      return response.badRequest({ message: 'Cette activité ne contient pas de données GPS' })
    }

    const gpsPoints = JSON.parse(activity.gpsData)
    const gpxContent = this.exportService.generateGpxFile(activity, gpsPoints)

    response.header('Content-Type', 'application/gpx+xml; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="${activity.type.toLowerCase()}-${activity.date.toFormat('yyyy-MM-dd')}.gpx"`
    )

    return response.send(gpxContent)
  }

  /**
   * Obtenir les statistiques globales
   */
  async stats({ auth, response }: HttpContext) {
    const user = auth.user!

    const [activitiesCount, weightCount, equipmentCount, firstActivity, lastActivity] =
      await Promise.all([
        Activity.query().where('user_id', user.id).count('* as total'),
        WeightHistory.query().where('user_id', user.id).count('* as total'),
        Equipment.query().where('user_id', user.id).count('* as total'),
        Activity.query().where('user_id', user.id).orderBy('date', 'asc').first(),
        Activity.query().where('user_id', user.id).orderBy('date', 'desc').first(),
      ])

    return response.ok({
      message: 'Statistiques récupérées',
      data: {
        totalActivities: activitiesCount[0].$extras.total,
        totalWeightEntries: weightCount[0].$extras.total,
        totalEquipment: equipmentCount[0].$extras.total,
        firstActivityDate: firstActivity?.date.toISODate() || null,
        lastActivityDate: lastActivity?.date.toISODate() || null,
        memberSince: user.createdAt.toISODate(),
      },
    })
  }

  /**
   * Créer une sauvegarde complète de toutes les données utilisateur
   */
  async exportBackup({ auth, response }: HttpContext) {
    const user = auth.user!

    const [activities, weightHistories, equipment] = await Promise.all([
      Activity.query().where('user_id', user.id).orderBy('date', 'desc'),
      WeightHistory.query().where('user_id', user.id).orderBy('date', 'desc'),
      Equipment.query().where('user_id', user.id).orderBy('created_at', 'desc'),
    ])

    const backupData = {
      version: '1.0.0',
      exportDate: DateTime.now().toISO(),
      exportType: 'FULL_BACKUP',
      user: {
        email: user.email,
        fullName: user.fullName,
        fcMax: user.fcMax,
        fcRepos: user.fcRepos,
        weightCurrent: user.weightCurrent,
        theme: user.theme,
        avatarUrl: user.avatarUrl,
      },
      activities: activities.map((a) => a.toJSON()),
      weightHistories: weightHistories.map((w) => w.toJSON()),
      equipment: equipment.map((e) => e.toJSON()),
      metadata: {
        totalActivities: activities.length,
        totalWeightEntries: weightHistories.length,
        totalEquipment: equipment.length,
      },
    }

    response.header('Content-Type', 'application/json')
    response.header(
      'Content-Disposition',
      `attachment; filename="${this.exportService.generateBackupFilename()}"`
    )

    return response.json(backupData)
  }

  /**
   * Importer et restaurer une sauvegarde complète
   */
  async importBackup({ auth, request, response }: HttpContext) {
    const user = auth.user!

    try {
      const backupData = request.body()

      if (!backupData.version || backupData.exportType !== 'FULL_BACKUP') {
        return response.badRequest({ message: 'Format de sauvegarde invalide' })
      }

      const cleanImport = request.input('clean', false)

      if (cleanImport) {
        await Promise.all([
          Activity.query().where('user_id', user.id).delete(),
          WeightHistory.query().where('user_id', user.id).delete(),
          Equipment.query().where('user_id', user.id).delete(),
        ])
      }

      const imported = await this.importBackupData(user.id, backupData)

      if (backupData.user) {
        const { email, ...userFields } = backupData.user
        await user.merge(userFields).save()
      }

      return response.ok({
        message: 'Sauvegarde restaurée avec succès',
        data: { imported, cleanImport, backupDate: backupData.exportDate },
      })
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      return response.internalServerError({
        message: 'Erreur lors de la restauration de la sauvegarde',
        error: error.message,
      })
    }
  }

  /**
   * Obtenir le statut des sauvegardes serveur
   */
  async backupStatus({ response }: HttpContext) {
    try {
      const backupDir = join(app.makePath('..'), 'backups')
      const { backups, totalSize, lastBackupDate } = await this.scanBackupDirectory(backupDir)

      return response.ok({
        message: 'Statut des sauvegardes',
        data: {
          backups,
          summary: {
            totalFull: backups.full.length,
            totalDb: backups.db.length,
            totalUploads: backups.uploads.length,
            totalSize: this.exportService.formatFileSize(totalSize),
            lastBackupDate,
          },
          serverBackupEnabled: true,
          backupSchedule: 'Quotidien à 2h00',
        },
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du statut des sauvegardes:', error)
      return response.internalServerError({
        message: 'Erreur lors de la récupération du statut',
      })
    }
  }

  /**
   * Obtenir les statistiques étendues pour l'export
   */
  async extendedStats({ auth, response }: HttpContext) {
    const user = auth.user!

    const [
      activitiesCount,
      weightCount,
      equipmentCount,
      sessionsCount,
      templatesCount,
      programsCount,
      ppgCount,
      firstActivity,
      lastActivity,
    ] = await Promise.all([
      Activity.query().where('user_id', user.id).count('* as total'),
      WeightHistory.query().where('user_id', user.id).count('* as total'),
      Equipment.query().where('user_id', user.id).count('* as total'),
      TrainingSession.query().where('user_id', user.id).count('* as total'),
      TrainingTemplate.query().where('user_id', user.id).count('* as total'),
      TrainingProgram.query().where('user_id', user.id).count('* as total'),
      PpgExercise.query().where('user_id', user.id).count('* as total'),
      Activity.query().where('user_id', user.id).orderBy('date', 'asc').first(),
      Activity.query().where('user_id', user.id).orderBy('date', 'desc').first(),
    ])

    const totalGpsDataSize = await this.calculateGpsDataSize(user.id)

    return response.ok({
      message: 'Statistiques étendues récupérées',
      data: {
        totalActivities: Number(activitiesCount[0].$extras.total),
        totalWeightEntries: Number(weightCount[0].$extras.total),
        totalEquipment: Number(equipmentCount[0].$extras.total),
        totalTrainingSessions: Number(sessionsCount[0].$extras.total),
        totalTrainingTemplates: Number(templatesCount[0].$extras.total),
        totalTrainingPrograms: Number(programsCount[0].$extras.total),
        totalPpgExercises: Number(ppgCount[0].$extras.total),
        firstActivityDate: firstActivity?.date.toISODate() || null,
        lastActivityDate: lastActivity?.date.toISODate() || null,
        memberSince: user.createdAt.toISODate(),
        estimatedDataSize: this.exportService.formatFileSize(
          totalGpsDataSize +
            Number(activitiesCount[0].$extras.total) * 500 +
            Number(weightCount[0].$extras.total) * 100 +
            Number(equipmentCount[0].$extras.total) * 200
        ),
      },
    })
  }

  // Méthodes privées

  private async queryActivitiesWithFilters(
    userId: number,
    filters: ActivityFilters
  ): Promise<Activity[]> {
    let query = Activity.query().where('user_id', userId).orderBy('date', 'desc')

    if (filters.type) {
      query = query.where('type', filters.type)
    }

    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(notes) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(feeling_notes) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(type) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(file_name) LIKE ?', [searchTerm])
      })
    }

    if (filters.startDate) {
      query = query.where('date', '>=', filters.startDate)
    }

    if (filters.endDate) {
      const endDatePlusOne = new Date(filters.endDate)
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
      query = query.where('date', '<', endDatePlusOne.toISOString().split('T')[0])
    }

    return query
  }

  private async importBackupData(
    userId: number,
    backupData: Record<string, unknown>
  ): Promise<{ activities: number; weightHistories: number; equipment: number }> {
    const imported = { activities: 0, weightHistories: 0, equipment: 0 }

    if (backupData.activities && Array.isArray(backupData.activities)) {
      for (const activityData of backupData.activities) {
        const { id, userId: _, createdAt, updatedAt, ...activityFields } = activityData
        await Activity.create({
          ...activityFields,
          userId,
          date: DateTime.fromISO(activityData.date),
        })
        imported.activities++
      }
    }

    if (backupData.weightHistories && Array.isArray(backupData.weightHistories)) {
      for (const weightData of backupData.weightHistories) {
        const { id, userId: _, createdAt, updatedAt, ...weightFields } = weightData
        await WeightHistory.create({
          ...weightFields,
          userId,
          date: DateTime.fromISO(weightData.date),
        })
        imported.weightHistories++
      }
    }

    if (backupData.equipment && Array.isArray(backupData.equipment)) {
      for (const equipmentData of backupData.equipment) {
        const { id, userId: _, createdAt, updatedAt, ...equipmentFields } = equipmentData
        await Equipment.create({
          ...equipmentFields,
          userId,
          purchaseDate: equipmentData.purchaseDate
            ? DateTime.fromISO(equipmentData.purchaseDate)
            : null,
          retirementDate: equipmentData.retirementDate
            ? DateTime.fromISO(equipmentData.retirementDate)
            : null,
        })
        imported.equipment++
      }
    }

    return imported
  }

  private async scanBackupDirectory(
    backupDir: string
  ): Promise<{ backups: BackupStatus; totalSize: number; lastBackupDate: string | null }> {
    const backups: BackupStatus = { full: [], db: [], uploads: [] }
    let totalSize = 0
    let lastBackupDate: string | null = null

    try {
      const files = await readdir(backupDir)

      for (const file of files) {
        const filePath = join(backupDir, file)
        const fileStat = await stat(filePath)

        if (!fileStat.isFile()) continue

        totalSize += fileStat.size
        const date = fileStat.mtime.toISOString()

        if (!lastBackupDate || new Date(date) > new Date(lastBackupDate)) {
          lastBackupDate = date
        }

        const backupInfo: BackupFileInfo = {
          name: file,
          date,
          size: this.exportService.formatFileSize(fileStat.size),
        }

        if (file.startsWith('full_backup_')) {
          backups.full.push(backupInfo)
        } else if (file.startsWith('db_')) {
          backups.db.push(backupInfo)
        } else if (file.startsWith('uploads_')) {
          backups.uploads.push(backupInfo)
        }
      }

      const sortByDate = (a: BackupFileInfo, b: BackupFileInfo) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()

      backups.full.sort(sortByDate)
      backups.db.sort(sortByDate)
      backups.uploads.sort(sortByDate)
    } catch {
      // Répertoire n'existe pas encore
    }

    return { backups, totalSize, lastBackupDate }
  }

  private async calculateGpsDataSize(userId: number): Promise<number> {
    const activities = await Activity.query().where('user_id', userId)
    let totalSize = 0
    for (const activity of activities) {
      if (activity.gpsData) {
        totalSize += activity.gpsData.length
      }
    }
    return totalSize
  }
}
