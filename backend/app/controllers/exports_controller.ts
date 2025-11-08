import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Activity from '#models/activity'
import WeightHistory from '#models/weight_history'
import Equipment from '#models/equipment'
import { DateTime } from 'luxon'

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
        name: user.name,
        age: user.age,
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
        notes: a.notes,
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
      'Notes',
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
        `"${a.notes || ''}"`,
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
}
