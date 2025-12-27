import type { HttpContext } from '@adonisjs/core/http'
import TrainingTemplate from '#models/training_template'
import { createTemplateValidator, updateTemplateValidator } from '#validators/training_template'

export default class TrainingTemplatesController {
  /**
   * Liste des templates (défaut + utilisateur)
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const category = request.input('category')
    const week = request.input('week')

    const query = TrainingTemplate.query()
      .where((q) => {
        q.where('isDefault', true).orWhere('userId', user.id)
      })
      .orderBy('week', 'asc')
      .orderBy('name', 'asc')

    if (category) {
      query.where('category', category)
    }

    if (week) {
      query.where('week', week)
    }

    const templates = await query

    return response.ok({
      message: 'Templates récupérés',
      data: templates,
    })
  }

  /**
   * Détails d'un template
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const template = await TrainingTemplate.query()
      .where('id', params.id)
      .where((q) => {
        q.where('isDefault', true).orWhere('userId', user.id)
      })
      .first()

    if (!template) {
      return response.notFound({
        message: 'Template non trouvé',
      })
    }

    return response.ok({
      message: 'Template récupéré',
      data: template,
    })
  }

  /**
   * Créer un template personnel
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createTemplateValidator)

    const template = await TrainingTemplate.create({
      ...payload,
      userId: user.id,
      isDefault: false,
      isPublic: false,
    })

    return response.created({
      message: 'Template créé avec succès',
      data: template,
    })
  }

  /**
   * Modifier un template (personnel ou par défaut)
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    // Permettre la modification des templates personnels OU par défaut
    const template = await TrainingTemplate.query()
      .where('id', params.id)
      .where((q) => {
        q.where('userId', user.id).orWhere('isDefault', true)
      })
      .first()

    if (!template) {
      return response.notFound({
        message: 'Template non trouvé',
      })
    }

    const payload = await request.validateUsing(updateTemplateValidator)

    template.merge(payload)
    await template.save()

    return response.ok({
      message: 'Template mis à jour',
      data: template,
    })
  }

  /**
   * Supprimer un template (personnel ou par défaut)
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    // Permettre la suppression des templates personnels OU par défaut
    const template = await TrainingTemplate.query()
      .where('id', params.id)
      .where((q) => {
        q.where('userId', user.id).orWhere('isDefault', true)
      })
      .first()

    if (!template) {
      return response.notFound({
        message: 'Template non trouvé',
      })
    }

    await template.delete()

    return response.ok({
      message: 'Template supprimé',
    })
  }

  /**
   * Dupliquer un template
   */
  async duplicate({ auth, params, response }: HttpContext) {
    const user = auth.user!

    // On peut dupliquer n'importe quel template accessible (default ou perso)
    const original = await TrainingTemplate.query()
      .where('id', params.id)
      .where((q) => {
        q.where('isDefault', true).orWhere('userId', user.id)
      })
      .first()

    if (!original) {
      return response.notFound({
        message: 'Template non trouvé',
      })
    }

    const duplicate = await TrainingTemplate.create({
      userId: user.id,
      name: `${original.name} (copie)`,
      category: original.category,
      level: original.level,
      location: original.location,
      intensityRef: original.intensityRef,
      week: original.week,
      duration: original.duration,
      tss: original.tss,
      description: original.description,
      blocks: original.blocks,
      exercises: original.exercises,
      isDefault: false,
      isPublic: false,
    })

    return response.created({
      message: 'Template dupliqué avec succès',
      data: duplicate,
    })
  }
}
