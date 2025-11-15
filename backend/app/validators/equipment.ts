import vine from '@vinejs/vine'

export const createEquipmentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100).trim(),
    type: vine.string().minLength(2).maxLength(50),
    brand: vine.string().maxLength(50).optional(),
    model: vine.string().maxLength(50).optional(),
    purchaseDate: vine.string().optional(),
    initialDistance: vine.number().min(0).optional(),
    maxDistance: vine.number().min(0).optional(),
    notes: vine.string().maxLength(500).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateEquipmentValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100).trim().optional(),
    type: vine.string().minLength(2).maxLength(50).optional(),
    brand: vine.string().maxLength(50).optional().nullable(),
    model: vine.string().maxLength(50).optional().nullable(),
    purchaseDate: vine.string().optional(),
    maxDistance: vine.number().min(0).optional().nullable(),
    notes: vine.string().maxLength(500).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)
