import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Activity from './activity.js'

export default class PersonalRecord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare activityId: number

  @column()
  declare recordType: string

  @column()
  declare activityType: string

  @column()
  declare value: number

  @column.dateTime()
  declare achievedAt: DateTime

  @column()
  declare previousValue: number | null

  @column.dateTime()
  declare previousAchievedAt: DateTime | null

  @column()
  declare isCurrent: boolean

  @column()
  declare unit: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Activity)
  declare activity: BelongsTo<typeof Activity>
}
