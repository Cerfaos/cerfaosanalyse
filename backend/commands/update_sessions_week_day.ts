import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import TrainingSession from '#models/training_session'
import TrainingTemplate from '#models/training_template'

export default class UpdateSessionsWeekDay extends BaseCommand {
  static commandName = 'sessions:update-week-day'
  static description = 'Met à jour week et day des séances existantes depuis leurs templates'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Mise à jour des séances existantes...')

    // Récupérer toutes les séances avec un templateId
    const sessions = await TrainingSession.query()
      .whereNotNull('templateId')
      .whereNull('week')

    let updated = 0

    for (const session of sessions) {
      if (session.templateId) {
        const template = await TrainingTemplate.find(session.templateId)
        if (template && (template.week || template.day)) {
          session.week = template.week
          session.day = template.day
          await session.save()
          updated++
          this.logger.info(`✓ Séance "${session.name}" → S${template.week || '-'} J${template.day || '-'}`)
        }
      }
    }

    this.logger.success(`${updated} séance(s) mise(s) à jour`)
  }
}
