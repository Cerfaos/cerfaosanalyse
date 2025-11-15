import type { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import WeightHistory from '#models/weight_history'
import Equipment from '#models/equipment'
import Goal from '#models/goal'
import UserBadge from '#models/user_badge'
import Badge from '#models/badge'
import { DateTime } from 'luxon'
import type { ParsedGpsPoint } from '#types/training'

export default class ExportsController {
  /**
   * Exporter toutes les données de l'utilisateur en JSON
   */
  async exportAll({ auth, response }: HttpContext) {
    const user = auth.user!

    // Récupérer toutes les données
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

    // Définir les headers pour le téléchargement
    response.header('Content-Type', 'application/json')
    response.header(
      'Content-Disposition',
      `attachment; filename="cerfaos-export-${DateTime.now().toFormat('yyyy-MM-dd')}.json"`
    )

    return response.json(exportData)
  }

  /**
   * Exporter les activités en CSV
   */
  async exportActivitiesCsv({ auth, response }: HttpContext) {
    const user = auth.user!

    const activities = await Activity.query().where('user_id', user.id).orderBy('date', 'desc')

    // Créer le CSV
    const headers = [
      'Date',
      'Type',
      'Durée (min)',
      'Distance (km)',
      'FC Moy',
      'FC Max',
      'Vitesse Moy (km/h)',
      'Vitesse Max (km/h)',
      'Dénivelé (m)',
      'Calories',
      'Cadence Moy',
      'Puissance Moy',
      'Puissance Normalisée',
      'TRIMP',
    ].join(',')

    const rows = activities.map((a) => {
      return [
        a.date.toISODate(),
        a.type,
        Math.round(a.duration / 60),
        (a.distance / 1000).toFixed(2),
        a.avgHeartRate || '',
        a.maxHeartRate || '',
        a.avgSpeed?.toFixed(1) || '',
        a.maxSpeed?.toFixed(1) || '',
        a.elevationGain || '',
        a.calories || '',
        a.avgCadence || '',
        a.avgPower || '',
        a.normalizedPower || '',
        a.trimp || '',
      ].join(',')
    })

    const csv = [headers, ...rows].join('\n')

    // Définir les headers pour le téléchargement
    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="cerfaos-activities-${DateTime.now().toFormat('yyyy-MM-dd')}.csv"`
    )

    // Ajouter BOM UTF-8 pour Excel
    return response.send('\ufeff' + csv)
  }

  /**
   * Exporter l'historique de poids en CSV
   */
  async exportWeightCsv({ auth, response }: HttpContext) {
    const user = auth.user!

    const weightHistories = await WeightHistory.query()
      .where('user_id', user.id)
      .orderBy('date', 'desc')

    // Créer le CSV
    const headers = ['Date', 'Poids (kg)', 'Notes'].join(',')

    const rows = weightHistories.map((w) => {
      return [w.date.toISODate(), w.weight.toFixed(1), `"${w.notes || ''}"`].join(',')
    })

    const csv = [headers, ...rows].join('\n')

    // Définir les headers pour le téléchargement
    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="cerfaos-weight-${DateTime.now().toFormat('yyyy-MM-dd')}.csv"`
    )

    // Ajouter BOM UTF-8 pour Excel
    return response.send('\ufeff' + csv)
  }

  /**
   * Exporter l'équipement en CSV
   */
  async exportEquipmentCsv({ auth, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query().where('user_id', user.id).orderBy('created_at', 'desc')

    // Créer le CSV
    const headers = [
      'Nom',
      'Type',
      'Marque',
      'Modèle',
      'Distance Initiale (km)',
      'Distance Actuelle (km)',
      'Alerte Maintenance (km)',
      'Date Achat',
      'Date Retraite',
      'Actif',
      'Notes',
    ].join(',')

    const rows = equipment.map((e) => {
      return [
        `"${e.name}"`,
        e.type,
        e.brand || '',
        e.model || '',
        (e.initialDistance / 1000).toFixed(0),
        (e.currentDistance / 1000).toFixed(0),
        e.alertDistance ? (e.alertDistance / 1000).toFixed(0) : '',
        e.purchaseDate?.toISODate() || '',
        e.retirementDate?.toISODate() || '',
        e.isActive ? 'Oui' : 'Non',
        `"${e.notes || ''}"`,
      ].join(',')
    })

    const csv = [headers, ...rows].join('\n')

    // Définir les headers pour le téléchargement
    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="cerfaos-equipment-${DateTime.now().toFormat('yyyy-MM-dd')}.csv"`
    )

    // Ajouter BOM UTF-8 pour Excel
    return response.send('\ufeff' + csv)
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
      return response.notFound({
        message: 'Activité non trouvée',
      })
    }

    if (!activity.gpsData) {
      return response.badRequest({
        message: 'Cette activité ne contient pas de données GPS',
      })
    }

    // Parser les données GPS
    const gpsPoints = JSON.parse(activity.gpsData)

    // Générer le fichier GPX
    const gpxContent = this.generateGpxFile(activity, gpsPoints)

    // Définir les headers pour le téléchargement
    response.header('Content-Type', 'application/gpx+xml; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="${activity.type.toLowerCase()}-${activity.date.toFormat('yyyy-MM-dd')}.gpx"`
    )

    return response.send(gpxContent)
  }

  /**
   * Générer un fichier GPX à partir d'une activité
   */
  private generateGpxFile(activity: Activity, gpsPoints: ParsedGpsPoint[]): string {
    const activityName = `${activity.type} - ${activity.date.toFormat('dd/MM/yyyy')}`
    const timeISO = activity.date.toISO()

    const trackPoints = gpsPoints
      .map((point) => {
        const ele = point.ele !== undefined ? `    <ele>${point.ele}</ele>` : ''
        const time = point.time ? `    <time>${point.time}</time>` : ''

        return `  <trkpt lat="${point.lat}" lon="${point.lon}">
${ele}
${time}
  </trkpt>`
      })
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
  creator="Centre d'Analyse Cycliste - Cerfao"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${activityName}</name>
    <time>${timeISO}</time>
  </metadata>
  <trk>
    <name>${activityName}</name>
    <type>${activity.type}</type>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`
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

    const stats = {
      totalActivities: activitiesCount[0].$extras.total,
      totalWeightEntries: weightCount[0].$extras.total,
      totalEquipment: equipmentCount[0].$extras.total,
      firstActivityDate: firstActivity?.date.toISODate() || null,
      lastActivityDate: lastActivity?.date.toISODate() || null,
      memberSince: user.createdAt.toISODate(),
    }

    return response.ok({
      message: 'Statistiques récupérées',
      data: stats,
    })
  }

  /**
   * Créer une sauvegarde complète de toutes les données utilisateur
   * Pour import/export et restauration en cas de problème
   */
  async exportBackup({ auth, response }: HttpContext) {
    const user = auth.user!

    // Récupérer TOUTES les données de l'utilisateur
    const [activities, weightHistories, equipment, goals, userBadges] = await Promise.all([
      Activity.query().where('user_id', user.id).orderBy('date', 'desc'),
      WeightHistory.query().where('user_id', user.id).orderBy('date', 'desc'),
      Equipment.query().where('user_id', user.id).orderBy('created_at', 'desc'),
      Goal.query().where('user_id', user.id).orderBy('created_at', 'desc'),
      UserBadge.query().where('user_id', user.id).preload('badge'),
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
      goals: goals.map((g) => g.toJSON()),
      userBadges: userBadges.map((ub) => ({
        badgeCode: ub.badge.code,
        unlockedAt: ub.unlockedAt.toISO(),
        valueAtUnlock: ub.valueAtUnlock,
      })),
      metadata: {
        totalActivities: activities.length,
        totalWeightEntries: weightHistories.length,
        totalEquipment: equipment.length,
        totalGoals: goals.length,
        totalBadges: userBadges.length,
      },
    }

    // Définir les headers pour le téléchargement
    response.header('Content-Type', 'application/json')
    response.header(
      'Content-Disposition',
      `attachment; filename="cerfaos-backup-${DateTime.now().toFormat('yyyy-MM-dd-HHmmss')}.json"`
    )

    return response.json(backupData)
  }

  /**
   * Importer et restaurer une sauvegarde complète
   * ATTENTION: Cette opération va ÉCRASER les données existantes !
   */
  async importBackup({ auth, request, response }: HttpContext) {
    const user = auth.user!

    try {
      const backupData = request.body()

      // Validation du format
      if (!backupData.version || backupData.exportType !== 'FULL_BACKUP') {
        return response.badRequest({
          message: 'Format de sauvegarde invalide',
        })
      }

      // Option: tout supprimer avant d'importer (nettoyage complet)
      const cleanImport = request.input('clean', false)

      if (cleanImport) {
        // Supprimer toutes les données existantes
        await Promise.all([
          Activity.query().where('user_id', user.id).delete(),
          WeightHistory.query().where('user_id', user.id).delete(),
          Equipment.query().where('user_id', user.id).delete(),
          Goal.query().where('user_id', user.id).delete(),
          UserBadge.query().where('user_id', user.id).delete(),
        ])
      }

      // Importer les données
      const imported = {
        activities: 0,
        weightHistories: 0,
        equipment: 0,
        goals: 0,
        badges: 0,
      }

      // Importer les activités
      if (backupData.activities && Array.isArray(backupData.activities)) {
        for (const activityData of backupData.activities) {
          // Retirer l'ID pour éviter les conflits
          const { id, userId, createdAt, updatedAt, ...activityFields } = activityData

          await Activity.create({
            ...activityFields,
            userId: user.id,
            date: DateTime.fromISO(activityData.date),
          })
          imported.activities++
        }
      }

      // Importer l'historique de poids
      if (backupData.weightHistories && Array.isArray(backupData.weightHistories)) {
        for (const weightData of backupData.weightHistories) {
          const { id, userId, createdAt, updatedAt, ...weightFields } = weightData

          await WeightHistory.create({
            ...weightFields,
            userId: user.id,
            date: DateTime.fromISO(weightData.date),
          })
          imported.weightHistories++
        }
      }

      // Importer les équipements
      if (backupData.equipment && Array.isArray(backupData.equipment)) {
        for (const equipmentData of backupData.equipment) {
          const { id, userId, createdAt, updatedAt, ...equipmentFields } = equipmentData

          await Equipment.create({
            ...equipmentFields,
            userId: user.id,
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

      // Importer les objectifs
      if (backupData.goals && Array.isArray(backupData.goals)) {
        for (const goalData of backupData.goals) {
          const { id, userId, createdAt, updatedAt, ...goalFields } = goalData

          await Goal.create({
            ...goalFields,
            userId: user.id,
            startDate: DateTime.fromISO(goalData.startDate),
            endDate: DateTime.fromISO(goalData.endDate),
          })
          imported.goals++
        }
      }

      // Importer les badges débloqués
      if (backupData.userBadges && Array.isArray(backupData.userBadges)) {
        for (const badgeData of backupData.userBadges) {
          // Retrouver le badge par son code
          const badge = await Badge.query().where('code', badgeData.badgeCode).first()

          if (badge) {
            // Vérifier si le badge n'est pas déjà débloqué
            const existing = await UserBadge.query()
              .where('user_id', user.id)
              .where('badge_id', badge.id)
              .first()

            if (!existing) {
              await UserBadge.create({
                userId: user.id,
                badgeId: badge.id,
                unlockedAt: DateTime.fromISO(badgeData.unlockedAt),
                valueAtUnlock: badgeData.valueAtUnlock,
              })
              imported.badges++
            }
          }
        }
      }

      // Mettre à jour les infos utilisateur si présentes
      if (backupData.user) {
        const { email, ...userFields } = backupData.user
        await user.merge(userFields).save()
      }

      return response.ok({
        message: 'Sauvegarde restaurée avec succès',
        data: {
          imported,
          cleanImport,
          backupDate: backupData.exportDate,
        },
      })
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      return response.internalServerError({
        message: 'Erreur lors de la restauration de la sauvegarde',
        error: error.message,
      })
    }
  }
}
