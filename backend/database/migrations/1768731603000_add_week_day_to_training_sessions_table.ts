import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('week').nullable()
      table.integer('day').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('week')
      table.dropColumn('day')
    })
  }
}
