import vine from '@vinejs/vine'

export const createActivityValidator = vine.compile(
  vine.object({
    date: vine.string(),
    type: vine.string().minLength(2).optional(),
    duration: vine.number().min(1),
    distance: vine.number().min(0),
    avgHeartRate: vine.number().min(30).max(250).optional(),
    maxHeartRate: vine.number().min(30).max(250).optional(),
    avgSpeed: vine.number().min(0).max(200).optional(),
    maxSpeed: vine.number().min(0).max(200).optional(),
    elevationGain: vine.number().min(0).optional(),
    elevationLoss: vine.number().min(0).optional(),
    calories: vine.number().min(0).optional(),
    avgCadence: vine.number().min(0).max(300).optional(),
    avgPower: vine.number().min(0).max(3000).optional(),
    normalizedPower: vine.number().min(0).max(3000).optional(),
    avgTemperature: vine.number().min(-50).max(60).optional(),
    maxTemperature: vine.number().min(-50).max(60).optional(),
    subSport: vine.string().optional(),
    movingTime: vine.number().min(0).optional(),
  })
)

export const updateActivityValidator = vine.compile(
  vine.object({
    type: vine.string().minLength(2).optional(),
    date: vine.string().optional(),
    duration: vine.number().min(1).optional(),
    distance: vine.number().min(0).optional(),
    avgHeartRate: vine.number().min(30).max(250).optional().nullable(),
    maxHeartRate: vine.number().min(30).max(250).optional().nullable(),
    avgSpeed: vine.number().min(0).max(200).optional().nullable(),
    maxSpeed: vine.number().min(0).max(200).optional().nullable(),
    avgPower: vine.number().min(0).max(3000).optional().nullable(),
    normalizedPower: vine.number().min(0).max(3000).optional().nullable(),
    avgCadence: vine.number().min(0).max(300).optional().nullable(),
    elevationGain: vine.number().min(0).optional().nullable(),
    calories: vine.number().min(0).optional().nullable(),
    equipmentId: vine.number().optional().nullable(),
    notes: vine.string().optional().nullable(),
    rpe: vine.number().min(1).max(10).optional().nullable(),
    feelingNotes: vine.string().maxLength(500).optional().nullable(),
    weatherCondition: vine.string().optional(),
    weatherTemperature: vine.number().min(-50).max(60).optional(),
    weatherWindSpeed: vine.number().min(0).optional(),
    weatherWindDirection: vine.number().min(0).max(360).optional(),
  })
)
