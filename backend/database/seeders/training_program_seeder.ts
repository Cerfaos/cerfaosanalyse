import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TrainingProgram from '#models/training_program'
import TrainingTemplate from '#models/training_template'
import type { ProgramWeek } from '#models/training_program'

export default class extends BaseSeeder {
  async run() {
    // Vérifier si des programmes par défaut existent déjà
    const existingCount = await TrainingProgram.query().where('is_default', true).count('* as total')
    if (Number(existingCount[0].$extras.total) > 0) {
      console.log('Les programmes par défaut existent déjà')
      return
    }

    // Récupérer les templates par défaut pour construire les programmes
    const templates = await TrainingTemplate.query().where('isDefault', true)
    const templateMap = new Map(templates.map(t => [t.name, t.id]))

    // Helper pour obtenir l'ID d'un template par son nom
    const getTemplateId = (name: string): number => {
      const id = templateMap.get(name)
      if (!id) {
        console.warn(`Template "${name}" non trouvé, utilisation de l'ID 1 par défaut`)
        return 1
      }
      return id
    }

    // Programme 1: Préparation Cyclosportive 8 semaines
    const cyclosportiveProgram: ProgramWeek[] = [
      // Semaine 1 - Fondation
      {
        weekNumber: 1,
        theme: 'Fondation',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie de reprise' },
          { dayOfWeek: 4, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Séance qualité courte' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie longue' },
        ],
      },
      // Semaine 2 - Build
      {
        weekNumber: 2,
        theme: 'Build',
        sessions: [
          { dayOfWeek: 1, templateId: getTemplateId('Circuit PPG Complet'), notes: 'Renforcement' },
          { dayOfWeek: 3, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Sweet spot 3×10min' },
          { dayOfWeek: 5, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Vélocité' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie longue' },
        ],
      },
      // Semaine 3 - Build
      {
        weekNumber: 3,
        theme: 'Build',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Augmenter durée' },
          { dayOfWeek: 4, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie longue +10km' },
        ],
      },
      // Semaine 4 - Récupération
      {
        weekNumber: 4,
        theme: 'Récupération',
        sessions: [
          { dayOfWeek: 3, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie courte Z2' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie modérée' },
        ],
      },
      // Semaine 5 - Intensification
      {
        weekNumber: 5,
        theme: 'Intensification',
        sessions: [
          { dayOfWeek: 1, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG' },
          { dayOfWeek: 3, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Sweet Spot 3×12min' },
          { dayOfWeek: 5, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Tempo long' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie longue cible' },
        ],
      },
      // Semaine 6 - Intensification
      {
        weekNumber: 6,
        theme: 'Intensification',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Intervalles seuil' },
          { dayOfWeek: 4, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG léger' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Simulation parcours' },
        ],
      },
      // Semaine 7 - Peak
      {
        weekNumber: 7,
        theme: 'Peak',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Dernière séance intense' },
          { dayOfWeek: 4, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie légère' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Reconnaissance parcours' },
        ],
      },
      // Semaine 8 - Taper
      {
        weekNumber: 8,
        theme: 'Taper',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Activation courte' },
          { dayOfWeek: 4, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Openers 30min' },
          { dayOfWeek: 0, templateId: getTemplateId('Test Puissance Critique'), notes: 'JOUR J - CYCLOSPORTIVE' },
        ],
      },
    ]

    // Programme 2: Boost FTP 6 semaines
    const ftpBoostProgram: ProgramWeek[] = [
      {
        weekNumber: 1,
        theme: 'Test',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Échauffement' },
          { dayOfWeek: 4, templateId: getTemplateId('Test Puissance Critique'), notes: 'TEST FTP INITIAL' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Récupération active' },
        ],
      },
      {
        weekNumber: 2,
        theme: 'Fondation',
        sessions: [
          { dayOfWeek: 1, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG' },
          { dayOfWeek: 3, templateId: getTemplateId('Sweet Spot Indoor'), notes: '3×8min Sweet Spot' },
          { dayOfWeek: 5, templateId: getTemplateId('Sweet Spot Indoor'), notes: '3×8min Sweet Spot' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Endurance Z2' },
        ],
      },
      {
        weekNumber: 3,
        theme: 'Build',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Sweet Spot Indoor'), notes: '3×10min Sweet Spot' },
          { dayOfWeek: 4, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG' },
          { dayOfWeek: 5, templateId: getTemplateId('Sweet Spot Indoor'), notes: '2×15min Tempo' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie longue' },
        ],
      },
      {
        weekNumber: 4,
        theme: 'Intensification',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Sweet Spot Indoor'), notes: '3×12min Sweet Spot' },
          { dayOfWeek: 4, templateId: getTemplateId('Sweet Spot Indoor'), notes: '4×8min @ 95%' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Endurance avec sprints' },
        ],
      },
      {
        weekNumber: 5,
        theme: 'Peak',
        sessions: [
          { dayOfWeek: 1, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG léger' },
          { dayOfWeek: 3, templateId: getTemplateId('Sweet Spot Indoor'), notes: '2×20min @ 90%' },
          { dayOfWeek: 5, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Openers' },
        ],
      },
      {
        weekNumber: 6,
        theme: 'Test',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Récupération' },
          { dayOfWeek: 4, templateId: getTemplateId('Test Puissance Critique Avancé'), notes: 'TEST FTP FINAL' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: 'Sortie détente' },
        ],
      },
    ]

    // Programme 3: Développement Endurance 4 semaines
    const enduranceProgram: ProgramWeek[] = [
      {
        weekNumber: 1,
        theme: 'Fondation',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Endurance + Vélocité'), notes: '1h30 Z2' },
          { dayOfWeek: 4, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: '2h Z2' },
        ],
      },
      {
        weekNumber: 2,
        theme: 'Build',
        sessions: [
          { dayOfWeek: 2, templateId: getTemplateId('Endurance + Vélocité'), notes: '1h45 Z2' },
          { dayOfWeek: 4, templateId: getTemplateId('Sweet Spot Indoor'), notes: 'Sweet Spot modéré' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: '2h30 Z2' },
        ],
      },
      {
        weekNumber: 3,
        theme: 'Build',
        sessions: [
          { dayOfWeek: 1, templateId: getTemplateId('Circuit PPG Complet'), notes: 'PPG' },
          { dayOfWeek: 3, templateId: getTemplateId('Endurance + Vélocité'), notes: '2h Z2' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: '3h Z2' },
        ],
      },
      {
        weekNumber: 4,
        theme: 'Récupération',
        sessions: [
          { dayOfWeek: 3, templateId: getTemplateId('Endurance + Vélocité'), notes: '1h30 Z2 léger' },
          { dayOfWeek: 6, templateId: getTemplateId('Endurance + Vélocité'), notes: '2h facile' },
        ],
      },
    ]

    const programs = [
      {
        name: 'Préparation Cyclosportive 8 semaines',
        description: 'Programme complet pour préparer une cyclosportive. Progression structurée avec pic de forme au bon moment. Inclut PPG et travail spécifique.',
        durationWeeks: 8,
        objective: 'cyclosportive',
        level: 'intermediaire',
        weeklySchedule: cyclosportiveProgram,
        isDefault: true,
        isPublic: true,
        estimatedWeeklyTss: 280,
        estimatedWeeklyHours: 7,
      },
      {
        name: 'Boost FTP en 6 semaines',
        description: 'Programme intensif focalisé sur l\'augmentation de la FTP. Combine travail Sweet Spot et intervalles au seuil. Tests avant/après pour mesurer les progrès.',
        durationWeeks: 6,
        objective: 'ftp_boost',
        level: 'intermediaire',
        weeklySchedule: ftpBoostProgram,
        isDefault: true,
        isPublic: true,
        estimatedWeeklyTss: 320,
        estimatedWeeklyHours: 8,
      },
      {
        name: 'Développement Endurance 4 semaines',
        description: 'Programme pour développer la base aérobie. Sorties longues progressives en Zone 2. Idéal en début de saison ou après une coupure.',
        durationWeeks: 4,
        objective: 'endurance',
        level: 'debutant',
        weeklySchedule: enduranceProgram,
        isDefault: true,
        isPublic: true,
        estimatedWeeklyTss: 200,
        estimatedWeeklyHours: 5,
      },
    ]

    await TrainingProgram.createMany(programs as any)
    console.log(`${programs.length} programmes d'entraînement par défaut créés`)
  }
}
