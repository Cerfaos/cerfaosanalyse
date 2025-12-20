import type { HttpContext } from '@adonisjs/core/http'
import TrainingSession from '#models/training_session'
import { createSessionValidator, updateSessionValidator } from '#validators/training_session'

export default class TrainingSessionsController {
  /**
   * Liste des séances de l'utilisateur
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const category = request.input('category')

    const query = TrainingSession.query().where('userId', user.id).orderBy('createdAt', 'desc')

    if (category) {
      query.where('category', category)
    }

    const sessions = await query

    return response.ok({
      message: 'Séances récupérées',
      data: sessions,
    })
  }

  /**
   * Créer une séance
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createSessionValidator)

    const session = await TrainingSession.create({
      ...payload,
      userId: user.id,
    })

    return response.created({
      message: 'Séance créée avec succès',
      data: session,
    })
  }

  /**
   * Détails d'une séance
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const session = await TrainingSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!session) {
      return response.notFound({
        message: 'Séance non trouvée',
      })
    }

    return response.ok({
      message: 'Séance récupérée',
      data: session,
    })
  }

  /**
   * Modifier une séance
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const session = await TrainingSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!session) {
      return response.notFound({
        message: 'Séance non trouvée',
      })
    }

    const payload = await request.validateUsing(updateSessionValidator)

    session.merge(payload)
    await session.save()

    return response.ok({
      message: 'Séance mise à jour',
      data: session,
    })
  }

  /**
   * Supprimer une séance
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const session = await TrainingSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!session) {
      return response.notFound({
        message: 'Séance non trouvée',
      })
    }

    await session.delete()

    return response.ok({
      message: 'Séance supprimée',
    })
  }
}
