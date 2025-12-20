import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export type ProgramObjective = 'cyclosportive' | 'ftp_boost' | 'endurance' | 'perte_poids' | 'general'
export type ProgramLevel = 'debutant' | 'intermediaire' | 'avance'

export interface ProgramSession {
  dayOfWeek: number // 0-6 (Dimanche-Samedi)
  templateId: number
  notes?: string
}

export interface ProgramWeek {
  weekNumber: number
  theme: string // "Fondation", "Build", "Peak", "Taper", "Récupération"
  sessions: ProgramSession[]
}

export default class TrainingProgram extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare durationWeeks: number

  @column()
  declare objective: ProgramObjective | null

  @column()
  declare level: ProgramLevel

  @column({
    prepare: (value: ProgramWeek[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value) as ProgramWeek[],
  })
  declare weeklySchedule: ProgramWeek[]

  @column()
  declare isDefault: boolean

  @column()
  declare isPublic: boolean

  @column()
  declare estimatedWeeklyTss: number | null

  @column()
  declare estimatedWeeklyHours: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Retourne le nombre total de séances dans le programme
   */
  getTotalSessions(): number {
    return this.weeklySchedule.reduce((total, week) => total + week.sessions.length, 0)
  }

  /**
   * Retourne le nombre moyen de séances par semaine
   */
  getAverageSessionsPerWeek(): number {
    if (this.durationWeeks === 0) return 0
    return Math.round(this.getTotalSessions() / this.durationWeeks * 10) / 10
  }

  /**
   * Labels pour les objectifs
   */
  static getObjectiveLabels(): Record<ProgramObjective, string> {
    return {
      cyclosportive: 'Préparation Cyclosportive',
      ftp_boost: 'Augmentation FTP',
      endurance: 'Développement Endurance',
      perte_poids: 'Perte de poids',
      general: 'Forme Générale',
    }
  }

  /**
   * Labels pour les niveaux
   */
  static getLevelLabels(): Record<ProgramLevel, string> {
    return {
      debutant: 'Débutant',
      intermediaire: 'Intermédiaire',
      avance: 'Avancé',
    }
  }

  /**
   * Thèmes de semaine disponibles
   */
  static getWeekThemes(): string[] {
    return [
      'Fondation',
      'Build',
      'Intensification',
      'Peak',
      'Taper',
      'Récupération',
      'Test',
      'Transition',
    ]
  }
}
