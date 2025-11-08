import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relations
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('equipment_id').unsigned().nullable().references('id').inTable('equipment').onDelete('SET NULL')

      // Informations de base
      table.timestamp('date').notNullable().comment('Date et heure de l\'activité')
      table.integer('duration').notNullable().comment('Durée en secondes')
      table.decimal('distance', 8, 2).notNullable().comment('Distance en kilomètres')

      // Données cardiaques
      table.integer('avg_hr').nullable().comment('FC moyenne (bpm)')
      table.integer('max_hr').nullable().comment('FC maximale (bpm)')

      // Métriques calculées
      table.integer('calories').nullable().comment('Calories brûlées')
      table.decimal('elevation_gain', 8, 2).nullable().comment('Dénivelé positif (m)')
      table.decimal('trimp', 8, 2).nullable().comment('Training Impulse (TRIMP)')

      // Données GPS (JSON)
      table.json('gps_data').nullable().comment('Array de points GPS: {lat, lng, time, hr, speed, altitude}')

      // Fichier source
      table.string('file_path').nullable().comment('Chemin du fichier FIT/GPX original')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Index pour optimisation des requêtes
      table.index(['user_id', 'date'])
      table.index(['equipment_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}