import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Historique FTP pour suivre l'évolution
      table
        .json('ftp_history')
        .nullable()
        .comment('Historique des valeurs FTP: [{ftp: number, date: string}]')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ftp_history')
    })
  }
}
