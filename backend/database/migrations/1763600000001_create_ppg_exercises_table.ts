import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ppg_exercises'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 100).notNullable()
      table.string('category', 50).notNullable() // jambes, core, bras, cardio
      table.text('description').nullable()
      table.string('target_muscles', 255).nullable()
      table.string('difficulty', 20).notNullable().defaultTo('intermediaire') // debutant, intermediaire, avance

      // Valeurs par défaut pour l'exercice
      table.string('default_duration', 10).nullable() // Format "00:45" pour 45 secondes
      table.integer('default_reps').nullable()
      table.integer('default_sets').notNullable().defaultTo(3)

      // Médias optionnels
      table.string('image_url', 500).nullable()
      table.string('video_url', 500).nullable()

      // Exercice système vs utilisateur
      table.boolean('is_default').notNullable().defaultTo(true)
      table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index pour la recherche
      table.index(['category'])
      table.index(['difficulty'])
      table.index(['is_default'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
