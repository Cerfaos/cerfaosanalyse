/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const WeightHistoriesController = () => import('#controllers/weight_histories_controller')
const ActivitiesController = () => import('#controllers/activities_controller')
const EquipmentController = () => import('#controllers/equipment_controller')
const ExportsController = () => import('#controllers/exports_controller')
const PersonalRecordsController = () => import('#controllers/personal_records_controller')
const AnalyticsController = () => import('#controllers/analytics_controller')
const TrainingSessionsController = () => import('#controllers/training_sessions_controller')
const TrainingTemplatesController = () => import('#controllers/training_templates_controller')
const TrainingPlanningController = () => import('#controllers/training_planning_controller')
const ReportsController = () => import('#controllers/reports_controller')
const PpgExercisesController = () => import('#controllers/ppg_exercises_controller')
const TrainingProgramsController = () => import('#controllers/training_programs_controller')
const MrcImportController = () => import('#controllers/mrc_import_controller')

// Health check
router.get('/', async () => {
  return {
    app: "Centre d'Analyse Cycliste API",
    version: '1.0.0',
    status: 'running',
  }
})

// Health check endpoint pour Docker
router.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Servir les fichiers statiques (uploads)
router.get('/uploads/*', async ({ params, response }) => {
  const filePath = params['*'].join('/')
  const absolutePath = app.makePath('public', 'uploads', filePath)
  return response.download(absolutePath)
})

// Routes d'authentification (publiques)
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('/api/auth')
  .use([middleware.rateLimit(['handleAuth'])])

// Routes protégées (nécessitent authentification)
router
  .group(() => {
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
  })
  .prefix('/api/auth')
  .use(middleware.auth())

// Routes utilisateur protégées
router
  .group(() => {
    router.patch('/profile', [UsersController, 'updateProfile'])
    router.get('/hr-zones', [UsersController, 'getHeartRateZones'])
    router.get('/power-zones', [UsersController, 'getPowerZones'])
    router.post('/avatar', [UsersController, 'uploadAvatar'])
    // Profil d'entraînement (FTP, poids, FC, historique)
    router.get('/training-profile', [UsersController, 'getTrainingProfile'])
    router.put('/training-profile', [UsersController, 'updateTrainingProfile'])
  })
  .prefix('/api/users')
  .use(middleware.auth())

// Routes poids protégées
router
  .group(() => {
    router.get('/', [WeightHistoriesController, 'index'])
    router.post('/', [WeightHistoriesController, 'store'])
    router.get('/stats', [WeightHistoriesController, 'stats'])
    router.get('/:id', [WeightHistoriesController, 'show'])
    router.patch('/:id', [WeightHistoriesController, 'update'])
    router.delete('/:id', [WeightHistoriesController, 'destroy'])
  })
  .prefix('/api/weight-histories')
  .use(middleware.auth())

// Routes activités protégées
router
  .group(() => {
    router.get('/', [ActivitiesController, 'index'])
    router.post('/create', [ActivitiesController, 'create'])
    router
      .post('/upload', [ActivitiesController, 'upload'])
      .use([middleware.rateLimit(['handleUpload'])])
    router.get('/stats', [ActivitiesController, 'stats'])
    router.get('/cycling-stats', [ActivitiesController, 'cyclingStats'])
    router.get('/training-load', [ActivitiesController, 'trainingLoad'])
    router.get('/:id', [ActivitiesController, 'show'])
    router.patch('/:id', [ActivitiesController, 'update'])
    router
      .post('/:id/replace-file', [ActivitiesController, 'replaceFile'])
      .use([middleware.rateLimit(['handleUpload'])])
    router.delete('/:id', [ActivitiesController, 'destroy'])
  })
  .prefix('/api/activities')
  .use(middleware.auth())

// Routes équipement protégées
router
  .group(() => {
    router.get('/', [EquipmentController, 'index'])
    router.post('/', [EquipmentController, 'store'])
    router.get('/:id', [EquipmentController, 'show'])
    router.get('/:id/stats', [EquipmentController, 'stats'])
    router.patch('/:id', [EquipmentController, 'update'])
    router.delete('/:id', [EquipmentController, 'destroy'])
  })
  .prefix('/api/equipment')
  .use(middleware.auth())

// Routes exports protégées
router
  .group(() => {
    router.get('/stats', [ExportsController, 'stats'])
    router.get('/all', [ExportsController, 'exportAll'])
    router.get('/backup', [ExportsController, 'exportBackup'])
    router.post('/restore', [ExportsController, 'importBackup'])
    router.get('/activities/csv', [ExportsController, 'exportActivitiesCsv'])
    router.get('/activities/:id/gpx', [ExportsController, 'exportActivityGpx'])
    router.get('/weight/csv', [ExportsController, 'exportWeightCsv'])
    router.get('/equipment/csv', [ExportsController, 'exportEquipmentCsv'])
  })
  .prefix('/api/exports')
  .use(middleware.auth())

// Routes records personnels protégées
router
  .group(() => {
    router.get('/', [PersonalRecordsController, 'index'])
    router.get('/stats', [PersonalRecordsController, 'stats'])
    router.get('/recent', [PersonalRecordsController, 'recent'])
    router.get('/recalculate', [PersonalRecordsController, 'recalculate'])
    router.get('/type/:type', [PersonalRecordsController, 'byActivityType'])
    router.get('/history/:type/:activityType', [PersonalRecordsController, 'history'])
  })
  .prefix('/api/records')
  .use(middleware.auth())

// Routes analytics (analyse intelligente)
router
  .group(() => {
    router.get('/activities/:id/similar', [AnalyticsController, 'similarActivities'])
    router.post('/predict-performance', [AnalyticsController, 'predictPerformance'])
    router.get('/fatigue', [AnalyticsController, 'fatigueAnalysis'])
  })
  .prefix('/api/analytics')
  .use(middleware.auth())

// Routes Training Module - Séances d'entraînement
router
  .group(() => {
    router.get('/', [TrainingSessionsController, 'index'])
    router.post('/', [TrainingSessionsController, 'store'])
    router.get('/:id', [TrainingSessionsController, 'show'])
    router.put('/:id', [TrainingSessionsController, 'update'])
    router.delete('/:id', [TrainingSessionsController, 'destroy'])
  })
  .prefix('/api/training/sessions')
  .use(middleware.auth())

// Routes Training Module - Templates de séances
router
  .group(() => {
    router.get('/', [TrainingTemplatesController, 'index'])
    router.post('/', [TrainingTemplatesController, 'store'])
    router.get('/:id', [TrainingTemplatesController, 'show'])
    router.put('/:id', [TrainingTemplatesController, 'update'])
    router.delete('/:id', [TrainingTemplatesController, 'destroy'])
    router.post('/:id/duplicate', [TrainingTemplatesController, 'duplicate'])
  })
  .prefix('/api/training/templates')
  .use(middleware.auth())

// Routes Training Module - Planning
router
  .group(() => {
    router.get('/', [TrainingPlanningController, 'index'])
    router.post('/', [TrainingPlanningController, 'store'])
    router.delete('/:id', [TrainingPlanningController, 'destroy'])
    router.post('/:id/complete', [TrainingPlanningController, 'complete'])
    router.post('/:id/uncomplete', [TrainingPlanningController, 'uncomplete'])
    router.post('/:id/move', [TrainingPlanningController, 'move'])
  })
  .prefix('/api/training/planning')
  .use(middleware.auth())

// Routes Training Module - Statistiques
router
  .group(() => {
    router.get('/week', [TrainingPlanningController, 'weekStats'])
  })
  .prefix('/api/training/stats')
  .use(middleware.auth())

// Routes Rapports protégées
router
  .group(() => {
    router.get('/monthly', [ReportsController, 'monthly'])
    router.get('/annual', [ReportsController, 'annual'])
  })
  .prefix('/api/reports')
  .use(middleware.auth())

// Routes Training Module - Exercices PPG
router
  .group(() => {
    router.get('/', [PpgExercisesController, 'index'])
    router.post('/', [PpgExercisesController, 'store'])
    router.get('/:id', [PpgExercisesController, 'show'])
    router.put('/:id', [PpgExercisesController, 'update'])
    router.delete('/:id', [PpgExercisesController, 'destroy'])
  })
  .prefix('/api/training/ppg-exercises')
  .use(middleware.auth())

// Routes Training Module - Programmes d'entraînement
router
  .group(() => {
    router.get('/', [TrainingProgramsController, 'index'])
    router.post('/', [TrainingProgramsController, 'store'])
    router.get('/:id', [TrainingProgramsController, 'show'])
    router.put('/:id', [TrainingProgramsController, 'update'])
    router.delete('/:id', [TrainingProgramsController, 'destroy'])
    router.post('/:id/duplicate', [TrainingProgramsController, 'duplicate'])
    router.post('/:id/apply', [TrainingProgramsController, 'apply'])
    router.get('/:id/preview', [TrainingProgramsController, 'preview'])
  })
  .prefix('/api/training/programs')
  .use(middleware.auth())

// Routes Training Module - Import MRC
router
  .group(() => {
    router.post('/preview', [MrcImportController, 'preview'])
    router.post('/template', [MrcImportController, 'importAsTemplate'])
    router.post('/session', [MrcImportController, 'importAsSession'])
    router.post('/batch', [MrcImportController, 'importBatch'])
  })
  .prefix('/api/training/import-mrc')
  .use(middleware.auth())
