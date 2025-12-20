import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'planned_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relations
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('session_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('training_sessions')
        .onDelete('CASCADE')
        .comment('Séance planifiée')

      // Planification
      table.date('planned_date').notNullable().comment('Date prévue pour la séance')
      table.integer('order').unsigned().defaultTo(0).comment('Ordre dans la journée si plusieurs séances')

      // Suivi de complétion
      table.boolean('completed').defaultTo(false).comment('Séance réalisée ou non')
      table.timestamp('completed_at').nullable().comment('Date/heure de complétion')
      table.text('notes').nullable().comment('Notes post-séance')

      // Lien vers activité réelle
      table
        .integer('activity_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('activities')
        .onDelete('SET NULL')
        .comment('Activité FIT/GPX importée correspondante')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index pour optimisation
      table.index(['user_id', 'planned_date'])
      table.index(['user_id', 'completed'])

      // Contrainte unique : une séance ne peut être planifiée qu'une fois par jour pour un user
      table.unique(['user_id', 'session_id', 'planned_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
