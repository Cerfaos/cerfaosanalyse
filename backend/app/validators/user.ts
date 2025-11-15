import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(2).maxLength(100).trim().optional(),
    email: vine.string().email().trim().toLowerCase().optional(),
    weight: vine.number().min(20).max(500).optional().nullable(),
    height: vine.number().min(50).max(300).optional().nullable(),
    birthDate: vine.string().optional().nullable(),
    fcMax: vine.number().min(100).max(250).optional().nullable(),
    fcRepos: vine.number().min(30).max(120).optional().nullable(),
    ftp: vine.number().min(50).max(600).optional().nullable(),
  })
)
