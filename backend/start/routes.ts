/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import app from '@adonisjs/core/services/app'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const WeightHistoriesController = () => import('#controllers/weight_histories_controller')
const ActivitiesController = () => import('#controllers/activities_controller')
const EquipmentController = () => import('#controllers/equipment_controller')
const ExportsController = () => import('#controllers/exports_controller')
const BadgesController = () => import('#controllers/badges_controller')
const GoalsController = () => import('#controllers/goals_controller')
const PersonalRecordsController = () => import('#controllers/personal_records_controller')

// Health check
router.get('/', async () => {
  return {
    app: 'Centre d\'Analyse Cycliste API',
    version: '1.0.0',
    status: 'running',
  }
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
    router.post('/upload', [ActivitiesController, 'upload']).use([middleware.rateLimit(['handleUpload'])])
    router.get('/stats', [ActivitiesController, 'stats'])
    router.get('/cycling-stats', [ActivitiesController, 'cyclingStats'])
    router.get('/training-load', [ActivitiesController, 'trainingLoad'])
    router.get('/:id', [ActivitiesController, 'show'])
    router.patch('/:id', [ActivitiesController, 'update'])
    router.post('/:id/replace-file', [ActivitiesController, 'replaceFile']).use([middleware.rateLimit(['handleUpload'])])
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

// Routes badges protégées
router
  .group(() => {
    router.get('/', [BadgesController, 'index'])
    router.post('/check', [BadgesController, 'check'])
  })
  .prefix('/api/badges')
  .use(middleware.auth())

// Routes objectifs protégées
router
  .group(() => {
    router.get('/', [GoalsController, 'index'])
    router.post('/', [GoalsController, 'store'])
    router.get('/:id', [GoalsController, 'show'])
    router.patch('/:id', [GoalsController, 'update'])
    router.delete('/:id', [GoalsController, 'destroy'])
  })
  .prefix('/api/goals')
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
