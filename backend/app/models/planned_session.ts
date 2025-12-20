import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import TrainingSession from './training_session.js'
import Activity from './activity.js'

export default class PlannedSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare sessionId: number

  @column.date()
  declare plannedDate: DateTime

  @column()
  declare order: number

  @column()
  declare completed: boolean

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare activityId: number | null

  // Champs liés aux programmes
  @column()
  declare programId: number | null

  @column()
  declare programWeek: number | null

  @column()
  declare programTheme: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TrainingSession, {
    foreignKey: 'sessionId',
  })
  declare session: BelongsTo<typeof TrainingSession>

  @belongsTo(() => Activity)
  declare activity: BelongsTo<typeof Activity>
}
