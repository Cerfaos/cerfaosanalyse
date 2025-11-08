import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class WeightHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Relations
  @column()
  declare userId: number

  // Données de poids
  @column.date()
  declare date: DateTime

  @column()
  declare weight: number

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}