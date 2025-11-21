import type { HttpContext } from '@adonisjs/core/http'
import TrainingPlanService from '#services/training_plan_service'
import TrainingPlan from '#models/training_plan'
import { DateTime } from 'luxon'

export default class TrainingPlansController {
  /**
   * Générer un plan d'entraînement sur 4 semaines
   */
  async generate({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const config = request.only(['goal', 'weeklyHours', 'preferredDays', 'mainActivityType', 'customSchedule'])
    const customSchedule = Array.isArray(config.customSchedule)
      ? (config.customSchedule as Array<{
          dayOfWeek: number
          sessions: { type: string; duration?: number }[]
        }>)
      : undefined

    try {
      const plan = await TrainingPlanService.generatePlan(userId, {
        goal: config.goal,
        weeklyHours: config.weeklyHours ? parseFloat(config.weeklyHours) : undefined,
        preferredDays: config.preferredDays,
        mainActivityType: config.mainActivityType,
        customSchedule,
      })

      return response.ok({
        data: plan,
        message: 'Plan d\'entraînement généré avec succès',
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Obtenir une recommandation pour la prochaine séance
   */
  async nextSession({ auth, response }: HttpContext) {
    const userId = auth.user!.id

    try {
      const recommendation = await TrainingPlanService.getNextSessionRecommendation(userId)

      if (!recommendation) {
        return response.ok({
          data: null,
          message: 'Aucune recommandation disponible',
        })
      }

      return response.ok({
        data: recommendation,
        message: 'Recommandation générée',
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Sauvegarder un plan généré en base de données
   */
  async save({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const { plan, config, name } = request.only(['plan', 'config', 'name'])

    if (!plan || !Array.isArray(plan) || plan.length === 0) {
      return response.badRequest({ message: 'Plan invalide' })
    }

    if (!config) {
      return response.badRequest({ message: 'Configuration manquante' })
    }

    try {
      // Désactiver les anciens plans actifs
      await TrainingPlan.query()
        .where('userId', userId)
        .where('isActive', true)
        .update({ isActive: false })

      // Créer le nouveau plan
      const trainingPlan = await TrainingPlan.create({
        userId,
        goal: config.goal,
        weeklyHours: config.weeklyHours,
        mainActivityType: config.mainActivityType,
        preferredDays: JSON.stringify(config.preferredDays),
        planData: JSON.stringify(plan),
        name: name || `Plan du ${DateTime.now().toFormat('dd/MM/yyyy')}`,
        isActive: true,
        startDate: DateTime.fromISO(plan[0].startDate),
        endDate: DateTime.fromISO(plan[plan.length - 1].endDate),
      })

      return response.ok({
        data: {
          id: trainingPlan.id,
          name: trainingPlan.name,
          startDate: trainingPlan.startDate,
          endDate: trainingPlan.endDate,
        },
        message: 'Plan sauvegardé avec succès',
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Charger le plan actif ou un plan spécifique
   */
  async load({ auth, response, params }: HttpContext) {
    const userId = auth.user!.id

    try {
      let trainingPlan: TrainingPlan | null

      if (params.id) {
        trainingPlan = await TrainingPlan.query()
          .where('userId', userId)
          .where('id', params.id)
          .first()
      } else {
        trainingPlan = await TrainingPlan.query()
          .where('userId', userId)
          .where('isActive', true)
          .first()
      }

      if (!trainingPlan) {
        return response.ok({
          data: null,
          message: 'Aucun plan trouvé',
        })
      }

      return response.ok({
        data: {
          id: trainingPlan.id,
          name: trainingPlan.name,
          goal: trainingPlan.goal,
          weeklyHours: trainingPlan.weeklyHours,
          mainActivityType: trainingPlan.mainActivityType,
          preferredDays: JSON.parse(trainingPlan.preferredDays),
          plan: JSON.parse(trainingPlan.planData),
          isActive: trainingPlan.isActive,
          startDate: trainingPlan.startDate,
          endDate: trainingPlan.endDate,
          createdAt: trainingPlan.createdAt,
        },
        message: 'Plan chargé',
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Lister tous les plans de l'utilisateur
   */
  async list({ auth, response }: HttpContext) {
    const userId = auth.user!.id

    try {
      const plans = await TrainingPlan.query()
        .where('userId', userId)
        .orderBy('createdAt', 'desc')
        .select(['id', 'name', 'goal', 'weeklyHours', 'mainActivityType', 'isActive', 'startDate', 'endDate', 'createdAt'])

      return response.ok({
        data: plans,
        message: 'Liste des plans',
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Supprimer un plan
   */
  async delete({ auth, response, params }: HttpContext) {
    const userId = auth.user!.id

    try {
      const trainingPlan = await TrainingPlan.query()
        .where('userId', userId)
        .where('id', params.id)
        .first()

      if (!trainingPlan) {
        return response.notFound({ message: 'Plan non trouvé' })
      }

      await trainingPlan.delete()

      return response.ok({
        message: 'Plan supprimé',
      })
    } catch (error: any) {
      return response.badRequest({ message: error.message })
    }
  }
}
