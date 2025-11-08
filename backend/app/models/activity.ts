import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Equipment from './equipment.js'

interface GpsPoint {
  lat: number
  lng: number
  time: number
  hr?: number
  speed?: number
  altitude?: number
}

export default class Activity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Relations
  @column()
  declare userId: number

  @column()
  declare equipmentId: number | null

  // Informations de base
  @column.dateTime()
  declare date: DateTime

  @column()
  declare type: string

  @column()
  declare duration: number

  @column()
  declare distance: number

  // Données cardiaques
  @column()
  declare avgHeartRate: number | null

  @column()
  declare maxHeartRate: number | null

  // Données de vitesse
  @column()
  declare avgSpeed: number | null

  @column()
  declare maxSpeed: number | null

  // Données de puissance
  @column()
  declare avgPower: number | null

  @column()
  declare normalizedPower: number | null

  // Autres données
  @column()
  declare avgCadence: number | null

  // Métriques calculées
  @column()
  declare calories: number | null

  @column()
  declare elevationGain: number | null

  @column()
  declare trimp: number | null

  // Données GPS (JSON)
  @column()
  declare gpsData: string | null

  // Fichier source
  @column()
  declare fileName: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Equipment)
  declare equipment: BelongsTo<typeof Equipment>
}