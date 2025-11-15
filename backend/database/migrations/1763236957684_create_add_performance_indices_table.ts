import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Index pour activities - améliore requêtes par utilisateur et date
    this.schema.alterTable('activities', (table) => {
      table.index(['user_id', 'date'], 'idx_activities_user_date')
      table.index(['user_id', 'type'], 'idx_activities_user_type')
    })

    // Index pour weight_histories - améliore requêtes par utilisateur et date
    this.schema.alterTable('weight_histories', (table) => {
      table.index(['user_id', 'date'], 'idx_weight_histories_user_date')
    })

    // Index pour user_badges - améliore requêtes de badges par utilisateur
    this.schema.alterTable('user_badges', (table) => {
      table.index(['user_id'], 'idx_user_badges_user_id')
    })

    // Index pour goals - améliore requêtes d'objectifs par utilisateur
    this.schema.alterTable('goals', (table) => {
      table.index(['user_id', 'is_active'], 'idx_goals_user_active')
    })

    // Index pour equipment - améliore requêtes d'équipement par utilisateur
    this.schema.alterTable('equipment', (table) => {
      table.index(['user_id', 'is_active'], 'idx_equipment_user_active')
    })
  }

  async down() {
    this.schema.alterTable('activities', (table) => {
      table.dropIndex(['user_id', 'date'], 'idx_activities_user_date')
      table.dropIndex(['user_id', 'type'], 'idx_activities_user_type')
    })

    this.schema.alterTable('weight_histories', (table) => {
      table.dropIndex(['user_id', 'date'], 'idx_weight_histories_user_date')
    })

    this.schema.alterTable('user_badges', (table) => {
      table.dropIndex(['user_id'], 'idx_user_badges_user_id')
    })

    this.schema.alterTable('goals', (table) => {
      table.dropIndex(['user_id', 'is_active'], 'idx_goals_user_active')
    })

    this.schema.alterTable('equipment', (table) => {
      table.dropIndex(['user_id', 'is_active'], 'idx_equipment_user_active')
    })
  }
}
