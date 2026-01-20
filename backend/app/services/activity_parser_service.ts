/**
 * Service pour le parsing des fichiers d'activité (FIT, GPX, CSV)
 */

import type { FitData, FitRecord, ParsedActivity } from '#types/activity_parser'
import { parse } from 'csv-parse/sync'
import FitParserModule from 'fit-file-parser'
import GPXParser from 'gpxparser'
import { DateTime } from 'luxon'
import fs from 'node:fs/promises'

// FitParser has double default export that varies by bundler
const FitParser =
  (FitParserModule as unknown as { default?: typeof FitParserModule }).default || FitParserModule

// Mapping des sports FIT vers les types français
const sportMap: Record<string, string> = {
  cycling: 'Cyclisme',
  running: 'Course',
  walking: 'Marche',
  rowing: 'Rameur',
  swimming: 'Natation',
  hiking: 'Randonnée',
  fitness_equipment: 'Musculation',
  training: 'Musculation',
  strength_training: 'Musculation',
  yoga: 'Yoga',
  transition: 'Transition',
}

// Mapping des sous-sports FIT vers les types français
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

export default class ActivityParserService {
  /**
   * Parser un fichier FIT
   */
  async parseFitFile(filePath: string): Promise<ParsedActivity> {
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
          const type = session.sport ? sportMap[session.sport] || 'Cyclisme' : 'Cyclisme'

          // Mapper le sous-type de sport
          let subSport = null
          if (session.sub_sport) {
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
  async parseGpxFile(filePath: string): Promise<ParsedActivity> {
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
      movingTime: null,
      distance: distanceInMeters,
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
  async parseCsvFile(filePath: string): Promise<ParsedActivity> {
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
   * Parser un fichier selon son extension
   */
  async parseFile(filePath: string, extension: string): Promise<ParsedActivity> {
    switch (extension.toLowerCase()) {
      case 'fit':
        return this.parseFitFile(filePath)
      case 'gpx':
        return this.parseGpxFile(filePath)
      case 'csv':
        return this.parseCsvFile(filePath)
      default:
        throw new Error(`Type de fichier non supporté: ${extension}`)
    }
  }
}
