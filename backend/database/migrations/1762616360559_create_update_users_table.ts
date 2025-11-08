import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Paramètres physiologiques cyclistes
      table.integer('fc_max').nullable().comment('Fréquence cardiaque maximale (bpm)')
      table.integer('fc_repos').nullable().comment('Fréquence cardiaque au repos (bpm)')
      table.decimal('weight_current', 5, 2).nullable().comment('Poids actuel (kg)')

      // Préférences UI
      table.enum('theme', ['light', 'dark']).defaultTo('light').comment('Thème de l\'interface')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fc_max')
      table.dropColumn('fc_repos')
      table.dropColumn('weight_current')
      table.dropColumn('theme')
    })
  }
}