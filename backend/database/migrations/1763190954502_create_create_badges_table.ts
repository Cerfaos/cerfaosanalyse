import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'badges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Informations du badge
      table.string('code', 50).notNullable().unique().comment('Code unique du badge (ex: distance_100km)')
      table.string('name', 100).notNullable().comment('Nom du badge')
      table.text('description').notNullable().comment('Description du badge')
      table.string('icon', 10).notNullable().comment('Emoji ou icône du badge')

      // Catégorie et niveau
      table.enum('category', ['distance', 'activities', 'elevation', 'streak', 'special', 'time']).notNullable()
      table.integer('level').notNullable().defaultTo(1).comment('Niveau du badge (1=bronze, 2=argent, 3=or...)')

      // Condition de déblocage
      table.enum('condition_type', ['total_distance', 'total_activities', 'total_elevation', 'consecutive_days', 'total_time', 'special']).notNullable()
      table.bigInteger('condition_value').nullable().comment('Valeur seuil pour débloquer (ex: 100000 pour 100km)')

      // Ordre d'affichage
      table.integer('sort_order').notNullable().defaultTo(0)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}