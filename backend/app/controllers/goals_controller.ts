import type { HttpContext } from '@adonisjs/core/http'
import Goal from '#models/goal'
import Activity from '#models/activity'
import { DateTime } from 'luxon'

export default class GoalsController {
  /**
   * Récupérer tous les objectifs de l'utilisateur
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    const goals = await Goal.query()
      .where('user_id', user.id)
      .orderBy('is_active', 'desc')
      .orderBy('created_at', 'desc')

    // Calculer la progression pour chaque objectif
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await this.calculateProgress(goal, user.id)
        return {
          ...goal.toJSON(),
          currentValue: progress,
          percentage: goal.targetValue > 0 ? Math.round((progress / goal.targetValue) * 100) : 0,
        }
      })
    )

    return response.ok({
      message: 'Objectifs récupérés',
      data: goalsWithProgress,
    })
  }

  /**
   * Récupérer un objectif spécifique
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const goal = await Goal.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!goal) {
      return response.notFound({
        message: 'Objectif non trouvé',
      })
    }

    const progress = await this.calculateProgress(goal, user.id)

    return response.ok({
      message: 'Objectif récupéré',
      data: {
        ...goal.toJSON(),
        currentValue: progress,
        percentage: goal.targetValue > 0 ? Math.round((progress / goal.targetValue) * 100) : 0,
      },
    })
  }

  /**
   * Créer un nouvel objectif
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const data = request.only([
      'type',
      'targetValue',
      'period',
      'startDate',
      'endDate',
      'title',
      'description',
    ])

    // Calculer les dates selon la période si non fournies
    let startDate = data.startDate ? DateTime.fromISO(data.startDate) : DateTime.now()
    let endDate = data.endDate ? DateTime.fromISO(data.endDate) : DateTime.now()

    if (!data.startDate && !data.endDate) {
      if (data.period === 'weekly') {
        startDate = DateTime.now().startOf('week')
        endDate = DateTime.now().endOf('week')
      } else if (data.period === 'monthly') {
        startDate = DateTime.now().startOf('month')
        endDate = DateTime.now().endOf('month')
      } else if (data.period === 'yearly') {
        startDate = DateTime.now().startOf('year')
        endDate = DateTime.now().endOf('year')
      }
    }

    const goal = await Goal.create({
      userId: user.id,
      type: data.type,
      targetValue: Number(data.targetValue),
      currentValue: 0,
      period: data.period,
      startDate,
      endDate,
      title: data.title,
      description: data.description || null,
      isActive: true,
      isCompleted: false,
    })

    return response.created({
      message: 'Objectif créé',
      data: goal,
    })
  }

  /**
   * Mettre à jour un objectif
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const goal = await Goal.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!goal) {
      return response.notFound({
        message: 'Objectif non trouvé',
      })
    }

    const data = request.only([
      'type',
      'targetValue',
      'period',
      'startDate',
      'endDate',
      'title',
      'description',
      'isActive',
      'isCompleted',
    ])

    if (data.startDate) {
      data.startDate = DateTime.fromISO(data.startDate)
    }
    if (data.endDate) {
      data.endDate = DateTime.fromISO(data.endDate)
    }

    goal.merge(data)
    await goal.save()

    return response.ok({
      message: 'Objectif mis à jour',
      data: goal,
    })
  }

  /**
   * Supprimer un objectif
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const goal = await Goal.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!goal) {
      return response.notFound({
        message: 'Objectif non trouvé',
      })
    }

    await goal.delete()

    return response.ok({
      message: 'Objectif supprimé',
    })
  }

  /**
   * Calculer la progression d'un objectif
   */
  private async calculateProgress(goal: Goal, userId: number): Promise<number> {
    const activities = await Activity.query()
      .where('user_id', userId)
      .where('date', '>=', goal.startDate.toSQLDate()!)
      .where('date', '<=', goal.endDate.toSQLDate()!)

    switch (goal.type) {
      case 'distance':
        return activities.reduce((sum, a) => sum + a.distance, 0)

      case 'duration':
        return activities.reduce((sum, a) => sum + a.duration, 0)

      case 'trimp':
        return activities.reduce((sum, a) => sum + (a.trimp || 0), 0)

      case 'activities_count':
        return activities.length

      default:
        return 0
    }
  }
}
