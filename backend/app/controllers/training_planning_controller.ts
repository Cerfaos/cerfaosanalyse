import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PlannedSession from '#models/planned_session'
import TrainingSession from '#models/training_session'

export default class TrainingPlanningController {
  /**
   * Récupérer le planning (par mois ou période)
   * Retourne les séances groupées par date
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { start, end, month, year } = request.qs()

    let startDate: DateTime
    let endDate: DateTime

    if (month && year) {
      startDate = DateTime.fromObject({ year: Number.parseInt(year), month: Number.parseInt(month), day: 1 })
      endDate = startDate.endOf('month')
    } else if (start && end) {
      startDate = DateTime.fromISO(start)
      endDate = DateTime.fromISO(end)
    } else {
      // Par défaut : mois courant
      startDate = DateTime.now().startOf('month')
      endDate = DateTime.now().endOf('month')
    }

    const planned = await PlannedSession.query()
      .where('userId', user.id)
      .whereBetween('plannedDate', [startDate.toSQLDate()!, endDate.toSQLDate()!])
      .preload('session')
      .orderBy('plannedDate', 'asc')
      .orderBy('order', 'asc')

    // Grouper par date - sérialiser explicitement pour inclure les relations
    const grouped: Record<string, object[]> = {}
    for (const p of planned) {
      const dateKey = p.plannedDate.toISODate()!
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      // Sérialiser le modèle pour inclure la relation 'session'
      grouped[dateKey].push(p.serialize())
    }

    return response.ok({
      message: 'Planning récupéré',
      data: {
        startDate: startDate.toISODate(),
        endDate: endDate.toISODate(),
        planning: grouped,
      },
    })
  }

  /**
   * Ajouter une séance au planning
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { sessionId, date } = request.only(['sessionId', 'date'])

    if (!sessionId || !date) {
      return response.badRequest({
        message: 'sessionId et date sont requis',
      })
    }

    // Vérifier que la séance appartient à l'utilisateur
    const session = await TrainingSession.query()
      .where('id', sessionId)
      .where('userId', user.id)
      .first()

    if (!session) {
      return response.notFound({
        message: 'Séance non trouvée',
      })
    }

    // Vérifier si cette séance est déjà planifiée ce jour
    const existing = await PlannedSession.query()
      .where('userId', user.id)
      .where('sessionId', sessionId)
      .where('plannedDate', date)
      .first()

    if (existing) {
      return response.conflict({
        message: 'Cette séance est déjà planifiée pour cette date',
      })
    }

    // Compter les séances déjà planifiées ce jour pour l'ordre
    const count = await PlannedSession.query()
      .where('userId', user.id)
      .where('plannedDate', date)
      .count('* as total')

    const planned = await PlannedSession.create({
      userId: user.id,
      sessionId,
      plannedDate: DateTime.fromISO(date),
      order: Number(count[0].$extras.total),
      completed: false,
    })

    await planned.load('session')

    return response.created({
      message: 'Séance ajoutée au planning',
      data: planned,
    })
  }

  /**
   * Retirer une séance du planning
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const planned = await PlannedSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!planned) {
      return response.notFound({
        message: 'Séance planifiée non trouvée',
      })
    }

    await planned.delete()

    return response.ok({
      message: 'Séance retirée du planning',
    })
  }

  /**
   * Marquer une séance comme complétée
   */
  async complete({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { activityId, notes } = request.only(['activityId', 'notes'])

    const planned = await PlannedSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!planned) {
      return response.notFound({
        message: 'Séance planifiée non trouvée',
      })
    }

    planned.completed = true
    planned.completedAt = DateTime.now()
    planned.activityId = activityId || null
    planned.notes = notes || null

    await planned.save()
    await planned.load('session')

    return response.ok({
      message: 'Séance marquée comme complétée',
      data: planned,
    })
  }

  /**
   * Annuler la complétion d'une séance
   */
  async uncomplete({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const planned = await PlannedSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!planned) {
      return response.notFound({
        message: 'Séance planifiée non trouvée',
      })
    }

    planned.completed = false
    planned.completedAt = null
    planned.activityId = null

    await planned.save()
    await planned.load('session')

    return response.ok({
      message: 'Complétion annulée',
      data: planned,
    })
  }

  /**
   * Statistiques de la semaine
   */
  async weekStats({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { date } = request.qs()

    const refDate = date ? DateTime.fromISO(date) : DateTime.now()
    const startOfWeek = refDate.startOf('week')
    const endOfWeek = refDate.endOf('week')

    const planned = await PlannedSession.query()
      .where('userId', user.id)
      .whereBetween('plannedDate', [startOfWeek.toSQLDate()!, endOfWeek.toSQLDate()!])
      .preload('session')

    let totalDuration = 0
    let totalTss = 0
    let completedCount = 0
    const byCategory: Record<string, { count: number; duration: number; tss: number }> = {
      cycling: { count: 0, duration: 0, tss: 0 },
      ppg: { count: 0, duration: 0, tss: 0 },
    }

    for (const p of planned) {
      totalDuration += p.session.duration || 0
      totalTss += p.session.tss || 0

      if (p.completed) {
        completedCount++
      }

      const cat = p.session.category
      if (byCategory[cat]) {
        byCategory[cat].count++
        byCategory[cat].duration += p.session.duration || 0
        byCategory[cat].tss += p.session.tss || 0
      }
    }

    return response.ok({
      message: 'Statistiques de la semaine',
      data: {
        startDate: startOfWeek.toISODate(),
        endDate: endOfWeek.toISODate(),
        sessionCount: planned.length,
        completedCount,
        completionRate: planned.length > 0 ? Math.round((completedCount / planned.length) * 100) : 0,
        totalDuration,
        totalTss,
        byCategory,
      },
    })
  }

  /**
   * Déplacer une séance à une autre date
   */
  async move({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { newDate } = request.only(['newDate'])

    if (!newDate) {
      return response.badRequest({
        message: 'newDate est requis',
      })
    }

    const planned = await PlannedSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!planned) {
      return response.notFound({
        message: 'Séance planifiée non trouvée',
      })
    }

    // Compter les séances à la nouvelle date pour l'ordre
    const count = await PlannedSession.query()
      .where('userId', user.id)
      .where('plannedDate', newDate)
      .count('* as total')

    planned.plannedDate = DateTime.fromISO(newDate)
    planned.order = Number(count[0].$extras.total)

    await planned.save()
    await planned.load('session')

    return response.ok({
      message: 'Séance déplacée',
      data: planned,
    })
  }
}
