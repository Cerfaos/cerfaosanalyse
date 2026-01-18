import vine from '@vinejs/vine'

/**
 * Schéma pour un bloc d'entraînement cycling
 * Note: tous les champs string sont requis pour correspondre au type CyclingBlock
 */
const cyclingBlockSchema = vine.object({
  type: vine.enum(['warmup', 'interval', 'effort', 'recovery', 'cooldown']),
  duration: vine.string().trim(), // Format "MM:SS"
  percentFtp: vine.number().min(0).max(300),
  reps: vine.number().min(1),
  notes: vine.string().optional(),
})

/**
 * Schéma pour un exercice PPG
 * Note: tous les champs string sont requis pour correspondre au type PpgExercise
 */
const ppgExerciseSchema = vine.object({
  name: vine.string().trim().minLength(1),
  duration: vine.string().trim(), // Format "MM:SS"
  reps: vine.number().nullable(),
  sets: vine.number().min(1),
  rest: vine.string().trim(), // Format "MM:SS"
  hrTarget: vine.string().optional(),
  notes: vine.string().optional(),
})

/**
 * Validator pour créer une séance
 */
export const createSessionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    category: vine.enum(['cycling', 'ppg']),
    level: vine.enum(['beginner', 'intermediate', 'expert']).optional(),
    location: vine.enum(['indoor', 'outdoor', 'both']).optional(),
    intensityRef: vine.string().trim().optional(),
    duration: vine.number().min(1),
    tss: vine.number().min(0).optional(),
    description: vine.string().maxLength(2000).optional(),
    blocks: vine.array(cyclingBlockSchema).optional(),
    exercises: vine.array(ppgExerciseSchema).optional(),
    templateId: vine.number().optional(),
    week: vine.number().min(1).optional(),
    day: vine.number().min(1).max(7).optional(),
  })
)

/**
 * Validator pour mettre à jour une séance
 */
export const updateSessionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    category: vine.enum(['cycling', 'ppg']).optional(),
    level: vine.enum(['beginner', 'intermediate', 'expert']).optional(),
    location: vine.enum(['indoor', 'outdoor', 'both']).optional().nullable(),
    intensityRef: vine.string().trim().optional(),
    duration: vine.number().min(1).optional(),
    tss: vine.number().min(0).optional().nullable(),
    description: vine.string().maxLength(2000).optional().nullable(),
    blocks: vine.array(cyclingBlockSchema).optional().nullable(),
    exercises: vine.array(ppgExerciseSchema).optional().nullable(),
    week: vine.number().min(1).optional().nullable(),
    day: vine.number().min(1).max(7).optional().nullable(),
  })
)
