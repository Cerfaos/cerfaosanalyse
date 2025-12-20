import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_programs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE')

      table.string('name', 150).notNullable()
      table.text('description').nullable()

      // Configuration du programme
      table.integer('duration_weeks').notNullable().defaultTo(4)
      table.string('objective', 50).nullable() // cyclosportive, ftp_boost, endurance, perte_poids
      table.string('level', 20).notNullable().defaultTo('intermediaire') // debutant, intermediaire, avance

      // Planning hebdomadaire (JSON)
      // Structure: [{ weekNumber: 1, theme: "Fondation", sessions: [{ dayOfWeek: 1, templateId: 5, notes: "" }] }]
      table.text('weekly_schedule').notNullable()

      // Programme système vs utilisateur
      table.boolean('is_default').notNullable().defaultTo(false)
      table.boolean('is_public').notNullable().defaultTo(false)

      // Statistiques calculées
      table.integer('estimated_weekly_tss').nullable()
      table.integer('estimated_weekly_hours').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index
      table.index(['user_id'])
      table.index(['is_default'])
      table.index(['is_public'])
      table.index(['objective'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
