import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Equipment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  // Informations de base
  @column()
  declare name: string

  @column()
  declare type: string

  @column()
  declare brand: string | null

  @column()
  declare model: string | null

  // Suivi du kilométrage
  @column()
  declare initialDistance: number

  @column()
  declare currentDistance: number

  @column()
  declare alertDistance: number | null

  // Dates importantes
  @column.date()
  declare purchaseDate: DateTime | null

  @column.date()
  declare retirementDate: DateTime | null

  // Status
  @column()
  declare isActive: boolean

  // Notes
  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}