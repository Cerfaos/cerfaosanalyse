import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ajouter le type d'activité
      table.string('type').notNullable().defaultTo('Cyclisme')

      // Renommer les colonnes FC
      table.renameColumn('avg_hr', 'avg_heart_rate')
      table.renameColumn('max_hr', 'max_heart_rate')

      // Ajouter les nouvelles colonnes de vitesse
      table.decimal('avg_speed', 8, 2).nullable()
      table.decimal('max_speed', 8, 2).nullable()

      // Ajouter les nouvelles colonnes de puissance
      table.integer('avg_power').nullable()
      table.integer('normalized_power').nullable()

      // Ajouter cadence
      table.integer('avg_cadence').nullable()

      // Renommer filePath en fileName
      table.renameColumn('file_path', 'file_name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type')
      table.renameColumn('avg_heart_rate', 'avg_hr')
      table.renameColumn('max_heart_rate', 'max_hr')
      table.dropColumn('avg_speed')
      table.dropColumn('max_speed')
      table.dropColumn('avg_power')
      table.dropColumn('normalized_power')
      table.dropColumn('avg_cadence')
      table.renameColumn('file_name', 'file_path')
    })
  }
}