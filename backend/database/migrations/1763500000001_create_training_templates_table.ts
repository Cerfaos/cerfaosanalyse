import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relation utilisateur (nullable pour templates par défaut)
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // Informations de base
      table.string('name', 255).notNullable().comment('Nom du template')
      table
        .enum('category', ['cycling', 'ppg'])
        .notNullable()
        .defaultTo('cycling')
        .comment('Catégorie: vélo ou PPG')
      table
        .enum('level', ['beginner', 'intermediate', 'expert'])
        .defaultTo('intermediate')
        .comment('Niveau de difficulté')
      table
        .enum('location', ['indoor', 'outdoor', 'both'])
        .nullable()
        .comment('Lieu de pratique')
      table
        .string('intensity_ref', 50)
        .defaultTo('ftp')
        .comment('Référence pour les intensités (ftp, fc_max)')

      // Planification
      table.integer('week').unsigned().nullable().comment('Numéro de semaine dans un cycle')
      table.integer('duration').unsigned().notNullable().comment('Durée totale en minutes')
      table.integer('tss').unsigned().nullable().comment('Training Stress Score estimé')
      table.text('description').nullable().comment('Description de la séance')

      // Contenu de la séance (JSON)
      table
        .json('blocks')
        .nullable()
        .comment('Blocs de travail cycling: [{type, duration, percentFtp, reps, notes}]')
      table
        .json('exercises')
        .nullable()
        .comment('Exercices PPG: [{name, duration, reps, sets, rest, hrTarget, notes}]')

      // Flags
      table.boolean('is_default').defaultTo(false).comment('Template système par défaut')
      table.boolean('is_public').defaultTo(false).comment('Visible par tous les utilisateurs')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index pour optimisation
      table.index(['user_id', 'category'])
      table.index(['week'])
      table.index(['is_default'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
