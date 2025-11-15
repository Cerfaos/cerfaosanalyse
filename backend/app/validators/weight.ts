import vine from '@vinejs/vine'

export const createWeightValidator = vine.compile(
  vine.object({
    weight: vine.number().min(20).max(500),
    date: vine.string().optional(),
    notes: vine.string().maxLength(500).optional(),
  })
)

export const updateWeightValidator = vine.compile(
  vine.object({
    weight: vine.number().min(20).max(500).optional(),
    date: vine.string().optional(),
    notes: vine.string().maxLength(500).optional().nullable(),
  })
)
