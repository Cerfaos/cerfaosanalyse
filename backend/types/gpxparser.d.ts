declare module 'gpxparser' {
  interface GpxPoint {
    lat: number
    lon: number
    ele?: number
    time?: Date
    extensions?: {
      hr?: number
      heartrate?: number
      [key: string]: number | undefined
    }
    [key: string]: number | Date | object | undefined
  }

  interface GpxTrack {
    points: GpxPoint[]
    distance: {
      total: number
    }
    elevation: {
      max: number
      min: number
      pos: number
      neg: number
    }
  }

  interface GpxMetadata {
    time?: Date
  }

  class GPXParser {
    tracks: GpxTrack[]
    metadata: GpxMetadata
    parse(gpxString: string): void
  }

  const parser: GPXParser & { default: typeof GPXParser }
  export = parser
}
