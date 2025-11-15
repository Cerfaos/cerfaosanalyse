import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Température
      table.integer('avg_temperature').nullable().comment('Température moyenne (°C)')
      table.integer('max_temperature').nullable().comment('Température maximale (°C)')

      // Sous-type de sport (route, VTT, piste, etc.)
      table.string('sub_sport', 50).nullable().comment('Sous-type de sport (road, mountain, track...)')

      // Dénivelé négatif
      table.decimal('elevation_loss', 8, 2).nullable().comment('Dénivelé négatif (m)')

      // Temps en mouvement (sans les pauses)
      table.integer('moving_time').nullable().comment('Temps en mouvement sans pauses (secondes)')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('avg_temperature')
      table.dropColumn('max_temperature')
      table.dropColumn('sub_sport')
      table.dropColumn('elevation_loss')
      table.dropColumn('moving_time')
    })
  }
}