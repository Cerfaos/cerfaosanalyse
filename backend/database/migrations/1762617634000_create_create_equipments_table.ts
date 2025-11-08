import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'equipment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relations
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')

      // Informations équipement
      table.string('name', 255).notNullable().comment('Nom de l\'équipement (ex: VTT Canyon)')
      table.enum('type', ['road', 'mtb', 'gravel', 'other']).notNullable().comment('Type de vélo')

      // Historique et maintenance
      table.date('date_achat').nullable().comment('Date d\'achat')
      table.decimal('distance_total', 10, 2).defaultTo(0).comment('Distance totale parcourue (km)')
      table.integer('maintenance_alert_km').nullable().comment('Alerte de maintenance tous les X km')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Index
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}