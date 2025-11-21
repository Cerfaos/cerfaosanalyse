import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Configuration du plan
      table.string('goal').notNullable() // maintain, improve, peak
      table.float('weekly_hours').notNullable()
      table.string('main_activity_type').notNullable()
      table.string('preferred_days').notNullable() // JSON array of day numbers

      // Données du plan généré (4 semaines)
      table.text('plan_data').notNullable() // JSON des WeeklyPlan[]

      // Métadonnées
      table.string('name').nullable() // Nom personnalisé du plan
      table.boolean('is_active').defaultTo(true)
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
