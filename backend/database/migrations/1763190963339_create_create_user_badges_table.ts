import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_badges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relations
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('badge_id').unsigned().notNullable().references('id').inTable('badges').onDelete('CASCADE')

      // Date de déblocage
      table.timestamp('unlocked_at').notNullable()

      // Valeur atteinte lors du déblocage (pour info)
      table.bigInteger('value_at_unlock').nullable().comment('Valeur métrique lors du déblocage (ex: 105000 pour badge 100km)')

      // Une combinaison user + badge doit être unique
      table.unique(['user_id', 'badge_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}