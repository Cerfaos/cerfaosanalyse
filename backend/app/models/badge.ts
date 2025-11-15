import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Badge extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare icon: string

  @column()
  declare category: 'distance' | 'activities' | 'elevation' | 'streak' | 'special' | 'time'

  @column()
  declare level: number

  @column()
  declare conditionType: 'total_distance' | 'total_activities' | 'total_elevation' | 'consecutive_days' | 'total_time' | 'special'

  @column()
  declare conditionValue: number | null

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}