import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export type PpgCategory = 'jambes' | 'core' | 'bras' | 'cardio'
export type DifficultyLevel = 'debutant' | 'intermediaire' | 'avance'

export default class PpgExercise extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare category: PpgCategory

  @column()
  declare description: string | null

  @column()
  declare targetMuscles: string | null

  @column()
  declare difficulty: DifficultyLevel

  @column()
  declare defaultDuration: string | null

  @column()
  declare defaultReps: number | null

  @column()
  declare defaultSets: number

  @column()
  declare imageUrl: string | null

  @column()
  declare videoUrl: string | null

  @column()
  declare isDefault: boolean

  @column()
  declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Retourne la durée en secondes
   */
  getDurationSeconds(): number | null {
    if (!this.defaultDuration) return null
    const [minutes, seconds] = this.defaultDuration.split(':').map(Number)
    return (minutes || 0) * 60 + (seconds || 0)
  }

  /**
   * Retourne un résumé formaté de l'exercice
   */
  getFormattedSummary(): string {
    if (this.defaultReps) {
      return `${this.defaultSets}×${this.defaultReps} reps`
    }
    if (this.defaultDuration) {
      return `${this.defaultSets}×${this.defaultDuration}`
    }
    return `${this.defaultSets} séries`
  }

  /**
   * Catégories disponibles avec leurs labels
   */
  static getCategoryLabels(): Record<PpgCategory, string> {
    return {
      jambes: 'Jambes',
      core: 'Core / Gainage',
      bras: 'Bras / Haut du corps',
      cardio: 'Cardio',
    }
  }

  /**
   * Niveaux de difficulté avec leurs labels
   */
  static getDifficultyLabels(): Record<DifficultyLevel, string> {
    return {
      debutant: 'Débutant',
      intermediaire: 'Intermédiaire',
      avance: 'Avancé',
    }
  }
}
