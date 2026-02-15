import Activity from '#models/activity'
import ActivityParserService from '#services/activity_parser_service'
import HeartRateZoneService from '#services/heart_rate_zone_service'
import PersonalRecordService from '#services/personal_record_service'
import TrainingLoadService from '#services/training_load_service'
import WeatherService from '#services/weather_service'
import type { ActivityUpdateData, ParsedActivity } from '#types/activity_parser'
import type { ZoneComputationSource } from '#types/training'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ActivitiesController {
  private parserService = new ActivityParserService()
  private trainingLoadService = new TrainingLoadService()
  private weatherService = new WeatherService()

  /**
   * Récupérer toutes les activités de l'utilisateur
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const type = request.input('type')
    const startDate = request.input('startDate')
    const endDate = request.input('endDate')
    const search = request.input('search')
    const fields = request.input('fields')

    let query = Activity.query().where('user_id', user.id).orderBy('date', 'desc')

    // Recherche textuelle dans les notes et le type
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(notes) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(feeling_notes) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(type) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(file_name) LIKE ?', [searchTerm])
      })
    }

    if (fields) {
      const fieldsArray = fields.split(',').map((f: string) => {
        return f.trim().replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      })
      query = query.select(fieldsArray)
    }

    if (type) {
      query = query.where('type', type)
    }

    if (startDate) {
      query = query.where('date', '>=', startDate)
    }

    if (endDate) {
      const endDatePlusOne = new Date(endDate)
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
      const endDateStr = endDatePlusOne.toISOString().split('T')[0]
      query = query.where('date', '<', endDateStr)
    }

    const activities = await query.paginate(page, limit)

    return response.ok({
      message: 'Activités récupérées',
      data: activities,
    })
  }

  /**
   * Récupérer une activité spécifique
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const activity = await Activity.query().where('id', params.id).where('user_id', user.id).first()

    if (!activity) {
      return response.notFound({ message: 'Activité non trouvée' })
    }

    return response.ok({ message: 'Activité récupérée', data: activity })
  }

  /**
   * Créer une activité manuellement (sans fichier)
   */
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only([
      'date', 'type', 'duration', 'distance', 'avgHeartRate', 'maxHeartRate',
      'avgSpeed', 'maxSpeed', 'elevationGain', 'elevationLoss', 'calories',
      'avgCadence', 'avgPower', 'normalizedPower', 'avgTemperature', 'maxTemperature',
      'subSport', 'movingTime', 'rpe', 'feelingNotes', 'youtubeUrl',
    ])

    // Vérifier s'il y a un fichier GPX pour les données GPS
    const gpxFile = request.file('gpxFile', { size: '10mb', extnames: ['gpx'] })
    let gpsDataString: string | null = null
    let parsedGpxData: ParsedActivity | null = null

    if (gpxFile && gpxFile.isValid) {
      try {
        parsedGpxData = await this.parserService.parseGpxFile(gpxFile.tmpPath!)
        gpsDataString = parsedGpxData.gpsData ? JSON.stringify(parsedGpxData.gpsData) : null
      } catch (error) {
        console.error('Error parsing GPX file:', error)
      }
    }

    // Utiliser les données du GPX si disponibles
    const finalDistance = parsedGpxData?.distance || Number(data.distance)
    const finalDuration = parsedGpxData?.duration || Number(data.duration)
    const finalElevationGain = parsedGpxData?.elevationGain || (data.elevationGain ? Number(data.elevationGain) : null)

    // Convertir la date en interprétant l'entrée comme étant du fuseau Paris
    const [datePart, timePart] = data.date.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    const activityDate = DateTime.fromObject(
      { year, month, day, hour: hours, minute: minutes, second: 0 },
      { zone: 'Europe/Paris' }
    )

    // Calculer le TRIMP si FC disponible
    const trimp = this.calculateTrimpIfPossible(data.avgHeartRate, finalDuration, user)

    // Récupérer les données météo
    const weatherData = await this.weatherService.getCurrentWeather(gpsDataString, activityDate)

    // Créer l'activité
    const activity = await Activity.create({
      userId: user.id,
      date: activityDate.toUTC(),
      type: data.type || 'Cyclisme',
      duration: finalDuration,
      movingTime: data.movingTime ? Number(data.movingTime) : null,
      distance: finalDistance,
      avgHeartRate: data.avgHeartRate ? Number(data.avgHeartRate) : null,
      maxHeartRate: data.maxHeartRate ? Number(data.maxHeartRate) : null,
      avgSpeed: data.avgSpeed ? Number(data.avgSpeed) : null,
      maxSpeed: data.maxSpeed ? Number(data.maxSpeed) : null,
      elevationGain: finalElevationGain,
      elevationLoss: data.elevationLoss ? Number(data.elevationLoss) : null,
      calories: data.calories ? Number(data.calories) : null,
      avgCadence: data.avgCadence ? Number(data.avgCadence) : null,
      avgPower: data.avgPower ? Number(data.avgPower) : null,
      normalizedPower: data.normalizedPower ? Number(data.normalizedPower) : null,
      avgTemperature: data.avgTemperature ? Number(data.avgTemperature) : null,
      maxTemperature: data.maxTemperature ? Number(data.maxTemperature) : null,
      subSport: data.subSport || null,
      trimp,
      fileName: gpxFile ? gpxFile.clientName : null,
      gpsData: gpsDataString,
      weather: weatherData ? JSON.stringify(weatherData) : null,
      rpe: data.rpe ? Number(data.rpe) : null,
      feelingNotes: data.feelingNotes || null,
      youtubeUrl: data.youtubeUrl || null,
    })

    const newRecords = await PersonalRecordService.checkForNewRecords(activity)

    return response.created({
      message: 'Activité créée avec succès',
      data: {
        activity,
        newRecords: this.formatNewRecords(newRecords),
      },
    })
  }

  /**
   * Upload et parser un fichier d'activité
   */
  async upload({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const file = request.file('file', { size: '50mb', extnames: ['fit', 'gpx', 'csv'] })
    if (!file) {
      return response.badRequest({ message: 'Aucun fichier fourni' })
    }
    if (!file.isValid) {
      return response.badRequest({ message: 'Fichier invalide', errors: file.errors })
    }

    const gpxFile = request.file('gpxFile', { size: '10mb', extnames: ['gpx'] })

    try {
      let parsedActivity = await this.parserService.parseFile(file.tmpPath!, file.extname!)

      // Si un fichier GPX séparé est fourni, extraire les données GPS
      if (gpxFile && gpxFile.isValid) {
        try {
          const gpxData = await this.parserService.parseGpxFile(gpxFile.tmpPath!)
          parsedActivity.gpsData = gpxData.gpsData
          if (!parsedActivity.elevationGain && gpxData.elevationGain) {
            parsedActivity.elevationGain = gpxData.elevationGain
          }
        } catch (error) {
          console.error('Error parsing separate GPX file:', error)
        }
      }

      // Calculer le TRIMP si FC disponible
      parsedActivity.trimp = this.calculateTrimpIfPossible(
        parsedActivity.avgHeartRate,
        parsedActivity.duration,
        user
      )

      // Récupérer les données météo
      const gpsDataString = parsedActivity.gpsData ? JSON.stringify(parsedActivity.gpsData) : null
      const weatherData = await this.weatherService.getCurrentWeather(gpsDataString, parsedActivity.date)

      // Créer l'activité en base
      const activity = await this.createActivityFromParsed(parsedActivity, user.id, file.clientName, gpsDataString, weatherData)

      const newRecords = await PersonalRecordService.checkForNewRecords(activity)

      return response.created({
        message: 'Activité importée avec succès',
        data: { activity, newRecords: this.formatNewRecords(newRecords) },
      })
    } catch (error) {
      console.error('Erreur parsing fichier:', error)
      return response.badRequest({ message: 'Erreur lors du parsing du fichier', error: error.message })
    }
  }

  /**
   * Remplacer le fichier d'une activité existante
   */
  async replaceFile({ auth, request, response, params }: HttpContext) {
    const user = auth.user!

    const activity = await Activity.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!activity) {
      return response.notFound({ message: 'Activité non trouvée' })
    }

    const file = request.file('file', { size: '50mb', extnames: ['fit', 'gpx', 'csv'] })
    if (!file) {
      return response.badRequest({ message: 'Aucun fichier fourni' })
    }
    if (!file.isValid) {
      return response.badRequest({ message: 'Fichier invalide', errors: file.errors })
    }

    try {
      const parsedActivity = await this.parserService.parseFile(file.tmpPath!, file.extname!)

      // Calculer le TRIMP
      parsedActivity.trimp = this.calculateTrimpIfPossible(
        parsedActivity.avgHeartRate,
        parsedActivity.duration,
        user
      )

      // Récupérer les données météo
      const gpsDataString = parsedActivity.gpsData ? JSON.stringify(parsedActivity.gpsData) : null
      const weatherData = await this.weatherService.getCurrentWeather(gpsDataString, parsedActivity.date)

      // Mettre à jour l'activité
      activity.merge({
        date: parsedActivity.date,
        type: parsedActivity.type,
        duration: parsedActivity.duration,
        movingTime: parsedActivity.movingTime,
        distance: parsedActivity.distance,
        avgHeartRate: parsedActivity.avgHeartRate,
        maxHeartRate: parsedActivity.maxHeartRate,
        avgSpeed: parsedActivity.avgSpeed,
        maxSpeed: parsedActivity.maxSpeed,
        elevationGain: parsedActivity.elevationGain,
        elevationLoss: parsedActivity.elevationLoss,
        calories: parsedActivity.calories,
        avgCadence: parsedActivity.avgCadence,
        avgPower: parsedActivity.avgPower,
        normalizedPower: parsedActivity.normalizedPower,
        avgTemperature: parsedActivity.avgTemperature,
        maxTemperature: parsedActivity.maxTemperature,
        subSport: parsedActivity.subSport,
        trimp: parsedActivity.trimp,
        gpsData: gpsDataString,
        fileName: file.clientName,
        weather: weatherData ? JSON.stringify(weatherData) : null,
      })

      await activity.save()

      return response.ok({ message: 'Fichier remplacé avec succès', data: activity })
    } catch (error) {
      console.error('Erreur parsing fichier:', error)
      return response.badRequest({ message: 'Erreur lors du parsing du fichier', error: error.message })
    }
  }

  /**
   * Mettre à jour une activité
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const activity = await Activity.query().where('id', params.id).where('user_id', user.id).first()
    if (!activity) {
      return response.notFound({ message: 'Activité non trouvée' })
    }

    const data: ActivityUpdateData = request.only([
      'type', 'date', 'duration', 'distance', 'avgHeartRate', 'maxHeartRate',
      'avgSpeed', 'maxSpeed', 'avgPower', 'normalizedPower', 'avgCadence',
      'elevationGain', 'calories', 'equipmentId', 'notes', 'rpe', 'feelingNotes',
      'weatherCondition', 'weatherTemperature', 'weatherWindSpeed', 'weatherWindDirection',
    ])

    // Convertir la date si fournie
    if (data.date && typeof data.date === 'string') {
      if (data.date.includes('T') && !data.date.includes('Z') && !data.date.includes('+')) {
        data.date = DateTime.fromISO(data.date, { zone: 'Europe/Paris' })
      } else {
        data.date = DateTime.fromISO(data.date)
      }
    }

    // Recalculer TRIMP si nécessaire
    if ((data.avgHeartRate || activity.avgHeartRate) && user.fcMax && user.fcRepos) {
      const avgHr = data.avgHeartRate || activity.avgHeartRate
      const duration = data.duration || activity.duration
      data.trimp = this.trainingLoadService.calculateTrimp(duration, avgHr!, user.fcMax, user.fcRepos)
    }

    // Créer données météo manuelles si spécifiées
    if (data.weatherCondition) {
      const weatherData = this.weatherService.createManualWeather(
        data.weatherCondition,
        data.weatherTemperature ? Number(data.weatherTemperature) : undefined,
        data.weatherWindSpeed ? Number(data.weatherWindSpeed) : undefined,
        data.weatherWindDirection ? Number(data.weatherWindDirection) : undefined
      )
      data.weather = JSON.stringify(weatherData)
      delete data.weatherCondition
      delete data.weatherTemperature
      delete data.weatherWindSpeed
      delete data.weatherWindDirection
    }

    const mergeData = data as Partial<typeof activity>
    if (mergeData.date && DateTime.isDateTime(mergeData.date)) {
      mergeData.date = mergeData.date.toUTC()
    }
    activity.merge(mergeData)
    await activity.save()

    return response.ok({ message: 'Activité mise à jour', data: activity })
  }

  /**
   * Supprimer une activité
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const activity = await Activity.query().where('id', params.id).where('user_id', user.id).first()

    if (!activity) {
      return response.notFound({ message: 'Activité non trouvée' })
    }

    await activity.delete()
    return response.ok({ message: 'Activité supprimée' })
  }

  /**
   * Obtenir les statistiques d'activités
   */
  async stats({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const period = request.input('period', '30')
    const type = request.input('type')

    const startDate = DateTime.now().minus({ days: Number(period) }).toSQLDate()

    let query = Activity.query().where('user_id', user.id).where('date', '>=', startDate!)
    if (type) {
      query = query.where('type', type)
    }

    const activities = await query.orderBy('date', 'asc')

    const stats = this.computeActivityStats(activities)

    return response.ok({ message: 'Statistiques calculées', data: stats })
  }

  /**
   * Statistiques détaillées cardio (zones cardiaques, polarisation, etc.)
   */
  async cyclingStats({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (!user.fcMax || !user.fcRepos) {
      return response.badRequest({
        message: 'Configurez votre FC max et FC repos pour accéder aux statistiques cardio',
      })
    }

    const period = request.input('period', '90')
    const startDateInput = request.input('startDate')
    const endDateInput = request.input('endDate')
    const typesInput = request.input('types')
    const indoorFilter = request.input('indoor')
    const now = DateTime.now()

    const numericPeriod = Number(period)
    const computedStart = startDateInput ||
      (!Number.isNaN(numericPeriod) ? now.minus({ days: numericPeriod }).startOf('day').toSQLDate() : null)
    const computedEnd = endDateInput || now.endOf('day').toSQL()

    let query = Activity.query().where('user_id', user.id)

    if (typesInput) {
      const types = typesInput.split(',').map((t: string) => t.trim())
      query = query.whereIn('type', types)
    }

    if (computedStart) query = query.where('date', '>=', computedStart)
    if (computedEnd) query = query.where('date', '<=', computedEnd)

    let activities = await query.orderBy('date', 'desc')

    // Filtre indoor/outdoor
    const checkIsIndoor = this.createIndoorChecker()
    if (indoorFilter === 'true') {
      activities = activities.filter((a) => checkIsIndoor(a))
    } else if (indoorFilter === 'false') {
      activities = activities.filter((a) => !checkIsIndoor(a))
    }

    const hrZoneService = new HeartRateZoneService()
    const heartRateZones = hrZoneService.buildZones(user.fcMax, user.fcRepos)

    const { perActivity, aggregatedZones } = this.computeZoneDistribution(activities, heartRateZones, hrZoneService, checkIsIndoor)

    const summary = this.computeSummary(activities, checkIsIndoor)
    const zoneDistribution = this.formatZoneDistribution(aggregatedZones)
    const polarization = hrZoneService.buildPolarizationSummary(aggregatedZones)

    const samplingCount = this.countSampling(perActivity)
    const typesSummary = this.computeTypesSummary(activities, checkIsIndoor)
    const availableTypes = [...new Set(activities.map((a) => a.type))]

    return response.ok({
      data: {
        filters: { period, startDate: computedStart, endDate: computedEnd, types: typesInput || null, indoor: indoorFilter || null },
        summary,
        availableTypes,
        byType: typesSummary,
        heartRateZones,
        zoneDistribution,
        polarization,
        sampling: samplingCount,
        activities: perActivity.slice(0, 20),
      },
    })
  }

  /**
   * Calculer la charge d'entraînement (CTL/ATL/TSB)
   */
  async trainingLoad({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const days = Number(request.input('days', '90'))
    const startDate = DateTime.now().minus({ days }).toSQLDate()

    const activities = await Activity.query()
      .where('user_id', user.id)
      .where('date', '>=', startDate!)
      .orderBy('date', 'asc')

    const { history, current } = this.trainingLoadService.calculateTrainingLoad(activities, days)

    return response.ok({
      message: "Charge d'entraînement calculée",
      data: { current, history },
    })
  }

  // ============= Helper Methods =============

  private calculateTrimpIfPossible(avgHeartRate: number | null | undefined, duration: number, user: any): number | null {
    if (avgHeartRate && user.fcMax && user.fcRepos) {
      return this.trainingLoadService.calculateTrimp(duration, Number(avgHeartRate), user.fcMax, user.fcRepos)
    }
    return null
  }

  private formatNewRecords(newRecords: any[]) {
    return newRecords.map((r) => ({
      recordType: r.recordType,
      recordTypeName: PersonalRecordService.formatRecordTypeName(r.recordType),
      activityType: r.activityType,
      value: r.value,
      unit: r.unit,
      previousValue: r.previousValue,
      improvement: r.improvement,
    }))
  }

  private async createActivityFromParsed(
    parsed: ParsedActivity,
    userId: number,
    fileName: string,
    gpsDataString: string | null,
    weatherData: any
  ): Promise<Activity> {
    return Activity.create({
      userId,
      date: parsed.date,
      type: parsed.type,
      duration: parsed.duration,
      movingTime: parsed.movingTime,
      distance: parsed.distance,
      avgHeartRate: parsed.avgHeartRate,
      maxHeartRate: parsed.maxHeartRate,
      avgSpeed: parsed.avgSpeed,
      maxSpeed: parsed.maxSpeed,
      elevationGain: parsed.elevationGain,
      elevationLoss: parsed.elevationLoss,
      calories: parsed.calories,
      avgCadence: parsed.avgCadence,
      avgPower: parsed.avgPower,
      normalizedPower: parsed.normalizedPower,
      avgTemperature: parsed.avgTemperature,
      maxTemperature: parsed.maxTemperature,
      subSport: parsed.subSport,
      trimp: parsed.trimp,
      gpsData: gpsDataString,
      fileName,
      weather: weatherData ? JSON.stringify(weatherData) : null,
    })
  }

  private computeActivityStats(activities: Activity[]) {
    const totalActivities = activities.length
    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0)
    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0)
    const totalTrimp = activities.reduce((sum, a) => sum + (a.trimp || 0), 0)

    const stats = {
      totalActivities,
      totalDuration,
      totalDistance,
      totalTrimp,
      averageDuration: 0,
      averageDistance: 0,
      averageHeartRate: null as number | null,
      byType: [] as Array<{ type: string; count: number; distance: number; duration: number }>,
    }

    if (totalActivities > 0) {
      stats.averageDuration = Math.round(totalDuration / totalActivities)
      stats.averageDistance = Math.round(totalDistance / totalActivities)

      const activitiesWithHR = activities.filter((a) => a.avgHeartRate !== null)
      if (activitiesWithHR.length > 0) {
        stats.averageHeartRate = Math.round(
          activitiesWithHR.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) / activitiesWithHR.length
        )
      }

      const typeMap = new Map<string, { count: number; distance: number; duration: number }>()
      activities.forEach((a) => {
        if (!typeMap.has(a.type)) {
          typeMap.set(a.type, { count: 0, distance: 0, duration: 0 })
        }
        const typeData = typeMap.get(a.type)!
        typeData.count += 1
        typeData.distance += a.distance
        typeData.duration += a.duration
      })

      stats.byType = Array.from(typeMap.entries()).map(([activityType, data]) => ({
        type: activityType,
        count: data.count,
        distance: data.distance,
        duration: data.duration,
      }))
    }

    return stats
  }

  private createIndoorChecker() {
    const indoorSubSports = ['Home Trainer', 'Virtuel', 'Tapis de course', 'Rameur intérieur', 'Piscine']
    const indoorByDefaultTypes = ['Rameur', 'Musculation', 'Yoga']

    return (activity: Activity): boolean => {
      const hasGps = activity.gpsData && JSON.parse(activity.gpsData).length > 0
      return (
        indoorSubSports.includes(activity.subSport || '') ||
        indoorByDefaultTypes.includes(activity.type) ||
        (activity.type === 'Marche' && !hasGps)
      )
    }
  }

  private computeZoneDistribution(activities: Activity[], heartRateZones: any[], hrZoneService: HeartRateZoneService, checkIsIndoor: (a: Activity) => boolean) {
    const aggregatedZones = heartRateZones.map((zone) => ({ ...zone, seconds: 0 }))

    const perActivity = activities.map((activity) => {
      const { durations, totalSeconds, source } = hrZoneService.calculateZoneDurations(activity, heartRateZones)

      durations.forEach((value, idx) => {
        aggregatedZones[idx].seconds += value
      })

      const total = totalSeconds || activity.duration || 0
      const dominantZoneIndex = durations.reduce(
        (bestIdx, value, idx) => (value > durations[bestIdx] ? idx : bestIdx),
        0
      )

      return {
        id: activity.id,
        date: activity.date.toISO() || activity.date.toString(),
        type: activity.type,
        subSport: activity.subSport,
        isIndoor: checkIsIndoor(activity),
        duration: activity.duration,
        distance: activity.distance,
        avgHeartRate: activity.avgHeartRate,
        maxHeartRate: activity.maxHeartRate,
        trimp: activity.trimp,
        zoneDurations: durations.map((value, idx) => ({
          zone: heartRateZones[idx].zone,
          label: heartRateZones[idx].name,
          seconds: Math.round(value),
          percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
          color: heartRateZones[idx].color,
        })),
        dominantZone: heartRateZones[dominantZoneIndex]?.zone || heartRateZones[0].zone,
        dominantZoneLabel: heartRateZones[dominantZoneIndex]?.name || heartRateZones[0].name,
        dataSource: source,
      }
    })

    return { perActivity, aggregatedZones }
  }

  private computeSummary(activities: Activity[], checkIsIndoor: (a: Activity) => boolean) {
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0)
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)
    const totalTrimp = activities.reduce((sum, a) => sum + (a.trimp || 0), 0)
    const hrValues = activities.filter((a) => a.avgHeartRate).map((a) => a.avgHeartRate!)
    const avgHeartRate = hrValues.length
      ? Math.round(hrValues.reduce((sum, v) => sum + v, 0) / hrValues.length)
      : null
    const avgSpeed = totalDuration > 0
      ? Math.round((totalDistance / 1000 / (totalDuration / 3600)) * 10) / 10
      : null
    const indoorCount = activities.filter((a) => checkIsIndoor(a)).length
    const outdoorCount = activities.length - indoorCount

    return {
      sessions: activities.length,
      totalDistance,
      totalDuration,
      totalTrimp,
      avgHeartRate,
      avgSpeed,
      indoorCount,
      outdoorCount,
    }
  }

  private formatZoneDistribution(aggregatedZones: any[]) {
    const totalZoneSeconds = aggregatedZones.reduce((sum, z) => sum + z.seconds, 0)
    return aggregatedZones.map((zone) => ({
      zone: zone.zone,
      name: zone.name,
      description: zone.description,
      min: zone.min,
      max: zone.max,
      color: zone.color,
      seconds: Math.round(zone.seconds),
      hours: Math.round((zone.seconds / 3600) * 10) / 10,
      percentage: totalZoneSeconds > 0 ? Math.round((zone.seconds / totalZoneSeconds) * 1000) / 10 : 0,
    }))
  }

  private countSampling(perActivity: any[]): Record<ZoneComputationSource, number> {
    const count: Record<ZoneComputationSource, number> = { samples: 0, average: 0, none: 0 }
    perActivity.forEach((a) => { count[a.dataSource as ZoneComputationSource] += 1 })
    return count
  }

  private computeTypesSummary(activities: Activity[], checkIsIndoor: (a: Activity) => boolean) {
    const byType = new Map<string, { count: number; duration: number; distance: number; trimp: number; indoor: number; outdoor: number }>()
    activities.forEach((activity) => {
      const key = activity.type
      if (!byType.has(key)) {
        byType.set(key, { count: 0, duration: 0, distance: 0, trimp: 0, indoor: 0, outdoor: 0 })
      }
      const data = byType.get(key)!
      data.count += 1
      data.duration += activity.duration || 0
      data.distance += activity.distance || 0
      data.trimp += activity.trimp || 0
      if (checkIsIndoor(activity)) {
        data.indoor += 1
      } else {
        data.outdoor += 1
      }
    })

    return Array.from(byType.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      duration: data.duration,
      distance: data.distance,
      trimp: data.trimp,
      indoor: data.indoor,
      outdoor: data.outdoor,
    }))
  }
}
