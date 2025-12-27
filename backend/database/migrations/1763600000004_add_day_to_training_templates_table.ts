import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('day').unsigned().nullable().comment('Numéro du jour dans la semaine (1-7)')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('day')
    })
  }
}
