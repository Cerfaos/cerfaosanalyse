import type { HttpContext } from '@adonisjs/core/http'
import Activity from '#models/activity'
import { DateTime } from 'luxon'
// @ts-ignore
import * as FitParserModule from 'fit-file-parser'
// @ts-ignore
import * as GPXParser from 'gpxparser'
import { parse } from 'csv-parse/sync'
import fs from 'fs/promises'
import WeatherService from '#services/weather_service'

// @ts-ignore - Double default export issue with fit-file-parser
const FitParser = FitParserModule.default?.default || FitParserModule.default

interface ParsedActivity {
  date: DateTime
  type: string
  duration: number // secondes
  distance: number // mètres
  avgHeartRate: number | null
  maxHeartRate: number | null
  avgSpeed: number | null
  maxSpeed: number | null
  elevationGain: number | null
  calories: number | null
  avgCadence: number | null
  avgPower: number | null
  normalizedPower: number | null
  trimp: number | null
  hrZones?: number[]
  gpsData?: Array<{ lat: number; lon: number; ele?: number; time?: string }>
}

export default class ActivitiesController {
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

    let query = Activity.query().where('user_id', user.id).orderBy('date', 'desc')

    if (type) {
      query = query.where('type', type)
    }

    if (startDate) {
      query = query.where('date', '>=', startDate)
    }

    if (endDate) {
      query = query.where('date', '<=', endDate)
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

    const activity = await Activity.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!activity) {
      return response.notFound({
        message: 'Activité non trouvée',
      })
    }

    return response.ok({
      message: 'Activité récupérée',
      data: activity,
    })
  }

  /**
   * Créer une activité manuellement (sans fichier)
   */
  async create({ auth, request, response }: HttpContext) {
    const user = auth.user!

    // Valider et récupérer les données
    const data = request.only([
      'date',
      'type',
      'duration',
      'distance',
      'avgHeartRate',
      'maxHeartRate',
      'avgSpeed',
      'maxSpeed',
      'elevationGain',
      'calories',
      'avgCadence',
      'avgPower',
      'normalizedPower',
    ])

    // Vérifier s'il y a un fichier GPX pour les données GPS
    const gpxFile = request.file('gpxFile', {
      size: '10mb',
      extnames: ['gpx'],
    })

    let gpsDataString: string | null = null
    let parsedGpxData: ParsedActivity | null = null

    // Si un fichier GPX est fourni, le parser pour extraire les données
    if (gpxFile && gpxFile.isValid) {
      try {
        parsedGpxData = await this.parseGpxFile(gpxFile.tmpPath!)
        gpsDataString = parsedGpxData.gpsData ? JSON.stringify(parsedGpxData.gpsData) : null
      } catch (error) {
        console.error('Error parsing GPX file:', error)
        // Continue sans GPS data si le parsing échoue
      }
    }

    // Utiliser les données du GPX si disponibles, sinon utiliser les données du formulaire
    const finalDistance = parsedGpxData?.distance || Number(data.distance)
    const finalDuration = parsedGpxData?.duration || Number(data.duration)
    const finalElevationGain =
      parsedGpxData?.elevationGain ||
      (data.elevationGain ? Number(data.elevationGain) : null)

    // Convertir la date
    const activityDate = DateTime.fromISO(data.date)

    // Calculer le TRIMP si FC disponible
    let trimp = null
    if (data.avgHeartRate && user.fcMax && user.fcRepos) {
      trimp = this.calculateTrimp(
        finalDuration,
        Number(data.avgHeartRate),
        user.fcMax,
        user.fcRepos
      )
    }

    // Récupérer les données météo avec les coordonnées GPS si disponibles
    const weatherService = new WeatherService()
    const weatherData = await weatherService.getCurrentWeather(gpsDataString, activityDate)

    // Créer l'activité
    const activity = await Activity.create({
      userId: user.id,
      date: activityDate,
      type: data.type || 'Cyclisme',
      duration: finalDuration,
      distance: finalDistance,
      avgHeartRate: data.avgHeartRate ? Number(data.avgHeartRate) : null,
      maxHeartRate: data.maxHeartRate ? Number(data.maxHeartRate) : null,
      avgSpeed: data.avgSpeed ? Number(data.avgSpeed) : null,
      maxSpeed: data.maxSpeed ? Number(data.maxSpeed) : null,
      elevationGain: finalElevationGain,
      calories: data.calories ? Number(data.calories) : null,
      avgCadence: data.avgCadence ? Number(data.avgCadence) : null,
      avgPower: data.avgPower ? Number(data.avgPower) : null,
      normalizedPower: data.normalizedPower ? Number(data.normalizedPower) : null,
      trimp,
      fileName: gpxFile ? gpxFile.clientName : null,
      gpsData: gpsDataString,
      weather: weatherData ? JSON.stringify(weatherData) : null,
    })

    return response.created({
      message: 'Activité créée avec succès',
      data: activity,
    })
  }

  /**
   * Upload et parser un fichier d'activité
   */
  async upload({ auth, request, response }: HttpContext) {
    const user = auth.user!

    console.log('Upload request received')

    // Valider le fichier
    const file = request.file('file', {
      size: '50mb',
      extnames: ['fit', 'gpx', 'csv'],
    })

    console.log('File object:', file)

    if (!file) {
      console.log('No file provided')
      return response.badRequest({
        message: 'Aucun fichier fourni',
      })
    }

    if (!file.isValid) {
      console.log('File invalid:', file.errors)
      return response.badRequest({
        message: 'Fichier invalide',
        errors: file.errors,
      })
    }

    console.log('File valid:', file.clientName, file.extname)

    try {
      // Lire le fichier
      const filePath = file.tmpPath!
      const fileExtension = file.extname!

      let parsedActivity: ParsedActivity

      // Parser selon le type de fichier
      if (fileExtension === 'fit') {
        parsedActivity = await this.parseFitFile(filePath)
      } else if (fileExtension === 'gpx') {
        parsedActivity = await this.parseGpxFile(filePath)
      } else if (fileExtension === 'csv') {
        parsedActivity = await this.parseCsvFile(filePath)
      } else {
        return response.badRequest({
          message: 'Type de fichier non supporté',
        })
      }

      // Calculer le TRIMP si FC disponible
      if (parsedActivity.avgHeartRate && user.fcMax && user.fcRepos) {
        parsedActivity.trimp = this.calculateTrimp(
          parsedActivity.duration,
          parsedActivity.avgHeartRate,
          user.fcMax,
          user.fcRepos
        )
      }

      // Récupérer les données météo
      const weatherService = new WeatherService()
      const gpsDataString = parsedActivity.gpsData ? JSON.stringify(parsedActivity.gpsData) : null
      const weatherData = await weatherService.getCurrentWeather(gpsDataString, parsedActivity.date)

      // Créer l'activité en base
      const activity = await Activity.create({
        userId: user.id,
        date: parsedActivity.date,
        type: parsedActivity.type,
        duration: parsedActivity.duration,
        distance: parsedActivity.distance,
        avgHeartRate: parsedActivity.avgHeartRate,
        maxHeartRate: parsedActivity.maxHeartRate,
        avgSpeed: parsedActivity.avgSpeed,
        maxSpeed: parsedActivity.maxSpeed,
        elevationGain: parsedActivity.elevationGain,
        calories: parsedActivity.calories,
        avgCadence: parsedActivity.avgCadence,
        avgPower: parsedActivity.avgPower,
        normalizedPower: parsedActivity.normalizedPower,
        trimp: parsedActivity.trimp,
        gpsData: gpsDataString,
        fileName: file.clientName,
        weather: weatherData ? JSON.stringify(weatherData) : null,
      })

      return response.created({
        message: 'Activité importée avec succès',
        data: activity,
      })
    } catch (error) {
      console.error('Erreur parsing fichier:', error)
      return response.badRequest({
        message: 'Erreur lors du parsing du fichier',
        error: error.message,
      })
    }
  }

  /**
   * Remplacer le fichier d'une activité existante
   */
  async replaceFile({ auth, request, response, params }: HttpContext) {
    const user = auth.user!
    const activityId = params.id

    // Vérifier que l'activité existe et appartient à l'utilisateur
    const activity = await Activity.query()
      .where('id', activityId)
      .where('user_id', user.id)
      .first()

    if (!activity) {
      return response.notFound({
        message: 'Activité non trouvée',
      })
    }

    // Valider le fichier
    const file = request.file('file', {
      size: '50mb',
      extnames: ['fit', 'gpx', 'csv'],
    })

    if (!file) {
      return response.badRequest({
        message: 'Aucun fichier fourni',
      })
    }

    if (!file.isValid) {
      return response.badRequest({
        message: 'Fichier invalide',
        errors: file.errors,
      })
    }

    try {
      // Lire le fichier
      const filePath = file.tmpPath!
      const fileExtension = file.extname!

      let parsedActivity: ParsedActivity

      // Parser selon le type de fichier
      if (fileExtension === 'fit') {
        parsedActivity = await this.parseFitFile(filePath)
      } else if (fileExtension === 'gpx') {
        parsedActivity = await this.parseGpxFile(filePath)
      } else if (fileExtension === 'csv') {
        parsedActivity = await this.parseCsvFile(filePath)
      } else {
        return response.badRequest({
          message: 'Type de fichier non supporté',
        })
      }

      // Calculer le TRIMP si FC disponible
      if (parsedActivity.avgHeartRate && user.fcMax && user.fcRepos) {
        parsedActivity.trimp = this.calculateTrimp(
          parsedActivity.duration,
          parsedActivity.avgHeartRate,
          user.fcMax,
          user.fcRepos
        )
      }

      // Récupérer les données météo
      const weatherService = new WeatherService()
      const gpsDataString = parsedActivity.gpsData ? JSON.stringify(parsedActivity.gpsData) : null
      const weatherData = await weatherService.getCurrentWeather(gpsDataString, parsedActivity.date)

      // Mettre à jour l'activité avec les nouvelles données du fichier
      activity.merge({
        date: parsedActivity.date,
        type: parsedActivity.type,
        duration: parsedActivity.duration,
        distance: parsedActivity.distance,
        avgHeartRate: parsedActivity.avgHeartRate,
        maxHeartRate: parsedActivity.maxHeartRate,
        avgSpeed: parsedActivity.avgSpeed,
        maxSpeed: parsedActivity.maxSpeed,
        elevationGain: parsedActivity.elevationGain,
        calories: parsedActivity.calories,
        avgCadence: parsedActivity.avgCadence,
        avgPower: parsedActivity.avgPower,
        normalizedPower: parsedActivity.normalizedPower,
        trimp: parsedActivity.trimp,
        gpsData: gpsDataString,
        fileName: file.clientName,
        weather: weatherData ? JSON.stringify(weatherData) : null,
      })

      await activity.save()

      return response.ok({
        message: 'Fichier remplacé avec succès',
        data: activity,
      })
    } catch (error) {
      console.error('Erreur parsing fichier:', error)
      return response.badRequest({
        message: 'Erreur lors du parsing du fichier',
        error: error.message,
      })
    }
  }

  /**
   * Parser un fichier FIT
   */
  private async parseFitFile(filePath: string): Promise<ParsedActivity> {
    const fitParser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'km',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'cascade',
    })

    const fileBuffer = await fs.readFile(filePath)

    return new Promise((resolve, reject) => {
      fitParser.parse(fileBuffer, (error: any, data: any) => {
        if (error) {
          reject(error)
          return
        }

        try {
          const session = data.activity?.sessions?.[0] || {}
          const records = data.activity?.sessions?.[0]?.laps?.[0]?.records || []

          // Extraire les données GPS
          const gpsData = records
            .filter((r: any) => r.position_lat && r.position_long)
            .map((r: any) => ({
              lat: r.position_lat,
              lon: r.position_long,
              ele: r.altitude,
              time: r.timestamp,
            }))

          // Déterminer le type d'activité
          let type = 'Cyclisme'
          if (session.sport === 'running') type = 'Course'
          else if (session.sport === 'swimming') type = 'Natation'

          resolve({
            date: DateTime.fromJSDate(session.start_time || new Date()),
            type,
            duration: session.total_elapsed_time || 0,
            distance: (session.total_distance || 0) * 1000, // km -> m
            avgHeartRate: session.avg_heart_rate || null,
            maxHeartRate: session.max_heart_rate || null,
            avgSpeed: session.avg_speed || null,
            maxSpeed: session.max_speed || null,
            elevationGain: session.total_ascent || null,
            calories: session.total_calories || null,
            avgCadence: session.avg_cadence || null,
            avgPower: session.avg_power || null,
            normalizedPower: session.normalized_power || null,
            trimp: null,
            gpsData: gpsData.length > 0 ? gpsData : undefined,
          })
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  /**
   * Parser un fichier GPX
   */
  private async parseGpxFile(filePath: string): Promise<ParsedActivity> {
    const gpxContent = await fs.readFile(filePath, 'utf-8')
    // @ts-ignore
    const gpx = new GPXParser.default()
    gpx.parse(gpxContent)

    const track = gpx.tracks[0]
    if (!track) {
      throw new Error('Aucune trace trouvée dans le fichier GPX')
    }

    // Extraire les données GPS
    const gpsData = track.points.map((p: any) => ({
      lat: p.lat,
      lon: p.lon,
      ele: p.ele,
      time: p.time,
    }))

    // Calculer la durée
    const startTime = DateTime.fromJSDate(new Date(track.points[0].time))
    const endTime = DateTime.fromJSDate(new Date(track.points[track.points.length - 1].time))
    const duration = endTime.diff(startTime, 'seconds').seconds

    // Note: GPXParser retourne la distance en mètres
    const distanceInMeters = track.distance.total

    return {
      date: startTime,
      type: 'Cyclisme',
      duration,
      distance: distanceInMeters, // déjà en mètres
      avgHeartRate: null,
      maxHeartRate: null,
      avgSpeed: (distanceInMeters / 1000) / (duration / 3600), // km/h
      maxSpeed: null,
      elevationGain: track.elevation.pos || null,
      calories: null,
      avgCadence: null,
      avgPower: null,
      normalizedPower: null,
      trimp: null,
      gpsData,
    }
  }

  /**
   * Parser un fichier CSV
   * Format attendu: date,type,duration,distance,avgHeartRate,maxHeartRate,...
   */
  private async parseCsvFile(filePath: string): Promise<ParsedActivity> {
    const csvContent = await fs.readFile(filePath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as any[]

    if (records.length === 0) {
      throw new Error('Fichier CSV vide')
    }

    const row = records[0] as any

    return {
      date: DateTime.fromISO(row.date || row.Date),
      type: row.type || row.Type || 'Cyclisme',
      duration: Number(row.duration || row.Duration || 0),
      distance: Number(row.distance || row.Distance || 0),
      avgHeartRate: row.avgHeartRate || row.AvgHeartRate ? Number(row.avgHeartRate || row.AvgHeartRate) : null,
      maxHeartRate: row.maxHeartRate || row.MaxHeartRate ? Number(row.maxHeartRate || row.MaxHeartRate) : null,
      avgSpeed: row.avgSpeed || row.AvgSpeed ? Number(row.avgSpeed || row.AvgSpeed) : null,
      maxSpeed: row.maxSpeed || row.MaxSpeed ? Number(row.maxSpeed || row.MaxSpeed) : null,
      elevationGain: row.elevationGain || row.ElevationGain ? Number(row.elevationGain || row.ElevationGain) : null,
      calories: row.calories || row.Calories ? Number(row.calories || row.Calories) : null,
      avgCadence: row.avgCadence || row.AvgCadence ? Number(row.avgCadence || row.AvgCadence) : null,
      avgPower: row.avgPower || row.AvgPower ? Number(row.avgPower || row.AvgPower) : null,
      normalizedPower: row.normalizedPower || row.NormalizedPower ? Number(row.normalizedPower || row.NormalizedPower) : null,
      trimp: null,
    }
  }

  /**
   * Calculer le TRIMP (Training Impulse) - Méthode Edwards
   *
   * Le TRIMP est une mesure de la charge d'entraînement basée sur la durée et l'intensité.
   * Méthode Edwards: Temps passé dans chaque zone x coefficient de zone
   *
   * Zones FC (Karvonen):
   * Zone 1 (50-60%): coef 1
   * Zone 2 (60-70%): coef 2
   * Zone 3 (70-80%): coef 3
   * Zone 4 (80-90%): coef 4
   * Zone 5 (90-100%): coef 5
   */
  private calculateTrimp(
    duration: number,
    avgHeartRate: number,
    fcMax: number,
    fcRepos: number
  ): number {
    const fcReserve = fcMax - fcRepos

    // Calculer le % de FC de réserve
    const hrr = ((avgHeartRate - fcRepos) / fcReserve) * 100

    // Déterminer la zone et son coefficient
    let zoneCoefficient = 1
    if (hrr >= 90) zoneCoefficient = 5
    else if (hrr >= 80) zoneCoefficient = 4
    else if (hrr >= 70) zoneCoefficient = 3
    else if (hrr >= 60) zoneCoefficient = 2
    else zoneCoefficient = 1

    // TRIMP = durée (min) x coefficient de zone
    const durationMinutes = duration / 60
    return Math.round(durationMinutes * zoneCoefficient)
  }

  /**
   * Mettre à jour une activité
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const activity = await Activity.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!activity) {
      return response.notFound({
        message: 'Activité non trouvée',
      })
    }

    // Récupérer tous les champs modifiables
    const data: any = request.only([
      'type',
      'date',
      'duration',
      'distance',
      'avgHeartRate',
      'maxHeartRate',
      'avgSpeed',
      'maxSpeed',
      'avgPower',
      'normalizedPower',
      'avgCadence',
      'elevationGain',
      'calories',
      'equipmentId',
      'notes',
      'weatherCondition',
      'weatherTemperature',
      'weatherWindSpeed',
      'weatherWindDirection',
    ])

    // Convertir la date si fournie
    if (data.date) {
      data.date = DateTime.fromISO(data.date)
    }

    // Si FC modifiée et user a fcMax/fcRepos, recalculer TRIMP
    if (
      (data.avgHeartRate || activity.avgHeartRate) &&
      user.fcMax &&
      user.fcRepos &&
      data.duration
    ) {
      const avgHr = data.avgHeartRate || activity.avgHeartRate
      const duration = data.duration || activity.duration
      data.trimp = this.calculateTrimp(duration, avgHr, user.fcMax, user.fcRepos)
    } else if (data.avgHeartRate && user.fcMax && user.fcRepos) {
      // Recalculer avec durée existante
      data.trimp = this.calculateTrimp(activity.duration, data.avgHeartRate, user.fcMax, user.fcRepos)
    }

    // Si une condition météo manuelle est fournie, créer les données météo
    if (data.weatherCondition) {
      const weatherService = new WeatherService()
      const weatherData = weatherService.createManualWeather(
        data.weatherCondition,
        data.weatherTemperature ? Number(data.weatherTemperature) : undefined,
        data.weatherWindSpeed ? Number(data.weatherWindSpeed) : undefined,
        data.weatherWindDirection ? Number(data.weatherWindDirection) : undefined
      )
      data.weather = JSON.stringify(weatherData)
      // Supprimer les champs temporaires
      delete data.weatherCondition
      delete data.weatherTemperature
      delete data.weatherWindSpeed
      delete data.weatherWindDirection
    }

    activity.merge(data)
    await activity.save()

    return response.ok({
      message: 'Activité mise à jour',
      data: activity,
    })
  }

  /**
   * Supprimer une activité
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!

    const activity = await Activity.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()

    if (!activity) {
      return response.notFound({
        message: 'Activité non trouvée',
      })
    }

    await activity.delete()

    return response.ok({
      message: 'Activité supprimée',
    })
  }

  /**
   * Obtenir les statistiques d'activités
   */
  async stats({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const period = request.input('period', '30') // 7, 30, 90, 365
    const type = request.input('type') // Optionnel: filtrer par type

    const startDate = DateTime.now().minus({ days: Number(period) }).toSQLDate()

    let query = Activity.query().where('user_id', user.id).where('date', '>=', startDate!)

    if (type) {
      query = query.where('type', type)
    }

    const activities = await query.orderBy('date', 'asc')

    // Calculer les statistiques
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
          activitiesWithHR.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) /
            activitiesWithHR.length
        )
      }

      // Grouper par type avec distance et durée
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

      stats.byType = Array.from(typeMap.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        distance: data.distance,
        duration: data.duration,
      }))
    }

    return response.ok({
      message: 'Statistiques calculées',
      data: stats,
    })
  }

  /**
   * Calculer la charge d'entraînement (CTL/ATL/TSB)
   *
   * CTL (Chronic Training Load) = Forme - Moyenne mobile exponentielle sur 42 jours
   * ATL (Acute Training Load) = Fatigue - Moyenne mobile exponentielle sur 7 jours
   * TSB (Training Stress Balance) = Forme du jour = CTL - ATL
   *
   * TSB > 0 : Bien reposé, prêt pour une compétition
   * TSB < 0 : Fatigué, en surcharge d'entraînement
   */
  async trainingLoad({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const days = Number(request.input('days', '90')) // Période d'analyse
    const startDate = DateTime.now().minus({ days }).toSQLDate()

    // Récupérer toutes les activités avec TRIMP
    const activities = await Activity.query()
      .where('user_id', user.id)
      .where('date', '>=', startDate!)
      .orderBy('date', 'asc')

    // Constantes pour les moyennes mobiles exponentielles
    const CTL_DAYS = 42 // Chronic Training Load (forme)
    const ATL_DAYS = 7  // Acute Training Load (fatigue)

    // Facteurs de lissage pour EMA
    const ctlAlpha = 2 / (CTL_DAYS + 1)
    const atlAlpha = 2 / (ATL_DAYS + 1)

    // Initialiser les valeurs
    let ctl = 0
    let atl = 0
    const data: Array<{
      date: string
      trimp: number
      ctl: number
      atl: number
      tsb: number
    }> = []

    // Créer un tableau de tous les jours dans la période
    const allDays: Map<string, number> = new Map()
    for (let i = 0; i < days; i++) {
      const date = DateTime.now().minus({ days: days - i - 1 }).toSQLDate()!
      allDays.set(date, 0) // TRIMP = 0 par défaut (jour de repos)
    }

    // Remplir avec les TRIMP réels des activités
    activities.forEach((activity) => {
      const dateStr = activity.date.toSQLDate()!
      const existingTrimp = allDays.get(dateStr) || 0
      allDays.set(dateStr, existingTrimp + (activity.trimp || 0))
    })

    // Calculer CTL/ATL/TSB pour chaque jour
    allDays.forEach((trimp, date) => {
      // Calcul EMA (Exponential Moving Average)
      if (data.length === 0) {
        // Premier jour : initialiser avec le TRIMP du jour
        ctl = trimp
        atl = trimp
      } else {
        // Jours suivants : appliquer la formule EMA
        ctl = trimp * ctlAlpha + ctl * (1 - ctlAlpha)
        atl = trimp * atlAlpha + atl * (1 - atlAlpha)
      }

      const tsb = ctl - atl

      data.push({
        date,
        trimp,
        ctl: Math.round(ctl * 10) / 10,
        atl: Math.round(atl * 10) / 10,
        tsb: Math.round(tsb * 10) / 10,
      })
    })

    // Récupérer les valeurs actuelles (dernier jour)
    const current = data[data.length - 1] || { ctl: 0, atl: 0, tsb: 0 }

    // Déterminer le statut basé sur TSB
    let status = 'neutral'
    let recommendation = 'Continuez votre entraînement normalement'

    if (current.tsb > 25) {
      status = 'fresh'
      recommendation = 'Vous êtes très frais ! Bon moment pour une compétition ou un entraînement intense.'
    } else if (current.tsb > 5) {
      status = 'rested'
      recommendation = 'Vous êtes bien reposé. Bon équilibre forme/fatigue.'
    } else if (current.tsb > -10) {
      status = 'optimal'
      recommendation = 'Zone optimale pour progresser. Continuez ainsi !'
    } else if (current.tsb > -30) {
      status = 'tired'
      recommendation = 'Vous accumulez de la fatigue. Pensez à intégrer plus de récupération.'
    } else {
      status = 'overreached'
      recommendation = 'Attention au surentraînement ! Prenez du repos.'
    }

    return response.ok({
      message: 'Charge d\'entraînement calculée',
      data: {
        current: {
          ctl: current.ctl,
          atl: current.atl,
          tsb: current.tsb,
          status,
          recommendation,
        },
        history: data,
      },
    })
  }
}
