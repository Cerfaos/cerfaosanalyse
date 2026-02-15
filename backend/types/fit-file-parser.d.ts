declare module 'fit-file-parser' {
  interface FitRecord {
    position_lat?: number
    position_long?: number
    altitude?: number
    enhanced_altitude?: number
    timestamp?: Date
    heart_rate?: number
    speed?: number
    enhanced_speed?: number
  }

  interface FitSession {
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
    enhanced_avg_speed?: number
    enhanced_max_speed?: number
    total_ascent?: number
    total_descent?: number
    total_calories?: number
    avg_cadence?: number
    avg_power?: number
    normalized_power?: number
    avg_temperature?: number
    max_temperature?: number
  }

  interface FitLap {
    records?: FitRecord[]
  }

  interface FitActivitySession extends FitSession {
    laps?: FitLap[]
  }

  interface FitActivity {
    sessions?: FitActivitySession[]
  }

  interface FitData {
    activity?: FitActivity
    records?: FitRecord[]
  }

  interface FitParserOptions {
    force?: boolean
    speedUnit?: string
    lengthUnit?: string
    temperatureUnit?: string
    elapsedRecordField?: boolean
    mode?: string
  }

  class FitParser {
    constructor(options?: FitParserOptions)
    parse(buffer: Buffer, callback: (error: Error | null, data: FitData) => void): void
  }

  // The module exports differently depending on the bundler
  export default FitParser
  export = FitParser
}
