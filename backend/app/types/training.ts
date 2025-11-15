export interface HeartRateZoneDefinition {
  zone: number
  name: string
  description: string
  min: number
  max: number
  color: string
}

export interface ParsedGpsPoint {
  lat: number
  lon: number
  ele?: number
  time?: string | Date | number
  hr?: number | null
  speed?: number | null
}

export type ZoneComputationSource = 'samples' | 'average' | 'none'

export interface ZoneDurationResult {
  durations: number[]
  totalSeconds: number
  source: ZoneComputationSource
}

export interface PolarizationSummary {
  totals: {
    low: number
    moderate: number
    high: number
  }
  percentages: {
    low: number
    moderate: number
    high: number
  }
  target: {
    low: number
    moderate: number
    high: number
  }
  score: number
  focus: string
  message: string
}

export interface TrainingLoadData {
  date: string
  trimp: number
  ctl: number
  atl: number
  tsb: number
}

export interface TrainingLoadStatus {
  ctl: number
  atl: number
  tsb: number
  status: string
  recommendation: string
}
