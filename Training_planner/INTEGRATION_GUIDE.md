# 🚴 Intégration Module Planification - Centre d'Analyse Cycliste

## 📁 Structure des fichiers à créer

```
centre-analyse-cycliste/
├── backend/
│   ├── app/
│   │   ├── Controllers/Http/
│   │   │   ├── TrainingSessionsController.ts
│   │   │   ├── TrainingTemplatesController.ts
│   │   │   └── TrainingPlanningController.ts
│   │   ├── Models/
│   │   │   ├── TrainingSession.ts
│   │   │   ├── TrainingTemplate.ts
│   │   │   └── PlannedSession.ts
│   │   ├── Validators/
│   │   │   ├── TrainingSessionValidator.ts
│   │   │   └── TrainingTemplateValidator.ts
│   │   └── Services/
│   │       └── TrainingService.ts
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── xxxx_create_training_templates_table.ts
│   │   │   ├── xxxx_create_training_sessions_table.ts
│   │   │   └── xxxx_create_planned_sessions_table.ts
│   │   └── seeders/
│   │       └── TrainingTemplateSeeder.ts
│   └── start/
│       └── routes.ts  (ajouter les routes)
│
└── frontend/
    └── src/
        ├── pages/
        │   └── TrainingPlanner.tsx
        ├── components/
        │   └── training/
        │       ├── SessionForm.tsx
        │       ├── SessionCard.tsx
        │       ├── SessionGraph.tsx
        │       ├── BlockEditor.tsx
        │       ├── TemplateLibrary.tsx
        │       ├── PlanningCalendar.tsx
        │       └── ProfilePanel.tsx
        ├── services/
        │   └── trainingApi.ts
        ├── stores/
        │   └── trainingStore.ts
        └── types/
            └── training.ts
```

---

## 🗄️ BACKEND - AdonisJS 6

### 1. Migrations

#### `database/migrations/xxxx_create_training_templates_table.ts`

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').nullable()
      
      table.string('name', 255).notNullable()
      table.enum('category', ['cycling', 'ppg']).notNullable().defaultTo('cycling')
      table.enum('level', ['beginner', 'intermediate', 'expert']).defaultTo('intermediate')
      table.enum('location', ['indoor', 'outdoor', 'both']).nullable()
      table.string('intensity_ref', 50).defaultTo('ftp')
      
      table.integer('week').unsigned().nullable()
      table.integer('duration').unsigned().notNullable() // minutes
      table.integer('tss').unsigned().nullable()
      table.text('description').nullable()
      
      // Stockage JSON des blocs (cycling) ou exercices (ppg)
      table.json('blocks').nullable()
      table.json('exercises').nullable()
      
      table.boolean('is_default').defaultTo(false)
      table.boolean('is_public').defaultTo(false)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['user_id', 'category'])
      table.index(['week'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

#### `database/migrations/xxxx_create_training_sessions_table.ts`

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.integer('template_id').unsigned().references('training_templates.id').onDelete('SET NULL').nullable()
      
      table.string('name', 255).notNullable()
      table.enum('category', ['cycling', 'ppg']).notNullable().defaultTo('cycling')
      table.enum('level', ['beginner', 'intermediate', 'expert']).defaultTo('intermediate')
      table.enum('location', ['indoor', 'outdoor', 'both']).nullable()
      table.string('intensity_ref', 50).defaultTo('ftp')
      
      table.integer('duration').unsigned().notNullable() // minutes
      table.integer('tss').unsigned().nullable()
      table.text('description').nullable()
      
      table.json('blocks').nullable()
      table.json('exercises').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

#### `database/migrations/xxxx_create_planned_sessions_table.ts`

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'planned_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.integer('session_id').unsigned().references('training_sessions.id').onDelete('CASCADE').notNullable()
      
      table.date('planned_date').notNullable()
      table.integer('order').unsigned().defaultTo(0) // Ordre dans la journée
      
      table.boolean('completed').defaultTo(false)
      table.timestamp('completed_at').nullable()
      table.text('notes').nullable()
      
      // Lien optionnel vers l'activité réelle (fichier FIT importé)
      table.integer('activity_id').unsigned().references('activities.id').onDelete('SET NULL').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['user_id', 'planned_date'])
      table.unique(['user_id', 'session_id', 'planned_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

#### `database/migrations/xxxx_add_ftp_to_users_table.ts`

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('ftp').unsigned().defaultTo(200)
      table.decimal('weight', 5, 2).defaultTo(75.00)
      table.integer('fc_max').unsigned().defaultTo(185)
      table.integer('fc_repos').unsigned().defaultTo(50)
      table.json('ftp_history').nullable() // [{ftp: 200, date: '2025-01-15'}]
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ftp')
      table.dropColumn('weight')
      table.dropColumn('fc_max')
      table.dropColumn('fc_repos')
      table.dropColumn('ftp_history')
    })
  }
}
```

---

### 2. Models

#### `app/Models/TrainingTemplate.ts`

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './User.js'

export type BlockType = 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown'
export type SessionCategory = 'cycling' | 'ppg'
export type SessionLevel = 'beginner' | 'intermediate' | 'expert'
export type SessionLocation = 'indoor' | 'outdoor' | 'both'

export interface CyclingBlock {
  type: BlockType
  duration: string      // "MM:SS"
  percentFtp: number    // % de la FTP
  reps: number
  notes: string
}

export interface PpgExercise {
  name: string
  duration: string
  reps: number | null
  sets: number
  rest: string
  hrTarget: string
  notes: string
}

export default class TrainingTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare name: string

  @column()
  declare category: SessionCategory

  @column()
  declare level: SessionLevel

  @column()
  declare location: SessionLocation | null

  @column()
  declare intensityRef: string

  @column()
  declare week: number | null

  @column()
  declare duration: number

  @column()
  declare tss: number | null

  @column()
  declare description: string | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare blocks: CyclingBlock[] | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare exercises: PpgExercise[] | null

  @column()
  declare isDefault: boolean

  @column()
  declare isPublic: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
```

#### `app/Models/TrainingSession.ts`

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './User.js'
import TrainingTemplate, { CyclingBlock, PpgExercise, SessionCategory, SessionLevel, SessionLocation } from './TrainingTemplate.js'
import PlannedSession from './PlannedSession.js'

export default class TrainingSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare templateId: number | null

  @column()
  declare name: string

  @column()
  declare category: SessionCategory

  @column()
  declare level: SessionLevel

  @column()
  declare location: SessionLocation | null

  @column()
  declare intensityRef: string

  @column()
  declare duration: number

  @column()
  declare tss: number | null

  @column()
  declare description: string | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare blocks: CyclingBlock[] | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare exercises: PpgExercise[] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TrainingTemplate)
  declare template: BelongsTo<typeof TrainingTemplate>

  @hasMany(() => PlannedSession)
  declare plannedSessions: HasMany<typeof PlannedSession>
}
```

#### `app/Models/PlannedSession.ts`

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './User.js'
import TrainingSession from './TrainingSession.js'

export default class PlannedSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare sessionId: number

  @column.date()
  declare plannedDate: DateTime

  @column()
  declare order: number

  @column()
  declare completed: boolean

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare activityId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TrainingSession)
  declare session: BelongsTo<typeof TrainingSession>
}
```

---

### 3. Controllers

#### `app/Controllers/Http/TrainingSessionsController.ts`

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import TrainingSession from '#models/TrainingSession'
import { createSessionValidator, updateSessionValidator } from '#validators/TrainingSessionValidator'

export default class TrainingSessionsController {
  /**
   * Liste des séances de l'utilisateur
   */
  async index({ auth, request }: HttpContext) {
    const user = auth.user!
    const { category } = request.qs()

    const query = TrainingSession.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')

    if (category) {
      query.where('category', category)
    }

    const sessions = await query

    return sessions
  }

  /**
   * Créer une séance
   */
  async store({ auth, request }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createSessionValidator)

    const session = await TrainingSession.create({
      ...payload,
      userId: user.id,
    })

    return session
  }

  /**
   * Détails d'une séance
   */
  async show({ auth, params }: HttpContext) {
    const user = auth.user!

    const session = await TrainingSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    return session
  }

  /**
   * Modifier une séance
   */
  async update({ auth, params, request }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateSessionValidator)

    const session = await TrainingSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    session.merge(payload)
    await session.save()

    return session
  }

  /**
   * Supprimer une séance
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const session = await TrainingSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await session.delete()

    return response.noContent()
  }
}
```

#### `app/Controllers/Http/TrainingTemplatesController.ts`

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import TrainingTemplate from '#models/TrainingTemplate'
import { createTemplateValidator, updateTemplateValidator } from '#validators/TrainingTemplateValidator'

export default class TrainingTemplatesController {
  /**
   * Liste des templates (défaut + utilisateur)
   */
  async index({ auth, request }: HttpContext) {
    const user = auth.user!
    const { category, week } = request.qs()

    const query = TrainingTemplate.query()
      .where((q) => {
        q.where('isDefault', true)
          .orWhere('userId', user.id)
      })
      .orderBy('week', 'asc')
      .orderBy('name', 'asc')

    if (category) {
      query.where('category', category)
    }

    if (week) {
      query.where('week', week)
    }

    const templates = await query

    return templates
  }

  /**
   * Créer un template personnel
   */
  async store({ auth, request }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createTemplateValidator)

    const template = await TrainingTemplate.create({
      ...payload,
      userId: user.id,
      isDefault: false,
    })

    return template
  }

  /**
   * Modifier un template (seulement les templates personnels)
   */
  async update({ auth, params, request }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateTemplateValidator)

    const template = await TrainingTemplate.query()
      .where('id', params.id)
      .where('userId', user.id)
      .where('isDefault', false)
      .firstOrFail()

    template.merge(payload)
    await template.save()

    return template
  }

  /**
   * Supprimer un template personnel
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const template = await TrainingTemplate.query()
      .where('id', params.id)
      .where('userId', user.id)
      .where('isDefault', false)
      .firstOrFail()

    await template.delete()

    return response.noContent()
  }

  /**
   * Dupliquer un template
   */
  async duplicate({ auth, params }: HttpContext) {
    const user = auth.user!

    const original = await TrainingTemplate.findOrFail(params.id)

    const duplicate = await TrainingTemplate.create({
      userId: user.id,
      name: `${original.name} (copie)`,
      category: original.category,
      level: original.level,
      location: original.location,
      intensityRef: original.intensityRef,
      week: original.week,
      duration: original.duration,
      tss: original.tss,
      description: original.description,
      blocks: original.blocks,
      exercises: original.exercises,
      isDefault: false,
    })

    return duplicate
  }
}
```

#### `app/Controllers/Http/TrainingPlanningController.ts`

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PlannedSession from '#models/PlannedSession'
import TrainingSession from '#models/TrainingSession'

export default class TrainingPlanningController {
  /**
   * Récupérer le planning (par mois ou période)
   */
  async index({ auth, request }: HttpContext) {
    const user = auth.user!
    const { start, end, month, year } = request.qs()

    let startDate: DateTime
    let endDate: DateTime

    if (month && year) {
      startDate = DateTime.fromObject({ year: parseInt(year), month: parseInt(month), day: 1 })
      endDate = startDate.endOf('month')
    } else if (start && end) {
      startDate = DateTime.fromISO(start)
      endDate = DateTime.fromISO(end)
    } else {
      // Par défaut : mois courant
      startDate = DateTime.now().startOf('month')
      endDate = DateTime.now().endOf('month')
    }

    const planned = await PlannedSession.query()
      .where('userId', user.id)
      .whereBetween('plannedDate', [startDate.toSQLDate()!, endDate.toSQLDate()!])
      .preload('session')
      .orderBy('plannedDate', 'asc')
      .orderBy('order', 'asc')

    // Grouper par date
    const grouped: Record<string, typeof planned> = {}
    for (const p of planned) {
      const dateKey = p.plannedDate.toISODate()!
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(p)
    }

    return grouped
  }

  /**
   * Ajouter une séance au planning
   */
  async store({ auth, request }: HttpContext) {
    const user = auth.user!
    const { sessionId, date } = request.only(['sessionId', 'date'])

    // Vérifier que la séance appartient à l'utilisateur
    await TrainingSession.query()
      .where('id', sessionId)
      .where('userId', user.id)
      .firstOrFail()

    // Compter les séances déjà planifiées ce jour pour l'ordre
    const count = await PlannedSession.query()
      .where('userId', user.id)
      .where('plannedDate', date)
      .count('* as total')

    const planned = await PlannedSession.create({
      userId: user.id,
      sessionId,
      plannedDate: DateTime.fromISO(date),
      order: Number(count[0].$extras.total),
    })

    await planned.load('session')

    return planned
  }

  /**
   * Retirer une séance du planning
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const planned = await PlannedSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await planned.delete()

    return response.noContent()
  }

  /**
   * Marquer une séance comme complétée
   */
  async complete({ auth, params, request }: HttpContext) {
    const user = auth.user!
    const { activityId, notes } = request.only(['activityId', 'notes'])

    const planned = await PlannedSession.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    planned.completed = true
    planned.completedAt = DateTime.now()
    planned.activityId = activityId || null
    planned.notes = notes || null

    await planned.save()
    await planned.load('session')

    return planned
  }

  /**
   * Stats de la semaine
   */
  async weekStats({ auth, request }: HttpContext) {
    const user = auth.user!
    const { date } = request.qs()

    const refDate = date ? DateTime.fromISO(date) : DateTime.now()
    const startOfWeek = refDate.startOf('week')
    const endOfWeek = refDate.endOf('week')

    const planned = await PlannedSession.query()
      .where('userId', user.id)
      .whereBetween('plannedDate', [startOfWeek.toSQLDate()!, endOfWeek.toSQLDate()!])
      .preload('session')

    let totalDuration = 0
    let totalTss = 0
    let completedCount = 0

    for (const p of planned) {
      totalDuration += p.session.duration || 0
      totalTss += p.session.tss || 0
      if (p.completed) completedCount++
    }

    return {
      startDate: startOfWeek.toISODate(),
      endDate: endOfWeek.toISODate(),
      sessionCount: planned.length,
      completedCount,
      totalDuration,
      totalTss,
    }
  }
}
```

---

### 4. Validators

#### `app/Validators/TrainingSessionValidator.ts`

```typescript
import vine from '@vinejs/vine'

export const createSessionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    category: vine.enum(['cycling', 'ppg']),
    level: vine.enum(['beginner', 'intermediate', 'expert']).optional(),
    location: vine.enum(['indoor', 'outdoor', 'both']).optional(),
    intensityRef: vine.string().optional(),
    duration: vine.number().min(1),
    tss: vine.number().min(0).optional(),
    description: vine.string().optional(),
    blocks: vine.array(
      vine.object({
        type: vine.enum(['warmup', 'interval', 'effort', 'recovery', 'cooldown']),
        duration: vine.string(),
        percentFtp: vine.number().min(0).max(300),
        reps: vine.number().min(1),
        notes: vine.string().optional(),
      })
    ).optional(),
    exercises: vine.array(
      vine.object({
        name: vine.string(),
        duration: vine.string(),
        reps: vine.number().nullable(),
        sets: vine.number().min(1),
        rest: vine.string(),
        hrTarget: vine.string().optional(),
        notes: vine.string().optional(),
      })
    ).optional(),
    templateId: vine.number().optional(),
  })
)

export const updateSessionValidator = createSessionValidator
```

---

### 5. Routes

#### `start/routes.ts` (ajouter)

```typescript
import router from '@adonisjs/core/services/router'

const TrainingSessionsController = () => import('#controllers/TrainingSessionsController')
const TrainingTemplatesController = () => import('#controllers/TrainingTemplatesController')
const TrainingPlanningController = () => import('#controllers/TrainingPlanningController')

// Routes Training (protégées par auth)
router.group(() => {
  // Sessions
  router.get('/training/sessions', [TrainingSessionsController, 'index'])
  router.post('/training/sessions', [TrainingSessionsController, 'store'])
  router.get('/training/sessions/:id', [TrainingSessionsController, 'show'])
  router.put('/training/sessions/:id', [TrainingSessionsController, 'update'])
  router.delete('/training/sessions/:id', [TrainingSessionsController, 'destroy'])

  // Templates
  router.get('/training/templates', [TrainingTemplatesController, 'index'])
  router.post('/training/templates', [TrainingTemplatesController, 'store'])
  router.put('/training/templates/:id', [TrainingTemplatesController, 'update'])
  router.delete('/training/templates/:id', [TrainingTemplatesController, 'destroy'])
  router.post('/training/templates/:id/duplicate', [TrainingTemplatesController, 'duplicate'])

  // Planning
  router.get('/training/planning', [TrainingPlanningController, 'index'])
  router.post('/training/planning', [TrainingPlanningController, 'store'])
  router.delete('/training/planning/:id', [TrainingPlanningController, 'destroy'])
  router.post('/training/planning/:id/complete', [TrainingPlanningController, 'complete'])
  router.get('/training/stats/week', [TrainingPlanningController, 'weekStats'])

}).prefix('/api').middleware('auth')
```

---

### 6. Seeder pour les templates par défaut

#### `database/seeders/TrainingTemplateSeeder.ts`

```typescript
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TrainingTemplate from '#models/TrainingTemplate'

export default class extends BaseSeeder {
  async run() {
    // Vérifier si les templates par défaut existent déjà
    const existing = await TrainingTemplate.query().where('isDefault', true).first()
    if (existing) {
      console.log('Default templates already exist, skipping...')
      return
    }

    await TrainingTemplate.createMany([
      // CYCLING - Semaine 1
      {
        name: 'Test Puissance Critique',
        category: 'cycling',
        level: 'beginner',
        week: 1,
        duration: 68,
        tss: 68,
        description: 'Test pour déterminer la puissance critique. Version débutant avec efforts de 3min et 12min.',
        isDefault: true,
        blocks: [
          { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
          { type: 'warmup', duration: '03:00', percentFtp: 67, reps: 1, notes: '' },
          { type: 'warmup', duration: '02:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'interval', duration: '00:15', percentFtp: 150, reps: 4, notes: 'Sprint' },
          { type: 'recovery', duration: '00:45', percentFtp: 50, reps: 4, notes: '' },
          { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
          { type: 'effort', duration: '03:00', percentFtp: 125, reps: 1, notes: 'Meilleure puissance possible' },
          { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'effort', duration: '12:00', percentFtp: 95, reps: 1, notes: 'Meilleure puissance possible' },
          { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' },
        ],
      },
      {
        name: 'Test Puissance Critique',
        category: 'cycling',
        level: 'expert',
        week: 1,
        duration: 80,
        tss: 88,
        description: 'Test pour déterminer la puissance critique. Version expert avec efforts de 5min et 20min.',
        isDefault: true,
        blocks: [
          { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'warmup', duration: '05:00', percentFtp: 58, reps: 1, notes: '' },
          { type: 'warmup', duration: '03:00', percentFtp: 67, reps: 1, notes: '' },
          { type: 'warmup', duration: '02:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'interval', duration: '00:15', percentFtp: 150, reps: 4, notes: 'Sprint' },
          { type: 'recovery', duration: '00:45', percentFtp: 50, reps: 4, notes: '' },
          { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
          { type: 'effort', duration: '05:00', percentFtp: 125, reps: 1, notes: 'Meilleure puissance possible' },
          { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'effort', duration: '20:00', percentFtp: 95, reps: 1, notes: 'Meilleure puissance possible' },
          { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' },
        ],
      },
      {
        name: 'Endurance + Vélocité',
        category: 'cycling',
        level: 'intermediate',
        week: 1,
        duration: 55,
        tss: 42,
        description: 'Séance combinant endurance Z2 et travail de vélocité.',
        isDefault: true,
        blocks: [
          { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'warmup', duration: '05:00', percentFtp: 58, reps: 1, notes: '' },
          { type: 'warmup', duration: '05:00', percentFtp: 67, reps: 1, notes: '' },
          { type: 'interval', duration: '01:00', percentFtp: 67, reps: 6, notes: '100-110 rpm' },
          { type: 'recovery', duration: '02:00', percentFtp: 50, reps: 6, notes: '' },
          { type: 'warmup', duration: '05:00', percentFtp: 67, reps: 1, notes: '' },
          { type: 'cooldown', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
        ],
      },
      {
        name: 'Sweet Spot Z2 + 3 blocs',
        category: 'cycling',
        level: 'intermediate',
        location: 'indoor',
        week: 1,
        duration: 65,
        tss: 63,
        description: 'Séance Sweet Spot en intérieur (88-94% FTP).',
        isDefault: true,
        blocks: [
          { type: 'warmup', duration: '05:00', percentFtp: 42, reps: 1, notes: '' },
          { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
          { type: 'warmup', duration: '05:00', percentFtp: 58, reps: 1, notes: '' },
          { type: 'effort', duration: '08:00', percentFtp: 90, reps: 3, notes: 'Sweet Spot' },
          { type: 'recovery', duration: '04:00', percentFtp: 50, reps: 3, notes: '' },
          { type: 'cooldown', duration: '05:00', percentFtp: 42, reps: 1, notes: '' },
        ],
      },
      // PPG - Semaine 1
      {
        name: 'Circuit PPG Complet',
        category: 'ppg',
        level: 'beginner',
        week: 1,
        duration: 30,
        description: 'Circuit de base : Air Squat, Planche, Fentes, Chaise, Romanian Deadlift',
        isDefault: true,
        exercises: [
          { name: 'Air Squat', duration: '00:30', reps: 15, sets: 3, rest: '00:30', hrTarget: '115-153', notes: '' },
          { name: 'Planche', duration: '00:45', reps: null, sets: 3, rest: '00:30', hrTarget: '115-153', notes: '' },
          { name: 'Fentes arrières', duration: '00:30', reps: 12, sets: 3, rest: '00:30', hrTarget: '115-153', notes: '' },
          { name: 'Chaise murale', duration: '00:45', reps: null, sets: 3, rest: '00:30', hrTarget: '115-153', notes: '' },
          { name: 'Romanian Deadlift', duration: '00:30', reps: 12, sets: 3, rest: '00:30', hrTarget: '115-153', notes: '' },
        ],
      },
    ])

    console.log('Default training templates seeded!')
  }
}
```

---

## 💻 FRONTEND - React + TypeScript

### 1. Types

#### `src/types/training.ts`

```typescript
export type BlockType = 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown'
export type SessionCategory = 'cycling' | 'ppg'
export type SessionLevel = 'beginner' | 'intermediate' | 'expert'
export type SessionLocation = 'indoor' | 'outdoor' | 'both'

export interface CyclingBlock {
  type: BlockType
  duration: string
  percentFtp: number
  reps: number
  notes: string
}

export interface PpgExercise {
  name: string
  duration: string
  reps: number | null
  sets: number
  rest: string
  hrTarget: string
  notes: string
}

export interface TrainingTemplate {
  id: number
  userId: number | null
  name: string
  category: SessionCategory
  level: SessionLevel
  location?: SessionLocation
  intensityRef: string
  week?: number
  duration: number
  tss?: number
  description?: string
  blocks?: CyclingBlock[]
  exercises?: PpgExercise[]
  isDefault: boolean
}

export interface TrainingSession {
  id: number
  userId: number
  templateId?: number
  name: string
  category: SessionCategory
  level: SessionLevel
  location?: SessionLocation
  intensityRef: string
  duration: number
  tss?: number
  description?: string
  blocks?: CyclingBlock[]
  exercises?: PpgExercise[]
}

export interface PlannedSession {
  id: number
  userId: number
  sessionId: number
  plannedDate: string
  order: number
  completed: boolean
  completedAt?: string
  notes?: string
  activityId?: number
  session: TrainingSession
}

export interface UserProfile {
  ftp: number
  weight: number
  fcMax: number
  fcRepos: number
  ftpHistory: { ftp: number; date: string }[]
}

export interface WeekStats {
  startDate: string
  endDate: string
  sessionCount: number
  completedCount: number
  totalDuration: number
  totalTss: number
}
```

---

### 2. Service API

#### `src/services/trainingApi.ts`

```typescript
import axios from 'axios'
import type {
  TrainingTemplate,
  TrainingSession,
  PlannedSession,
  WeekStats,
} from '@/types/training'

const api = axios.create({
  baseURL: '/api/training',
})

// Templates
export const templatesApi = {
  list: (params?: { category?: string; week?: number }) =>
    api.get<TrainingTemplate[]>('/templates', { params }),

  create: (data: Partial<TrainingTemplate>) =>
    api.post<TrainingTemplate>('/templates', data),

  update: (id: number, data: Partial<TrainingTemplate>) =>
    api.put<TrainingTemplate>(`/templates/${id}`, data),

  delete: (id: number) =>
    api.delete(`/templates/${id}`),

  duplicate: (id: number) =>
    api.post<TrainingTemplate>(`/templates/${id}/duplicate`),
}

// Sessions
export const sessionsApi = {
  list: (params?: { category?: string }) =>
    api.get<TrainingSession[]>('/sessions', { params }),

  create: (data: Partial<TrainingSession>) =>
    api.post<TrainingSession>('/sessions', data),

  get: (id: number) =>
    api.get<TrainingSession>(`/sessions/${id}`),

  update: (id: number, data: Partial<TrainingSession>) =>
    api.put<TrainingSession>(`/sessions/${id}`, data),

  delete: (id: number) =>
    api.delete(`/sessions/${id}`),
}

// Planning
export const planningApi = {
  list: (params: { month: number; year: number } | { start: string; end: string }) =>
    api.get<Record<string, PlannedSession[]>>('/planning', { params }),

  add: (sessionId: number, date: string) =>
    api.post<PlannedSession>('/planning', { sessionId, date }),

  remove: (id: number) =>
    api.delete(`/planning/${id}`),

  complete: (id: number, data?: { activityId?: number; notes?: string }) =>
    api.post<PlannedSession>(`/planning/${id}/complete`, data),

  weekStats: (date?: string) =>
    api.get<WeekStats>('/stats/week', { params: { date } }),
}

export default {
  templates: templatesApi,
  sessions: sessionsApi,
  planning: planningApi,
}
```

---

### 3. Store Zustand

#### `src/stores/trainingStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TrainingTemplate,
  TrainingSession,
  PlannedSession,
  UserProfile,
  WeekStats,
} from '@/types/training'
import trainingApi from '@/services/trainingApi'

interface TrainingState {
  // Data
  templates: TrainingTemplate[]
  sessions: TrainingSession[]
  planning: Record<string, PlannedSession[]>
  weekStats: WeekStats | null
  
  // Profile (persisted locally, synced with user)
  profile: UserProfile
  
  // UI State
  loading: boolean
  error: string | null
  
  // Actions
  fetchTemplates: (params?: { category?: string; week?: number }) => Promise<void>
  fetchSessions: () => Promise<void>
  fetchPlanning: (month: number, year: number) => Promise<void>
  fetchWeekStats: () => Promise<void>
  
  createSession: (data: Partial<TrainingSession>) => Promise<TrainingSession>
  updateSession: (id: number, data: Partial<TrainingSession>) => Promise<void>
  deleteSession: (id: number) => Promise<void>
  
  createTemplate: (data: Partial<TrainingTemplate>) => Promise<TrainingTemplate>
  updateTemplate: (id: number, data: Partial<TrainingTemplate>) => Promise<void>
  deleteTemplate: (id: number) => Promise<void>
  duplicateTemplate: (id: number) => Promise<TrainingTemplate>
  
  addToPlanning: (sessionId: number, date: string) => Promise<void>
  removeFromPlanning: (id: number) => Promise<void>
  completeSession: (id: number, data?: { activityId?: number; notes?: string }) => Promise<void>
  
  updateProfile: (profile: Partial<UserProfile>) => void
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      templates: [],
      sessions: [],
      planning: {},
      weekStats: null,
      profile: {
        ftp: 200,
        weight: 75,
        fcMax: 185,
        fcRepos: 50,
        ftpHistory: [],
      },
      loading: false,
      error: null,

      fetchTemplates: async (params) => {
        set({ loading: true, error: null })
        try {
          const { data } = await trainingApi.templates.list(params)
          set({ templates: data, loading: false })
        } catch (e: any) {
          set({ error: e.message, loading: false })
        }
      },

      fetchSessions: async () => {
        set({ loading: true, error: null })
        try {
          const { data } = await trainingApi.sessions.list()
          set({ sessions: data, loading: false })
        } catch (e: any) {
          set({ error: e.message, loading: false })
        }
      },

      fetchPlanning: async (month, year) => {
        set({ loading: true, error: null })
        try {
          const { data } = await trainingApi.planning.list({ month, year })
          set({ planning: data, loading: false })
        } catch (e: any) {
          set({ error: e.message, loading: false })
        }
      },

      fetchWeekStats: async () => {
        try {
          const { data } = await trainingApi.planning.weekStats()
          set({ weekStats: data })
        } catch (e: any) {
          console.error('Error fetching week stats:', e)
        }
      },

      createSession: async (data) => {
        const { data: session } = await trainingApi.sessions.create(data)
        set({ sessions: [...get().sessions, session] })
        return session
      },

      updateSession: async (id, data) => {
        await trainingApi.sessions.update(id, data)
        const sessions = get().sessions.map((s) =>
          s.id === id ? { ...s, ...data } : s
        )
        set({ sessions })
      },

      deleteSession: async (id) => {
        await trainingApi.sessions.delete(id)
        set({ sessions: get().sessions.filter((s) => s.id !== id) })
      },

      createTemplate: async (data) => {
        const { data: template } = await trainingApi.templates.create(data)
        set({ templates: [...get().templates, template] })
        return template
      },

      updateTemplate: async (id, data) => {
        await trainingApi.templates.update(id, data)
        const templates = get().templates.map((t) =>
          t.id === id ? { ...t, ...data } : t
        )
        set({ templates })
      },

      deleteTemplate: async (id) => {
        await trainingApi.templates.delete(id)
        set({ templates: get().templates.filter((t) => t.id !== id) })
      },

      duplicateTemplate: async (id) => {
        const { data: template } = await trainingApi.templates.duplicate(id)
        set({ templates: [...get().templates, template] })
        return template
      },

      addToPlanning: async (sessionId, date) => {
        const { data: planned } = await trainingApi.planning.add(sessionId, date)
        const planning = { ...get().planning }
        if (!planning[date]) planning[date] = []
        planning[date].push(planned)
        set({ planning })
        get().fetchWeekStats()
      },

      removeFromPlanning: async (id) => {
        await trainingApi.planning.remove(id)
        const planning = { ...get().planning }
        Object.keys(planning).forEach((date) => {
          planning[date] = planning[date].filter((p) => p.id !== id)
          if (planning[date].length === 0) delete planning[date]
        })
        set({ planning })
        get().fetchWeekStats()
      },

      completeSession: async (id, data) => {
        const { data: updated } = await trainingApi.planning.complete(id, data)
        const planning = { ...get().planning }
        Object.keys(planning).forEach((date) => {
          planning[date] = planning[date].map((p) =>
            p.id === id ? updated : p
          )
        })
        set({ planning })
        get().fetchWeekStats()
      },

      updateProfile: (newProfile) => {
        const current = get().profile
        const updated = { ...current, ...newProfile }
        
        // Si la FTP a changé, l'ajouter à l'historique
        if (newProfile.ftp && newProfile.ftp !== current.ftp) {
          updated.ftpHistory = [
            ...current.ftpHistory,
            { ftp: current.ftp, date: new Date().toISOString() },
          ]
        }
        
        set({ profile: updated })
      },
    }),
    {
      name: 'training-store',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
```

---

## 🚀 Commandes d'installation

```bash
# Backend
cd backend
node ace migration:run
node ace db:seed

# Frontend
cd frontend
# Les composants React sont à créer en reprenant training-planner-v3.jsx
# et en le découpant selon la structure proposée
```

---

## 📝 Notes d'intégration

1. **FTP synchronisée** : La FTP est stockée localement (Zustand persist) et peut être synchronisée avec le profil utilisateur en base

2. **Templates par défaut** : Créés via le seeder, protégés contre la suppression

3. **Lien avec activités** : Le champ `activityId` dans `planned_sessions` permet de lier une séance complétée à un fichier FIT importé

4. **Extension future** : Ajouter un calcul automatique du TSS réel vs prévu en comparant l'activité importée à la séance planifiée
