/**
 * Service pour la génération des exports (CSV, GPX)
 */

import type Activity from '#models/activity'
import type { ParsedGpsPoint } from '#types/training'
import type { CsvColumn } from '#types/export'
import { DateTime } from 'luxon'

export default class ExportService {
  /**
   * Générer un contenu CSV avec BOM UTF-8 pour Excel
   */
  generateCsv<T>(items: T[], columns: CsvColumn<T>[]): string {
    const headers = columns.map((col) => col.header).join(',')
    const rows = items.map((item) =>
      columns.map((col) => col.getValue(item)).join(',')
    )
    const csv = [headers, ...rows].join('\n')
    return '\ufeff' + csv // BOM UTF-8 pour Excel
  }

  /**
   * Configuration des colonnes CSV pour les activités
   */
  getActivityCsvColumns(): CsvColumn<Activity>[] {
    return [
      { header: 'Date', getValue: (a) => a.date.toISODate() || '' },
      { header: 'Type', getValue: (a) => a.type },
      { header: 'Durée (min)', getValue: (a) => Math.round(a.duration / 60) },
      { header: 'Distance (km)', getValue: (a) => (a.distance / 1000).toFixed(2) },
      { header: 'FC Moy', getValue: (a) => a.avgHeartRate || '' },
      { header: 'FC Max', getValue: (a) => a.maxHeartRate || '' },
      { header: 'Vitesse Moy (km/h)', getValue: (a) => a.avgSpeed?.toFixed(1) || '' },
      { header: 'Vitesse Max (km/h)', getValue: (a) => a.maxSpeed?.toFixed(1) || '' },
      { header: 'Dénivelé (m)', getValue: (a) => a.elevationGain || '' },
      { header: 'Calories', getValue: (a) => a.calories || '' },
      { header: 'Cadence Moy', getValue: (a) => a.avgCadence || '' },
      { header: 'Puissance Moy', getValue: (a) => a.avgPower || '' },
      { header: 'Puissance Normalisée', getValue: (a) => a.normalizedPower || '' },
      { header: 'TRIMP', getValue: (a) => a.trimp || '' },
    ]
  }

  /**
   * Générer un fichier GPX à partir d'une activité
   */
  generateGpxFile(activity: Activity, gpsPoints: ParsedGpsPoint[]): string {
    const activityName = `${activity.type} - ${activity.date.toFormat('dd/MM/yyyy')}`
    const timeISO = activity.date.toISO()

    const trackPoints = gpsPoints
      .map((point) => {
        const ele = point.ele !== undefined ? `    <ele>${point.ele}</ele>` : ''
        const time = point.time ? `    <time>${point.time}</time>` : ''

        return `  <trkpt lat="${point.lat}" lon="${point.lon}">
${ele}
${time}
  </trkpt>`
      })
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
  creator="Centre d'Analyse Cycliste - Cerfao"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${activityName}</name>
    <time>${timeISO}</time>
  </metadata>
  <trk>
    <name>${activityName}</name>
    <type>${activity.type}</type>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`
  }

  /**
   * Formater la taille d'un fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'Ko', 'Mo', 'Go']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Générer le nom de fichier pour un export
   */
  generateExportFilename(prefix: string, extension: string): string {
    return `cerfaos-${prefix}-${DateTime.now().toFormat('yyyy-MM-dd')}.${extension}`
  }

  /**
   * Générer le nom de fichier pour une sauvegarde avec timestamp
   */
  generateBackupFilename(): string {
    return `cerfaos-backup-${DateTime.now().toFormat('yyyy-MM-dd-HHmmss')}.json`
  }

  /**
   * Échapper une valeur pour CSV (avec guillemets si nécessaire)
   */
  escapeCsvValue(value: string | null | undefined): string {
    if (!value) return ''
    return `"${value.replace(/"/g, '""')}"`
  }
}
