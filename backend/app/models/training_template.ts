import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import TrainingSession from './training_session.js'

// Types pour les blocs d'entraînement cycling
export type BlockType = 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown'

export interface CyclingBlock {
  type: BlockType
  duration: string // Format "MM:SS"
  percentFtp: number // % de la FTP (pas de watts en dur)
  reps: number
  notes?: string
}

// Types pour les exercices PPG
export interface PpgExercise {
  name: string
  duration: string // Format "MM:SS"
  reps: number | null
  sets: number
  rest: string // Format "MM:SS"
  hrTarget?: string // Ex: "115-153"
  notes?: string
}

// Types pour la catégorie, niveau et lieu
export type SessionCategory = 'cycling' | 'ppg'
export type SessionLevel = 'beginner' | 'intermediate' | 'expert'
export type SessionLocation = 'indoor' | 'outdoor' | 'both'

export default class TrainingTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare name: string

  @column()
  declare category: SessionCategory

  @column()
  declare level: SessionLevel

  @column()
  declare location: SessionLocation | null

  @column()
  declare intensityRef: string

  @column()
  declare week: number | null

  @column()
  declare duration: number

  @column()
  declare tss: number | null

  @column()
  declare description: string | null

  @column({
    prepare: (value: CyclingBlock[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | CyclingBlock[] | null) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare blocks: CyclingBlock[] | null

  @column({
    prepare: (value: PpgExercise[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | PpgExercise[] | null) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare exercises: PpgExercise[] | null

  @column()
  declare isDefault: boolean

  @column()
  declare isPublic: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TrainingSession)
  declare sessions: HasMany<typeof TrainingSession>
}
