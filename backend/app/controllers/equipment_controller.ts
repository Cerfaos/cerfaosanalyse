import type { HttpContext } from '@adonisjs/core/http'
import Equipment from '#models/equipment'
import { DateTime } from 'luxon'

export default class EquipmentController {
  /**
   * Lister tous les équipements de l'utilisateur
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query()
      .where('user_id', user.id)
      .orderBy('is_active', 'desc')
      .orderBy('created_at', 'desc')

    return response.ok({
      message: 'Équipements récupérés',
      data: equipment,
    })
  }

  /**
   * Récupérer un équipement spécifique
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!equipment) {
      return response.notFound({
        message: 'Équipement non trouvé',
      })
    }

    return response.ok({
      message: 'Équipement récupéré',
      data: equipment,
    })
  }

  /**
   * Créer un nouvel équipement
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const data = request.only([
      'name',
      'type',
      'brand',
      'model',
      'initialDistance',
      'alertDistance',
      'purchaseDate',
      'notes',
    ])

    const equipment = await Equipment.create({
      userId: user.id,
      name: data.name,
      type: data.type,
      brand: data.brand || null,
      model: data.model || null,
      initialDistance: data.initialDistance || 0,
      currentDistance: data.initialDistance || 0, // Au départ, distance actuelle = distance initiale
      alertDistance: data.alertDistance || null,
      purchaseDate: data.purchaseDate ? DateTime.fromISO(data.purchaseDate) : null,
      isActive: true,
      notes: data.notes || null,
    })

    return response.created({
      message: 'Équipement créé',
      data: equipment,
    })
  }

  /**
   * Mettre à jour un équipement
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!equipment) {
      return response.notFound({
        message: 'Équipement non trouvé',
      })
    }

    const data = request.only([
      'name',
      'type',
      'brand',
      'model',
      'initialDistance',
      'currentDistance',
      'alertDistance',
      'purchaseDate',
      'retirementDate',
      'isActive',
      'notes',
    ])

    // Convertir les dates si présentes
    if (data.purchaseDate) {
      data.purchaseDate = DateTime.fromISO(data.purchaseDate)
    }
    if (data.retirementDate) {
      data.retirementDate = DateTime.fromISO(data.retirementDate)
    }

    equipment.merge(data)
    await equipment.save()

    return response.ok({
      message: 'Équipement mis à jour',
      data: equipment,
    })
  }

  /**
   * Supprimer un équipement
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!equipment) {
      return response.notFound({
        message: 'Équipement non trouvé',
      })
    }

    await equipment.delete()

    return response.ok({
      message: 'Équipement supprimé',
    })
  }

  /**
   * Obtenir les statistiques d'un équipement
   */
  async stats({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const equipment = await Equipment.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!equipment) {
      return response.notFound({
        message: 'Équipement non trouvé',
      })
    }

    // Calculer les statistiques
    const totalDistance = equipment.currentDistance
    const remainingDistance = equipment.alertDistance
      ? equipment.alertDistance - (totalDistance - equipment.initialDistance)
      : null

    const stats = {
      totalDistance,
      distanceSinceNew: totalDistance - equipment.initialDistance,
      remainingDistance,
      needsMaintenance: remainingDistance !== null && remainingDistance <= 0,
      daysOwned: equipment.purchaseDate
        ? Math.floor(DateTime.now().diff(equipment.purchaseDate, 'days').days)
        : null,
      isRetired: equipment.retirementDate !== null,
    }

    return response.ok({
      message: 'Statistiques calculées',
      data: stats,
    })
  }
}
