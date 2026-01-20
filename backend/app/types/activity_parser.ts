/**
 * Types pour le parsing des fichiers d'activité
 */

import type { ParsedGpsPoint } from '#types/training'
import { DateTime } from 'luxon'

export interface FitRecord {
  position_lat?: number
  position_long?: number
  altitude?: number
  timestamp?: Date
  heart_rate?: number
  speed?: number
}

export interface FitData {
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

export interface ParsedActivity {
  date: DateTime
  type: string
  duration: number
  movingTime: number | null
  distance: number
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

export interface ActivityUpdateData {
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
