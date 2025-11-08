import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'equipment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Modifier le type enum pour inclure plus d'options
      table.dropColumn('type')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', [
        'Vélo Route',
        'Vélo VTT',
        'Vélo Gravel',
        'Chaussures Route',
        'Chaussures Trail',
        'Cardio',
        'Capteur Puissance',
        'Autre'
      ]).notNullable().defaultTo('Autre')

      // Ajouter les nouvelles colonnes
      table.string('brand').nullable()
      table.string('model').nullable()
      table.integer('initial_distance').defaultTo(0)
      table.integer('current_distance').defaultTo(0)
      table.integer('alert_distance').nullable()
      table.date('retirement_date').nullable()
      table.boolean('is_active').defaultTo(true)
      table.text('notes').nullable()

      // Renommer les colonnes existantes
      table.renameColumn('date_achat', 'purchase_date')
      table.renameColumn('distance_total', 'old_distance_total')
      table.renameColumn('maintenance_alert_km', 'old_maintenance_alert_km')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('brand')
      table.dropColumn('model')
      table.dropColumn('initial_distance')
      table.dropColumn('current_distance')
      table.dropColumn('alert_distance')
      table.dropColumn('retirement_date')
      table.dropColumn('is_active')
      table.dropColumn('notes')
      table.dropColumn('type')

      table.renameColumn('purchase_date', 'date_achat')
      table.renameColumn('old_distance_total', 'distance_total')
      table.renameColumn('old_maintenance_alert_km', 'maintenance_alert_km')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', ['road', 'mtb', 'gravel', 'other']).notNullable()
    })
  }
}