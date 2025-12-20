import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'planned_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Lien vers le programme source
      table
        .integer('program_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('training_programs')
        .onDelete('SET NULL')
        .comment('Programme source si créé via application de programme')

      // Infos de contexte programme
      table.integer('program_week').nullable().comment('Numéro de semaine dans le programme')
      table.string('program_theme', 50).nullable().comment('Thème de la semaine (Fondation, Build, etc.)')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('program_id')
      table.dropColumn('program_week')
      table.dropColumn('program_theme')
    })
  }
}
