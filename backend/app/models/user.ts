import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Activity from './activity.js'
import WeightHistory from './weight_history.js'
import Equipment from './equipment.js'
import TrainingSession from './training_session.js'
import PlannedSession from './planned_session.js'

// Type pour l'historique FTP
export interface FtpHistoryEntry {
  ftp: number
  date: string // ISO date string
}

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  // Paramètres physiologiques cyclistes
  @column()
  declare fcMax: number | null

  @column()
  declare fcRepos: number | null

  @column()
  declare ftp: number | null // Functional Threshold Power (watts)

  @column()
  declare weightCurrent: number | null

  @column({
    prepare: (value: FtpHistoryEntry[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | FtpHistoryEntry[] | null) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare ftpHistory: FtpHistoryEntry[] | null

  // Préférences UI
  @column()
  declare theme: 'light' | 'dark'

  @column({ columnName: 'avatar_url' })
  declare avatarUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @hasMany(() => Activity)
  declare activities: HasMany<typeof Activity>

  @hasMany(() => WeightHistory)
  declare weightHistories: HasMany<typeof WeightHistory>

  @hasMany(() => Equipment)
  declare equipment: HasMany<typeof Equipment>

  @hasMany(() => TrainingSession)
  declare trainingSessions: HasMany<typeof TrainingSession>

  @hasMany(() => PlannedSession)
  declare plannedSessions: HasMany<typeof PlannedSession>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
