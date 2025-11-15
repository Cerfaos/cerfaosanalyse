import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Ajouter RPE aux activités
    this.schema.alterTable('activities', (table) => {
      table.integer('rpe').nullable() // Rating of Perceived Exertion (1-10)
      table.text('feeling_notes').nullable() // Notes sur les sensations
    })

    // Ajouter FTP aux utilisateurs
    this.schema.alterTable('users', (table) => {
      table.integer('ftp').nullable() // Functional Threshold Power (watts)
    })
  }

  async down() {
    this.schema.alterTable('activities', (table) => {
      table.dropColumn('rpe')
      table.dropColumn('feeling_notes')
    })

    this.schema.alterTable('users', (table) => {
      table.dropColumn('ftp')
    })
  }
}
