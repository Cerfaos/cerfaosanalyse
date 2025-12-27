import type { HttpContext } from '@adonisjs/core/http'
import TrainingProgram from '#models/training_program'
import PlannedSession from '#models/planned_session'
import TrainingTemplate from '#models/training_template'
import { DateTime } from 'luxon'
import type { ProgramLevel, ProgramObjective } from '#models/training_program'

export default class TrainingProgramsController {
  /**
   * Liste tous les programmes (système + utilisateur)
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const objective = request.input('objective') as ProgramObjective | undefined
    const level = request.input('level') as ProgramLevel | undefined

    let query = TrainingProgram.query()
      .where((builder) => {
        // Programmes système publics OU programmes de l'utilisateur
        builder.where('is_public', true).orWhere('user_id', user.id)
      })
      .orderBy('is_default', 'desc')
      .orderBy('name')

    if (objective) {
      query = query.where('objective', objective)
    }

    if (level) {
      query = query.where('level', level)
    }

    const programs = await query

    return response.ok({
      data: {
        programs: programs.map((p) => ({
          ...p.toJSON(),
          totalSessions: p.getTotalSessions(),
          averageSessionsPerWeek: p.getAverageSessionsPerWeek(),
        })),
        objectives: TrainingProgram.getObjectiveLabels(),
        levels: TrainingProgram.getLevelLabels(),
        weekThemes: TrainingProgram.getWeekThemes(),
      },
    })
  }

  /**
   * Récupère un programme par son ID avec détails complets
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const program = await TrainingProgram.query()
      .where('id', params.id)
      .where((builder) => {
        builder.where('is_public', true).orWhere('user_id', user.id)
      })
      .first()

    if (!program) {
      return response.notFound({ message: 'Programme non trouvé' })
    }

    // Récupérer les détails des templates utilisés
    const templateIds = new Set<number>()
    program.weeklySchedule.forEach((week) => {
      week.sessions.forEach((session) => {
        templateIds.add(session.templateId)
      })
    })

    const templates = await TrainingTemplate.query().whereIn('id', [...templateIds])
    const templateMap = new Map(templates.map((t) => [t.id, t]))

    // Enrichir le planning avec les détails des templates
    const enrichedSchedule = program.weeklySchedule.map((week) => ({
      ...week,
      sessions: week.sessions.map((session) => ({
        ...session,
        template: templateMap.get(session.templateId)?.toJSON() || null,
      })),
    }))

    return response.ok({
      data: {
        ...program.toJSON(),
        enrichedSchedule,
        totalSessions: program.getTotalSessions(),
        averageSessionsPerWeek: program.getAverageSessionsPerWeek(),
      },
    })
  }

  /**
   * Crée un nouveau programme
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const data = request.only([
      'name',
      'description',
      'durationWeeks',
      'objective',
      'level',
      'weeklySchedule',
      'isPublic',
      'estimatedWeeklyTss',
      'estimatedWeeklyHours',
    ])

    // Validation
    if (!data.name) {
      return response.badRequest({ message: 'Nom requis' })
    }

    if (!data.weeklySchedule || !Array.isArray(data.weeklySchedule)) {
      return response.badRequest({ message: 'Planning hebdomadaire requis' })
    }

    const program = await TrainingProgram.create({
      ...data,
      userId: user.id,
      isDefault: false,
      durationWeeks: data.durationWeeks || data.weeklySchedule.length,
      level: data.level || 'intermediaire',
    })

    return response.created({
      message: 'Programme créé',
      data: program,
    })
  }

  /**
   * Met à jour un programme
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    // On ne peut modifier que ses propres programmes
    const program = await TrainingProgram.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('is_default', false)
      .first()

    if (!program) {
      return response.notFound({
        message: 'Programme non trouvé ou non modifiable',
      })
    }

    const data = request.only([
      'name',
      'description',
      'durationWeeks',
      'objective',
      'level',
      'weeklySchedule',
      'isPublic',
      'estimatedWeeklyTss',
      'estimatedWeeklyHours',
    ])

    program.merge(data)
    await program.save()

    return response.ok({
      message: 'Programme mis à jour',
      data: program,
    })
  }

  /**
   * Supprime un programme
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const program = await TrainingProgram.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('is_default', false)
      .first()

    if (!program) {
      return response.notFound({
        message: 'Programme non trouvé ou non supprimable',
      })
    }

    await program.delete()

    return response.ok({
      message: 'Programme supprimé',
    })
  }

  /**
   * Duplique un programme (système ou utilisateur)
   */
  async duplicate({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const program = await TrainingProgram.query()
      .where('id', params.id)
      .where((builder) => {
        builder.where('is_public', true).orWhere('user_id', user.id)
      })
      .first()

    if (!program) {
      return response.notFound({ message: 'Programme non trouvé' })
    }

    const newName = request.input('name') || `${program.name} (copie)`

    const duplicate = await TrainingProgram.create({
      userId: user.id,
      name: newName,
      description: program.description,
      durationWeeks: program.durationWeeks,
      objective: program.objective,
      level: program.level,
      weeklySchedule: program.weeklySchedule,
      isDefault: false,
      isPublic: false,
      estimatedWeeklyTss: program.estimatedWeeklyTss,
      estimatedWeeklyHours: program.estimatedWeeklyHours,
    })

    return response.created({
      message: 'Programme dupliqué',
      data: duplicate,
    })
  }

  /**
   * Applique un programme au calendrier à partir d'une date
   */
  async apply({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const program = await TrainingProgram.query()
      .where('id', params.id)
      .where((builder) => {
        builder.where('is_public', true).orWhere('user_id', user.id)
      })
      .first()

    if (!program) {
      return response.notFound({ message: 'Programme non trouvé' })
    }

    const startDateInput = request.input('startDate')
    if (!startDateInput) {
      return response.badRequest({ message: 'Date de début requise' })
    }

    const startDate = DateTime.fromISO(startDateInput)
    if (!startDate.isValid) {
      return response.badRequest({ message: 'Date de début invalide' })
    }

    // Optionnel: supprimer les anciennes séances planifiées dans la période
    const clearExisting = request.input('clearExisting', false)
    const endDate = startDate.plus({ weeks: program.durationWeeks })

    if (clearExisting) {
      await PlannedSession.query()
        .where('user_id', user.id)
        .where('planned_date', '>=', startDate.toSQLDate()!)
        .where('planned_date', '<=', endDate.toSQLDate()!)
        .delete()
    }

    // Créer les séances planifiées
    const createdSessions: PlannedSession[] = []
    const TrainingSession = (await import('#models/training_session')).default

    for (const week of program.weeklySchedule) {
      for (const session of week.sessions) {
        // Calculer la date de la séance
        // week.weekNumber commence à 1, dayOfWeek va de 0 (Dimanche) à 6 (Samedi)
        const weekOffset = week.weekNumber - 1
        const weekStart = startDate.plus({ weeks: weekOffset }).startOf('week')
        const sessionDate = weekStart.plus({ days: session.dayOfWeek })

        // Récupérer le template pour créer une session
        const template = await TrainingTemplate.find(session.templateId)
        if (!template) continue

        // Créer une TrainingSession basée sur le template
        const trainingSession = await TrainingSession.create({
          userId: user.id,
          templateId: template.id,
          name: template.name,
          category: template.category,
          level: template.level,
          location: template.location,
          intensityRef: template.intensityRef,
          duration: template.duration,
          tss: template.tss,
          description: session.notes || template.description,
          blocks: template.blocks,
          exercises: template.exercises,
        })

        // Créer la PlannedSession
        const plannedSession = await PlannedSession.create({
          userId: user.id,
          sessionId: trainingSession.id,
          plannedDate: sessionDate,
          order: 0,
          completed: false,
          notes: session.notes || null,
          programId: program.id,
          programWeek: week.weekNumber,
          programTheme: week.theme,
        })

        createdSessions.push(plannedSession)
      }
    }

    return response.ok({
      message: `Programme appliqué : ${createdSessions.length} séances planifiées`,
      data: {
        programId: program.id,
        programName: program.name,
        startDate: startDate.toISODate(),
        endDate: endDate.toISODate(),
        sessionsCreated: createdSessions.length,
      },
    })
  }

  /**
   * Prévisualisation de l'application d'un programme (sans créer les séances)
   */
  async preview({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const program = await TrainingProgram.query()
      .where('id', params.id)
      .where((builder) => {
        builder.where('is_public', true).orWhere('user_id', user.id)
      })
      .first()

    if (!program) {
      return response.notFound({ message: 'Programme non trouvé' })
    }

    const startDateInput = request.input('startDate')
    if (!startDateInput) {
      return response.badRequest({ message: 'Date de début requise' })
    }

    const startDate = DateTime.fromISO(startDateInput)
    if (!startDate.isValid) {
      return response.badRequest({ message: 'Date de début invalide' })
    }

    // Récupérer les templates
    const templateIds = new Set<number>()
    program.weeklySchedule.forEach((week) => {
      week.sessions.forEach((session) => {
        templateIds.add(session.templateId)
      })
    })
    const templates = await TrainingTemplate.query().whereIn('id', [...templateIds])
    const templateMap = new Map(templates.map((t) => [t.id, t]))

    // Générer la prévisualisation
    const preview: Array<{
      date: string
      dayName: string
      weekNumber: number
      theme: string
      templateName: string
      templateId: number
      duration: number
      tss: number
      notes: string | null
    }> = []

    for (const week of program.weeklySchedule) {
      for (const session of week.sessions) {
        const weekOffset = week.weekNumber - 1
        const weekStart = startDate.plus({ weeks: weekOffset }).startOf('week')
        const sessionDate = weekStart.plus({ days: session.dayOfWeek })
        const template = templateMap.get(session.templateId)

        preview.push({
          date: sessionDate.toISODate()!,
          dayName: sessionDate.toFormat('EEEE', { locale: 'fr' }),
          weekNumber: week.weekNumber,
          theme: week.theme,
          templateName: template?.name || 'Template inconnu',
          templateId: session.templateId,
          duration: template?.duration || 0,
          tss: template?.tss || 0,
          notes: session.notes || null,
        })
      }
    }

    // Trier par date
    preview.sort((a, b) => a.date.localeCompare(b.date))

    // Résumé par semaine
    const weekSummary = program.weeklySchedule.map((week) => ({
      weekNumber: week.weekNumber,
      theme: week.theme,
      sessionsCount: week.sessions.length,
      totalDuration: week.sessions.reduce((sum, s) => {
        const t = templateMap.get(s.templateId)
        return sum + (t?.duration || 0)
      }, 0),
      totalTss: week.sessions.reduce((sum, s) => {
        const t = templateMap.get(s.templateId)
        return sum + (t?.tss || 0)
      }, 0),
    }))

    return response.ok({
      data: {
        program: {
          id: program.id,
          name: program.name,
          durationWeeks: program.durationWeeks,
        },
        startDate: startDate.toISODate(),
        endDate: startDate.plus({ weeks: program.durationWeeks }).toISODate(),
        preview,
        weekSummary,
        totalSessions: preview.length,
        totalDuration: preview.reduce((sum, s) => sum + s.duration, 0),
        totalTss: preview.reduce((sum, s) => sum + s.tss, 0),
      },
    })
  }
}
