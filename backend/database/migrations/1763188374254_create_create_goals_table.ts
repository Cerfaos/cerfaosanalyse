import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'goals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      // Type d'objectif : distance, duration, trimp, activities_count
      table.enum('type', ['distance', 'duration', 'trimp', 'activities_count']).notNullable()

      // Valeur cible et progression
      table.integer('target_value').notNullable() // En mètres, secondes, TRIMP ou nombre
      table.integer('current_value').defaultTo(0)

      // Période : weekly, monthly, yearly, custom
      table.enum('period', ['weekly', 'monthly', 'yearly', 'custom']).notNullable()

      // Dates
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()

      // Titre et description
      table.string('title').notNullable()
      table.text('description').nullable()

      // Statut
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_completed').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}