import type { HttpContext } from '@adonisjs/core/http'
import PpgExercise from '#models/ppg_exercise'
import type { PpgCategory, DifficultyLevel } from '#models/ppg_exercise'

export default class PpgExercisesController {
  /**
   * Liste tous les exercices PPG (système + utilisateur)
   * Filtrable par catégorie et difficulté
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const category = request.input('category') as PpgCategory | undefined
    const difficulty = request.input('difficulty') as DifficultyLevel | undefined
    const search = request.input('search') as string | undefined

    let query = PpgExercise.query()
      .where((builder) => {
        // Exercices système OU exercices de l'utilisateur
        builder.where('is_default', true).orWhere('user_id', user.id)
      })
      .orderBy('category')
      .orderBy('difficulty')
      .orderBy('name')

    if (category) {
      query = query.where('category', category)
    }

    if (difficulty) {
      query = query.where('difficulty', difficulty)
    }

    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike('name', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereILike('target_muscles', `%${search}%`)
      })
    }

    const exercises = await query

    // Grouper par catégorie pour le frontend
    const grouped = {
      jambes: exercises.filter((e) => e.category === 'jambes'),
      core: exercises.filter((e) => e.category === 'core'),
      bras: exercises.filter((e) => e.category === 'bras'),
      cardio: exercises.filter((e) => e.category === 'cardio'),
    }

    return response.ok({
      data: {
        exercises,
        grouped,
        categories: PpgExercise.getCategoryLabels(),
        difficulties: PpgExercise.getDifficultyLabels(),
        total: exercises.length,
      },
    })
  }

  /**
   * Récupère un exercice par son ID
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const exercise = await PpgExercise.query()
      .where('id', params.id)
      .where((builder) => {
        builder.where('is_default', true).orWhere('user_id', user.id)
      })
      .first()

    if (!exercise) {
      return response.notFound({ message: 'Exercice non trouvé' })
    }

    return response.ok({
      data: exercise,
    })
  }

  /**
   * Crée un exercice personnalisé
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const data = request.only([
      'name',
      'category',
      'description',
      'targetMuscles',
      'difficulty',
      'defaultDuration',
      'defaultReps',
      'defaultSets',
      'imageUrl',
      'videoUrl',
    ])

    // Validation
    if (!data.name || !data.category) {
      return response.badRequest({ message: 'Nom et catégorie requis' })
    }

    if (!['jambes', 'core', 'bras', 'cardio'].includes(data.category)) {
      return response.badRequest({ message: 'Catégorie invalide' })
    }

    const exercise = await PpgExercise.create({
      ...data,
      userId: user.id,
      isDefault: false,
      defaultSets: data.defaultSets || 3,
      difficulty: data.difficulty || 'intermediaire',
    })

    return response.created({
      message: 'Exercice créé',
      data: exercise,
    })
  }

  /**
   * Met à jour un exercice personnalisé
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    // On ne peut modifier que ses propres exercices
    const exercise = await PpgExercise.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('is_default', false)
      .first()

    if (!exercise) {
      return response.notFound({
        message: 'Exercice non trouvé ou non modifiable',
      })
    }

    const data = request.only([
      'name',
      'category',
      'description',
      'targetMuscles',
      'difficulty',
      'defaultDuration',
      'defaultReps',
      'defaultSets',
      'imageUrl',
      'videoUrl',
    ])

    exercise.merge(data)
    await exercise.save()

    return response.ok({
      message: 'Exercice mis à jour',
      data: exercise,
    })
  }

  /**
   * Supprime un exercice personnalisé
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    // On ne peut supprimer que ses propres exercices
    const exercise = await PpgExercise.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .where('is_default', false)
      .first()

    if (!exercise) {
      return response.notFound({
        message: 'Exercice non trouvé ou non supprimable',
      })
    }

    await exercise.delete()

    return response.ok({
      message: 'Exercice supprimé',
    })
  }
}
