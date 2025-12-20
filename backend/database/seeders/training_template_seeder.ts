import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TrainingTemplate from '#models/training_template'
import type { CyclingBlock, PpgExercise } from '#models/training_template'

export default class extends BaseSeeder {
  async run() {
    // Vérifier si des templates par défaut existent déjà
    const existingCount = await TrainingTemplate.query().where('isDefault', true).count('* as total')
    const count = Number(existingCount[0].$extras.total)

    if (count > 0) {
      console.log(`⏭️ ${count} templates par défaut existent déjà, seed ignoré.`)
      return
    }

    const templates: Array<{
      name: string
      category: 'cycling' | 'ppg'
      level: 'beginner' | 'intermediate' | 'expert'
      location: 'indoor' | 'outdoor' | 'both'
      intensityRef: string
      week: number
      duration: number
      tss: number
      description: string
      blocks?: CyclingBlock[]
      exercises?: PpgExercise[]
      isDefault: boolean
      isPublic: boolean
    }> = [
      // ========== SEMAINE 1 - CYCLING ==========
      {
        name: 'Test Puissance Critique',
        category: 'cycling',
        level: 'beginner',
        location: 'both',
        intensityRef: 'ftp',
        week: 1,
        duration: 45,
        tss: 55,
        description:
          'Test FTP simplifié pour débutants. Échauffement progressif suivi d\'un effort de 20 minutes à intensité maximale soutenable. Résultat × 0.95 = estimation FTP.',
        blocks: [
          { type: 'warmup', duration: '10:00', percentFtp: 50, reps: 1, notes: 'Échauffement progressif' },
          { type: 'effort', duration: '05:00', percentFtp: 70, reps: 1, notes: 'Activation' },
          { type: 'recovery', duration: '05:00', percentFtp: 40, reps: 1, notes: 'Récupération' },
          { type: 'effort', duration: '20:00', percentFtp: 100, reps: 1, notes: 'Effort maximal soutenable - notez votre puissance moyenne' },
          { type: 'cooldown', duration: '05:00', percentFtp: 40, reps: 1, notes: 'Retour au calme' },
        ],
        isDefault: true,
        isPublic: true,
      },
      {
        name: 'Test Puissance Critique Avancé',
        category: 'cycling',
        level: 'expert',
        location: 'both',
        intensityRef: 'ftp',
        week: 1,
        duration: 75,
        tss: 95,
        description:
          'Protocole complet de test FTP avec double effort. Échauffement structuré, effort de 5 min pour vider les réserves anaérobies, puis 20 min à fond.',
        blocks: [
          { type: 'warmup', duration: '15:00', percentFtp: 55, reps: 1, notes: 'Échauffement progressif 50→60%' },
          { type: 'interval', duration: '01:00', percentFtp: 90, reps: 3, notes: '3×1min à 90% avec 1min récup' },
          { type: 'recovery', duration: '05:00', percentFtp: 40, reps: 1, notes: 'Récupération complète' },
          { type: 'effort', duration: '05:00', percentFtp: 110, reps: 1, notes: 'Effort intense - vider les réserves' },
          { type: 'recovery', duration: '10:00', percentFtp: 45, reps: 1, notes: 'Récupération importante' },
          { type: 'effort', duration: '20:00', percentFtp: 100, reps: 1, notes: 'Effort maximal - puissance moyenne × 0.95 = FTP' },
          { type: 'cooldown', duration: '10:00', percentFtp: 40, reps: 1, notes: 'Retour au calme progressif' },
        ],
        isDefault: true,
        isPublic: true,
      },
      {
        name: 'Endurance + Vélocité',
        category: 'cycling',
        level: 'intermediate',
        location: 'outdoor',
        intensityRef: 'ftp',
        week: 1,
        duration: 90,
        tss: 70,
        description:
          'Sortie longue en endurance fondamentale avec travail de vélocité. Maintenir une cadence élevée (95-105 rpm) sur les portions plates.',
        blocks: [
          { type: 'warmup', duration: '15:00', percentFtp: 50, reps: 1, notes: 'Échauffement progressif' },
          { type: 'effort', duration: '60:00', percentFtp: 65, reps: 1, notes: 'Endurance Z2, cadence 90-100 rpm' },
          { type: 'interval', duration: '02:00', percentFtp: 60, reps: 4, notes: '4×2min vélocité haute (100-110 rpm) avec 2min normal' },
          { type: 'cooldown', duration: '07:00', percentFtp: 45, reps: 1, notes: 'Retour au calme' },
        ],
        isDefault: true,
        isPublic: true,
      },
      {
        name: 'Sweet Spot Indoor',
        category: 'cycling',
        level: 'intermediate',
        location: 'indoor',
        intensityRef: 'ftp',
        week: 1,
        duration: 60,
        tss: 75,
        description:
          'Séance home-trainer efficace en Sweet Spot (88-94% FTP). Excellent ratio temps/bénéfice pour développer l\'endurance à haute intensité.',
        blocks: [
          { type: 'warmup', duration: '10:00', percentFtp: 55, reps: 1, notes: 'Échauffement progressif' },
          { type: 'interval', duration: '01:00', percentFtp: 85, reps: 2, notes: '2×1min activation' },
          { type: 'recovery', duration: '03:00', percentFtp: 45, reps: 1, notes: 'Récupération' },
          { type: 'effort', duration: '10:00', percentFtp: 90, reps: 3, notes: '3×10min Sweet Spot avec 5min récup' },
          { type: 'cooldown', duration: '05:00', percentFtp: 40, reps: 1, notes: 'Retour au calme' },
        ],
        isDefault: true,
        isPublic: true,
      },

      // ========== SEMAINE 1 - PPG ==========
      {
        name: 'Circuit PPG Complet',
        category: 'ppg',
        level: 'intermediate',
        location: 'indoor',
        intensityRef: 'fc_max',
        week: 1,
        duration: 45,
        tss: 50,
        description:
          'Circuit de Préparation Physique Générale ciblant les muscles utilisés en cyclisme : quadriceps, ischio-jambiers, fessiers, gainage.',
        exercises: [
          {
            name: 'Échauffement articulaire',
            duration: '05:00',
            reps: null,
            sets: 1,
            rest: '00:00',
            hrTarget: '100-120',
            notes: 'Rotations chevilles, genoux, hanches, épaules',
          },
          {
            name: 'Squats',
            duration: '00:45',
            reps: 15,
            sets: 3,
            rest: '00:45',
            hrTarget: '120-140',
            notes: 'Descente contrôlée, genoux alignés',
          },
          {
            name: 'Fentes avant alternées',
            duration: '00:45',
            reps: 12,
            sets: 3,
            rest: '00:45',
            hrTarget: '120-140',
            notes: '12 répétitions par jambe',
          },
          {
            name: 'Pont fessier',
            duration: '00:30',
            reps: 20,
            sets: 3,
            rest: '00:30',
            hrTarget: '110-130',
            notes: 'Serrer les fessiers en haut',
          },
          {
            name: 'Gainage planche',
            duration: '00:45',
            reps: null,
            sets: 3,
            rest: '00:30',
            hrTarget: '100-120',
            notes: 'Corps aligné, ne pas creuser le dos',
          },
          {
            name: 'Gainage latéral',
            duration: '00:30',
            reps: null,
            sets: 2,
            rest: '00:30',
            hrTarget: '100-120',
            notes: '30s chaque côté',
          },
          {
            name: 'Superman',
            duration: '00:30',
            reps: 15,
            sets: 3,
            rest: '00:30',
            hrTarget: '100-120',
            notes: 'Lever bras et jambes opposés',
          },
          {
            name: 'Chaise',
            duration: '00:45',
            reps: null,
            sets: 3,
            rest: '00:45',
            hrTarget: '110-130',
            notes: 'Dos contre le mur, cuisses parallèles au sol',
          },
          {
            name: 'Étirements',
            duration: '05:00',
            reps: null,
            sets: 1,
            rest: '00:00',
            hrTarget: '90-110',
            notes: 'Quadriceps, ischio-jambiers, fessiers, mollets',
          },
        ],
        isDefault: true,
        isPublic: true,
      },
    ]

    await TrainingTemplate.createMany(templates)

    console.log(`✅ ${templates.length} templates d'entraînement par défaut créés !`)
  }
}
