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
  declare weightCurrent: number | null

  // Préférences UI
  @column()
  declare theme: 'light' | 'dark'

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

  static accessTokens = DbAccessTokensProvider.forModel(User)
}