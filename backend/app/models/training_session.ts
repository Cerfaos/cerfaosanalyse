import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import TrainingTemplate from './training_template.js'
import PlannedSession from './planned_session.js'
import type {
  CyclingBlock,
  PpgExercise,
  SessionCategory,
  SessionLevel,
  SessionLocation,
} from './training_template.js'

export default class TrainingSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare templateId: number | null

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TrainingTemplate)
  declare template: BelongsTo<typeof TrainingTemplate>

  @hasMany(() => PlannedSession)
  declare plannedSessions: HasMany<typeof PlannedSession>
}
