import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import PersonalRecordService from '#services/personal_record_service'

export default class RecalculateRecords extends BaseCommand {
  static commandName = 'records:recalculate'
  static description = 'Recalculer tous les records personnels pour tous les utilisateurs'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Démarrage du recalcul des records personnels...')

    const users = await User.all()
    let totalRecords = 0

    for (const user of users) {
      this.logger.info(`Traitement de l'utilisateur ${user.id} (${user.email})...`)

      const recordsCount = await PersonalRecordService.recalculateAllRecords(user.id)
      totalRecords += recordsCount

      this.logger.success(`  -> ${recordsCount} records créés`)
    }

    this.logger.success(`\nTerminé ! ${totalRecords} records créés au total pour ${users.length} utilisateur(s).`)
  }
}
