import vine from '@vinejs/vine'

export const createGoalValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(2).maxLength(100).trim(),
    description: vine.string().maxLength(500).optional(),
    type: vine.enum(['distance', 'duration', 'activities', 'elevation', 'streak']),
    targetValue: vine.number().min(1),
    periodType: vine.enum(['weekly', 'monthly', 'yearly', 'total']),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
  })
)

export const updateGoalValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(2).maxLength(100).trim().optional(),
    description: vine.string().maxLength(500).optional().nullable(),
    targetValue: vine.number().min(1).optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
    isActive: vine.boolean().optional(),
  })
)
