import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'personal_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('activity_id').unsigned().notNullable().references('id').inTable('activities').onDelete('CASCADE')

      // Type de record
      table.string('record_type').notNullable() // max_distance, max_speed, max_trimp, max_elevation, longest_duration, max_avg_heart_rate
      table.string('activity_type').notNullable() // Cyclisme, Course, etc.

      // Valeur du record
      table.float('value').notNullable()

      // Date où le record a été établi
      table.dateTime('achieved_at').notNullable()

      // Record précédent (pour historique)
      table.float('previous_value').nullable()
      table.dateTime('previous_achieved_at').nullable()

      // Métadonnées
      table.boolean('is_current').defaultTo(true) // Est-ce le record actuel ?
      table.string('unit').notNullable() // km, km/h, points, m, min

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index pour recherche rapide
      table.index(['user_id', 'record_type', 'activity_type'])
      table.index(['user_id', 'is_current'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
