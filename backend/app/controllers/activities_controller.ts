import Activity from '#models/activity'
import BadgeService from '#services/badge_service'
import HeartRateZoneService from '#services/heart_rate_zone_service'
import PersonalRecordService from '#services/personal_record_service'
import TrainingLoadService from '#services/training_load_service'
import WeatherService from '#services/weather_service'
import type { ParsedGpsPoint, ZoneComputationSource } from '#types/training'
import type { HttpContext } from '@adonisjs/core/http'
import { parse } from 'csv-parse/sync'
import FitParserModule from 'fit-file-parser'
import GPXParser from 'gpxparser'
import { DateTime } from 'luxon'
import fs from 'node:fs/promises'

// FitParser has double default export that varies by bundler
const FitParser =
  (FitParserModule as unknown as { default?: typeof FitParserModule }).default || FitParserModule

interface FitRecord {
  position_lat?: number
  position_long?: number
  altitude?: number
  timestamp?: Date
  heart_rate?: number
  speed?: number
}

interface FitData {
  activity?: {
    sessions?: Array<{
      sport?: string
      sub_sport?: string
      start_time?: Date
      total_elapsed_time?: number
      total_timer_time?: number
      total_distance?: number
      avg_heart_rate?: number
      max_heart_rate?: number
      avg_speed?: number
      max_speed?: number
      total_ascent?: number
      total_descent?: number
      total_calories?: number
      avg_cadence?: number
      avg_power?: number
      normalized_power?: number
      avg_temperature?: number
      max_temperature?: number
      laps?: Array<{
        records?: FitRecord[]
      }>
    }>
  }
}

interface ParsedActivity {
  date: DateTime
  type: string
  duration: number // secondes (temps total avec pauses)
  movingTime: number | null // secondes (temps en mouvement sans pauses)
  distance: number // mètres
  avgHeartRate: number | null
  maxHeartRate: number | null
  avgSpeed: number | null
  maxSpeed: number | null
  elevationGain: number | null
  elevationLoss: number | null
  calories: number | null
  avgCadence: number | null
  avgPower: number | null
  normalizedPower: number | null
  avgTemperature: number | null
  maxTemperature: number | null
  subSport: string | null
  trimp: number | null
  hrZones?: number[]
  gpsData?: ParsedGpsPoint[]
}

interface ActivityUpdateData {
  type?: string
  date?: string | DateTime
  duration?: number
  distance?: number
  avgHeartRate?: number
  maxHeartRate?: number
  avgSpeed?: number
  maxSpeed?: number
  avgPower?: number
  normalizedPower?: number
  avgCadence?: number
  elevationGain?: number
  calories?: number
  equipmentId?: number
  notes?: string
  rpe?: number
  feelingNotes?: string
  weatherCondition?: string
  weatherTemperature?: number
  weatherWindSpeed?: number
  weatherWindDirection?: number
  weather?: string
  trimp?: number
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

    const fields = request.input('fields')

    let query = Activity.query().where('user_id', user.id).orderBy('date', 'desc')

    if (fields) {
      const fieldsArray = fields.split(',').map((f: string) => {
        // Convertir camelCase en snake_case pour la base de données
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
      // Ajouter 1 jour pour inclure toute la journée de fin (23:59:59)
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
      'elevationLoss',
      'calories',
      'avgCadence',
      'avgPower',
      'normalizedPower',
      'avgTemperature',
      'maxTemperature',
      'subSport',
      'movingTime',
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
      parsedGpxData?.elevationGain || (data.elevationGain ? Number(data.elevationGain) : null)

    // Convertir la date (le frontend envoie "2024-11-21T22:29" sans fuseau)
    // Le serveur tourne en UTC, donc on force le fuseau Europe/Paris
    const [datePart, timePart] = data.date.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)

    // L'utilisateur entre une heure locale (Europe/Paris), on la stocke en UTC
    // mais en interprétant l'entrée comme étant du fuseau Paris
    const activityDate = DateTime.fromObject(
      { year, month, day, hour: hours, minute: minutes, second: 0 },
      { zone: 'Europe/Paris' }
    )

    // Calculer le TRIMP si FC disponible
    let trimp = null
    if (data.avgHeartRate && user.fcMax && user.fcRepos) {
      const trainingLoadService = new TrainingLoadService()
      trimp = trainingLoadService.calculateTrimp(
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
    })

    // Vérifier et attribuer les badges
    const badgeService = new BadgeService()
    const newBadges = await badgeService.checkAndAwardBadges(user.id)

    // Vérifier les records personnels
    const newRecords = await PersonalRecordService.checkForNewRecords(activity)

    return response.created({
      message: 'Activité créée avec succès',
      data: {
        activity,
        newBadges: newBadges.map((b) => ({ id: b.id, name: b.name, icon: b.icon })),
        newRecords: newRecords.map((r) => ({
          recordType: r.recordType,
          recordTypeName: PersonalRecordService.formatRecordTypeName(r.recordType),
          activityType: r.activityType,
          value: r.value,
          unit: r.unit,
          previousValue: r.previousValue,
          improvement: r.improvement,
        })),
      },
    })
  }

  /**
   * Upload et parser un fichier d'activité
   * Supporte l'import en 2 étapes : fichier principal (FIT/CSV) + fichier GPX optionnel
   */
  async upload({ auth, request, response }: HttpContext) {
    const user = auth.user!

    console.log('Upload request received')

    // Valider le fichier principal (métriques)
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

    // Valider le fichier GPX optionnel (trace GPS)
    const gpxFile = request.file('gpxFile', {
      size: '10mb',
      extnames: ['gpx'],
    })

    console.log('File valid:', file.clientName, file.extname)
    if (gpxFile) {
      console.log('GPX file provided:', gpxFile.clientName)
    }

    try {
      // Lire le fichier principal
      const filePath = file.tmpPath!
      const fileExtension = file.extname!

      let parsedActivity: ParsedActivity

      // Parser selon le type de fichier principal
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

      // Si un fichier GPX séparé est fourni, extraire les données GPS
      if (gpxFile && gpxFile.isValid) {
        try {
          console.log('Parsing separate GPX file for GPS data')
          const gpxData = await this.parseGpxFile(gpxFile.tmpPath!)

          // Remplacer les données GPS par celles du fichier GPX
          parsedActivity.gpsData = gpxData.gpsData

          // Optionnel : utiliser aussi le dénivelé du GPX s'il n'existe pas dans le fichier principal
          if (!parsedActivity.elevationGain && gpxData.elevationGain) {
            parsedActivity.elevationGain = gpxData.elevationGain
          }

          console.log(`GPS data from separate GPX: ${gpxData.gpsData?.length || 0} points`)
        } catch (error) {
          console.error('Error parsing separate GPX file:', error)
          // Continue sans les données GPS du fichier séparé
        }
      }

      // Calculer le TRIMP si FC disponible
      if (parsedActivity.avgHeartRate && user.fcMax && user.fcRepos) {
        parsedActivity.trimp = new TrainingLoadService().calculateTrimp(
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

      // Vérifier et attribuer les badges
      const badgeService = new BadgeService()
      const newBadges = await badgeService.checkAndAwardBadges(user.id)

      // Vérifier les records personnels
      const newRecords = await PersonalRecordService.checkForNewRecords(activity)

      return response.created({
        message: 'Activité importée avec succès',
        data: {
          activity,
          newBadges: newBadges.map((b) => ({ id: b.id, name: b.name, icon: b.icon })),
          newRecords: newRecords.map((r) => ({
            recordType: r.recordType,
            recordTypeName: PersonalRecordService.formatRecordTypeName(r.recordType),
            activityType: r.activityType,
            value: r.value,
            unit: r.unit,
            previousValue: r.previousValue,
            improvement: r.improvement,
          })),
        },
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
        parsedActivity.trimp = new TrainingLoadService().calculateTrimp(
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
      fitParser.parse(fileBuffer, (error: Error | null, data: FitData) => {
        if (error) {
          reject(error)
          return
        }

        try {
          const session = data.activity?.sessions?.[0] || {}
          const records = data.activity?.sessions?.[0]?.laps?.[0]?.records || []

          // Extraire les données GPS
          const gpsData = records
            .filter((r: FitRecord) => r.position_lat && r.position_long)
            .map((r: FitRecord) => ({
              lat: r.position_lat!,
              lon: r.position_long!,
              ele: r.altitude,
              time: r.timestamp,
              hr: typeof r.heart_rate === 'number' ? r.heart_rate : (r.heart_rate ?? null),
              speed: typeof r.speed === 'number' ? r.speed : (r.speed ?? null),
            }))

          // Déterminer le type d'activité
          const sportMap: Record<string, string> = {
            cycling: 'Cyclisme',
            running: 'Course',
            walking: 'Marche',
            rowing: 'Rameur',
            swimming: 'Natation',
            hiking: 'Randonnée',
            fitness_equipment: 'Fitness',
            training: 'Entraînement',
            transition: 'Transition',
          }
          const type = session.sport ? sportMap[session.sport] || 'Cyclisme' : 'Cyclisme'

          // Mapper les sous-types de sport en français
          let subSport = null
          if (session.sub_sport) {
            const subSportMap: Record<string, string> = {
              // Cyclisme
              road: 'Route',
              mountain: 'VTT',
              track: 'Piste',
              gravel: 'Gravel',
              cyclocross: 'Cyclocross',
              indoor_cycling: 'Home Trainer',
              virtual_activity: 'Virtuel',
              // Course à pied
              treadmill: 'Tapis de course',
              trail: 'Trail',
              street: 'Route',
              // Natation
              lap_swimming: 'Piscine',
              open_water: 'Eau libre',
              // Rameur
              indoor_rowing: 'Rameur intérieur',
              // Autres
              generic: 'Général',
            }
            subSport = subSportMap[session.sub_sport] || session.sub_sport
          }

          resolve({
            date: DateTime.fromJSDate(session.start_time || new Date()),
            type,
            duration: session.total_elapsed_time || 0,
            movingTime: session.total_timer_time || null,
            distance: (session.total_distance || 0) * 1000, // km -> m
            avgHeartRate: session.avg_heart_rate || null,
            maxHeartRate: session.max_heart_rate || null,
            avgSpeed: session.avg_speed || null,
            maxSpeed: session.max_speed || null,
            elevationGain: session.total_ascent || null,
            elevationLoss: session.total_descent || null,
            calories: session.total_calories || null,
            avgCadence: session.avg_cadence || null,
            avgPower: session.avg_power || null,
            normalizedPower: session.normalized_power || null,
            avgTemperature: session.avg_temperature || null,
            maxTemperature: session.max_temperature || null,
            subSport,
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
    const GpxParserClass = (GPXParser as unknown as { default: new () => typeof GPXParser }).default
    const gpx = new GpxParserClass()
    gpx.parse(gpxContent)

    const track = gpx.tracks[0]
    if (!track) {
      throw new Error('Aucune trace trouvée dans le fichier GPX')
    }

    // Extraire les données GPS
    const gpsData = track.points.map((p) => ({
      lat: p.lat,
      lon: p.lon,
      ele: p.ele,
      time: p.time,
    }))

    // Calculer la durée
    const firstPointTime = track.points[0].time
    const lastPointTime = track.points[track.points.length - 1].time
    if (!firstPointTime || !lastPointTime) {
      throw new Error('Les points GPS doivent contenir des timestamps')
    }
    const startTime = DateTime.fromJSDate(
      firstPointTime instanceof Date ? firstPointTime : new Date(firstPointTime)
    )
    const endTime = DateTime.fromJSDate(
      lastPointTime instanceof Date ? lastPointTime : new Date(lastPointTime)
    )
    const duration = endTime.diff(startTime, 'seconds').seconds

    // Note: GPXParser retourne la distance en mètres
    const distanceInMeters = track.distance.total

    return {
      date: startTime,
      type: 'Cyclisme',
      duration,
      movingTime: null, // GPX ne contient pas cette info
      distance: distanceInMeters, // déjà en mètres
      avgHeartRate: null,
      maxHeartRate: null,
      avgSpeed: distanceInMeters / 1000 / (duration / 3600), // km/h
      maxSpeed: null,
      elevationGain: track.elevation.pos || null,
      elevationLoss: track.elevation.neg || null,
      calories: null,
      avgCadence: null,
      avgPower: null,
      normalizedPower: null,
      avgTemperature: null,
      maxTemperature: null,
      subSport: null,
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
      movingTime:
        row.movingTime || row.MovingTime ? Number(row.movingTime || row.MovingTime) : null,
      distance: Number(row.distance || row.Distance || 0),
      avgHeartRate:
        row.avgHeartRate || row.AvgHeartRate ? Number(row.avgHeartRate || row.AvgHeartRate) : null,
      maxHeartRate:
        row.maxHeartRate || row.MaxHeartRate ? Number(row.maxHeartRate || row.MaxHeartRate) : null,
      avgSpeed: row.avgSpeed || row.AvgSpeed ? Number(row.avgSpeed || row.AvgSpeed) : null,
      maxSpeed: row.maxSpeed || row.MaxSpeed ? Number(row.maxSpeed || row.MaxSpeed) : null,
      elevationGain:
        row.elevationGain || row.ElevationGain
          ? Number(row.elevationGain || row.ElevationGain)
          : null,
      elevationLoss:
        row.elevationLoss || row.ElevationLoss
          ? Number(row.elevationLoss || row.ElevationLoss)
          : null,
      calories: row.calories || row.Calories ? Number(row.calories || row.Calories) : null,
      avgCadence:
        row.avgCadence || row.AvgCadence ? Number(row.avgCadence || row.AvgCadence) : null,
      avgPower: row.avgPower || row.AvgPower ? Number(row.avgPower || row.AvgPower) : null,
      normalizedPower:
        row.normalizedPower || row.NormalizedPower
          ? Number(row.normalizedPower || row.NormalizedPower)
          : null,
      avgTemperature:
        row.avgTemperature || row.AvgTemperature
          ? Number(row.avgTemperature || row.AvgTemperature)
          : null,
      maxTemperature:
        row.maxTemperature || row.MaxTemperature
          ? Number(row.maxTemperature || row.MaxTemperature)
          : null,
      subSport: row.subSport || row.SubSport || null,
      trimp: null,
    }
  }

  /**
   * Mettre à jour une activité
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!

    const activity = await Activity.query().where('id', params.id).where('user_id', user.id).first()

    if (!activity) {
      return response.notFound({
        message: 'Activité non trouvée',
      })
    }

    // Récupérer tous les champs modifiables
    const data: ActivityUpdateData = request.only([
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
      'rpe',
      'feelingNotes',
      'weatherCondition',
      'weatherTemperature',
      'weatherWindSpeed',
      'weatherWindDirection',
    ])

    // Convertir la date si fournie
    if (data.date && typeof data.date === 'string') {
      // Si la date est au format ISO sans fuseau (ex: "2024-11-21T22:00"),
      // on l'interprète comme étant en Europe/Paris
      if (data.date.includes('T') && !data.date.includes('Z') && !data.date.includes('+')) {
        data.date = DateTime.fromISO(data.date, { zone: 'Europe/Paris' })
      } else {
        data.date = DateTime.fromISO(data.date)
      }
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
      data.trimp = new TrainingLoadService().calculateTrimp(
        duration,
        avgHr!,
        user.fcMax,
        user.fcRepos
      )
    } else if (data.avgHeartRate && user.fcMax && user.fcRepos) {
      // Recalculer avec durée existante
      data.trimp = new TrainingLoadService().calculateTrimp(
        activity.duration,
        data.avgHeartRate,
        user.fcMax,
        user.fcRepos
      )
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

    // Cast to remove weather fields that are already deleted
    const mergeData = data as Partial<typeof activity>
    if (mergeData.date && DateTime.isDateTime(mergeData.date)) {
      mergeData.date = mergeData.date.toUTC()
    }
    activity.merge(mergeData)
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

    const activity = await Activity.query().where('id', params.id).where('user_id', user.id).first()

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

    const startDate = DateTime.now()
      .minus({ days: Number(period) })
      .toSQLDate()

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

      stats.byType = Array.from(typeMap.entries()).map(([activityType, data]) => ({
        type: activityType,
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
   * Statistiques détaillées spécifiques au cyclisme (zones cardiaques, polarisation, etc.)
   */
  async cyclingStats({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (!user.fcMax || !user.fcRepos) {
      return response.badRequest({
        message: 'Configurez votre FC max et FC repos pour accéder aux statistiques de cyclisme',
      })
    }

    const period = request.input('period', '90')
    const startDateInput = request.input('startDate')
    const endDateInput = request.input('endDate')
    const now = DateTime.now()

    const numericPeriod = Number(period)
    const computedStart =
      startDateInput ||
      (!Number.isNaN(numericPeriod)
        ? now.minus({ days: numericPeriod }).startOf('day').toSQLDate()
        : null)
    const computedEnd = endDateInput || now.toSQLDate()

    let query = Activity.query().where('user_id', user.id).where('type', 'Cyclisme')

    if (computedStart) {
      query = query.where('date', '>=', computedStart)
    }

    if (computedEnd) {
      query = query.where('date', '<=', computedEnd)
    }

    const activities = await query.orderBy('date', 'desc')

    const hrZoneService = new HeartRateZoneService()
    const heartRateZones = hrZoneService.buildZones(user.fcMax, user.fcRepos)
    const aggregatedZones = heartRateZones.map((zone) => ({
      ...zone,
      seconds: 0,
    }))

    const perActivity = activities.map((activity) => {
      const { durations, totalSeconds, source } = hrZoneService.calculateZoneDurations(
        activity,
        heartRateZones
      )

      durations.forEach((value, idx) => {
        aggregatedZones[idx].seconds += value
      })

      const total = totalSeconds || activity.duration || 0

      // Calculer l'index de la zone dominante AVANT de l'utiliser
      const dominantZoneIndex = durations.reduce(
        (bestIdx, value, idx) => (value > durations[bestIdx] ? idx : bestIdx),
        0
      )

      const zoneDurations = durations.map((value, idx) => ({
        zone: heartRateZones[idx].zone,
        label: heartRateZones[idx].name,
        seconds: Math.round(value),
        percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
        color: heartRateZones[idx].color,
      }))

      return {
        id: activity.id,
        date: activity.date.toISO() || activity.date.toString(),
        duration: activity.duration,
        distance: activity.distance,
        avgHeartRate: activity.avgHeartRate,
        maxHeartRate: activity.maxHeartRate,
        trimp: activity.trimp,
        zoneDurations,
        dominantZone: heartRateZones[dominantZoneIndex]?.zone || heartRateZones[0].zone,
        dominantZoneLabel: heartRateZones[dominantZoneIndex]?.name || heartRateZones[0].name,
        dataSource: source,
      }
    })

    const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0)
    const totalDuration = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0)
    const totalTrimp = activities.reduce((sum, activity) => sum + (activity.trimp || 0), 0)
    const hrValues = activities
      .filter((activity) => activity.avgHeartRate)
      .map((activity) => activity.avgHeartRate!)
    const avgHeartRate = hrValues.length
      ? Math.round(hrValues.reduce((sum, value) => sum + value, 0) / hrValues.length)
      : null
    const avgSpeed =
      totalDuration > 0
        ? Math.round((totalDistance / 1000 / (totalDuration / 3600)) * 10) / 10
        : null

    const totalZoneSeconds = aggregatedZones.reduce((sum, zone) => sum + zone.seconds, 0)
    const zoneDistribution = aggregatedZones.map((zone) => ({
      zone: zone.zone,
      name: zone.name,
      description: zone.description,
      min: zone.min,
      max: zone.max,
      color: zone.color,
      seconds: Math.round(zone.seconds),
      hours: Math.round((zone.seconds / 3600) * 10) / 10,
      percentage:
        totalZoneSeconds > 0 ? Math.round((zone.seconds / totalZoneSeconds) * 1000) / 10 : 0,
    }))

    const polarization = hrZoneService.buildPolarizationSummary(aggregatedZones)

    const samplingCount: Record<ZoneComputationSource, number> = {
      samples: 0,
      average: 0,
      none: 0,
    }
    perActivity.forEach((activity) => {
      samplingCount[activity.dataSource] += 1
    })

    const recentActivities = perActivity.slice(0, 12)

    return response.ok({
      data: {
        filters: {
          period,
          startDate: computedStart,
          endDate: computedEnd,
        },
        summary: {
          sessions: activities.length,
          totalDistance,
          totalDuration,
          totalTrimp,
          avgHeartRate,
          avgSpeed,
        },
        heartRateZones,
        zoneDistribution,
        polarization,
        sampling: samplingCount,
        activities: recentActivities,
      },
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

    const trainingLoadService = new TrainingLoadService()
    const { history, current } = trainingLoadService.calculateTrainingLoad(activities, days)

    return response.ok({
      message: "Charge d'entraînement calculée",
      data: {
        current,
        history,
      },
    })
  }
}
