import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weight_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relations
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      // Données de poids
      table.date('date').notNullable().comment('Date de la pesée')
      table.decimal('weight', 5, 2).notNullable().comment('Poids en kilogrammes')
      table.text('notes').nullable().comment('Notes optionnelles sur la pesée')

      table.timestamp('created_at').notNullable()

      // Index pour optimisation
      table.index(['user_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}