import WeightHistory from '#models/weight_history'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class WeightHistoriesController {
  /**
   * Lister toutes les pesées de l'utilisateur
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)

    const weightHistories = await WeightHistory.query()
      .where('user_id', user.id)
      .orderBy('date', 'desc')
      .paginate(page, limit)

    return response.ok({
      data: weightHistories.serialize(),
    })
  }

  /**
   * Créer une nouvelle pesée
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = request.only(['date', 'weight', 'notes'])

    // Validation
    if (!data.date || !data.weight) {
      return response.badRequest({ message: 'Date et poids sont requis' })
    }

    if (data.weight < 30 || data.weight > 300) {
      return response.badRequest({ message: 'Le poids doit être entre 30 et 300 kg' })
    }

    const weightHistory = await WeightHistory.create({
      userId: user.id,
      date: DateTime.fromISO(data.date),
      weight: data.weight,
      notes: data.notes || null,
    })

    // Mettre à jour le poids actuel de l'utilisateur
    user.weightCurrent = data.weight
    await user.save()

    return response.created({
      message: 'Pesée enregistrée avec succès',
      data: weightHistory.serialize(),
    })
  }

  /**
   * Afficher une pesée spécifique
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const weightHistory = await WeightHistory.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    return response.ok({
      data: weightHistory.serialize(),
    })
  }

  /**
   * Mettre à jour une pesée
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = request.only(['date', 'weight', 'notes'])

    const weightHistory = await WeightHistory.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (data.weight !== undefined) {
      if (data.weight < 30 || data.weight > 300) {
        return response.badRequest({ message: 'Le poids doit être entre 30 et 300 kg' })
      }
      weightHistory.weight = data.weight
    }

    if (data.date) {
      weightHistory.date = DateTime.fromISO(data.date)
    }

    if (data.notes !== undefined) {
      weightHistory.notes = data.notes
    }

    await weightHistory.save()

    return response.ok({
      message: 'Pesée mise à jour avec succès',
      data: weightHistory.serialize(),
    })
  }

  /**
   * Supprimer une pesée
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const weightHistory = await WeightHistory.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await weightHistory.delete()

    return response.ok({
      message: 'Pesée supprimée avec succès',
    })
  }

  /**
   * Obtenir les statistiques de poids
   */
  async stats({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const allWeights = await WeightHistory.query()
      .where('user_id', user.id)
      .orderBy('date', 'asc')

    if (allWeights.length === 0) {
      return response.ok({
        data: {
          count: 0,
          min: null,
          max: null,
          average: null,
          current: user.weightCurrent,
          trend30Days: null,
          trend90Days: null,
        },
      })
    }

    const weights = allWeights.map((w) => w.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const average = weights.reduce((a, b) => a + b, 0) / weights.length

    // Tendance sur 30 jours
    const now = DateTime.now()
    const thirtyDaysAgo = now.minus({ days: 30 })
    const ninetyDaysAgo = now.minus({ days: 90 })

    const weights30Days = allWeights.filter((w) => w.date >= thirtyDaysAgo)
    const weights90Days = allWeights.filter((w) => w.date >= ninetyDaysAgo)

    const trend30Days =
      weights30Days.length >= 2
        ? weights30Days[weights30Days.length - 1].weight - weights30Days[0].weight
        : null

    const trend90Days =
      weights90Days.length >= 2
        ? weights90Days[weights90Days.length - 1].weight - weights90Days[0].weight
        : null

    return response.ok({
      data: {
        count: allWeights.length,
        min: parseFloat(min.toFixed(1)),
        max: parseFloat(max.toFixed(1)),
        average: parseFloat(average.toFixed(1)),
        current: user.weightCurrent,
        trend30Days: trend30Days ? parseFloat(trend30Days.toFixed(1)) : null,
        trend90Days: trend90Days ? parseFloat(trend90Days.toFixed(1)) : null,
        firstDate: allWeights[0].date,
        lastDate: allWeights[allWeights.length - 1].date,
      },
    })
  }
}
