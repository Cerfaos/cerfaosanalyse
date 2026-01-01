/**
 * Utilitaires de formatage partagés
 * Évite la duplication de code pour le formatage de dates, durées, distances, etc.
 */

// ===== FORMATAGE DES DURÉES =====

/**
 * Convertit des secondes en format lisible (ex: "1h 30min", "45min", "2h")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0min'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${minutes}min`
  }
}

/**
 * Convertit des secondes en format HH:MM:SS
 */
export function formatDurationHMS(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':')
}

/**
 * Convertit des secondes en heures décimales (ex: 1.5 pour 1h30)
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 10) / 10
}

// ===== FORMATAGE DES DATES =====

/**
 * Formate une date en format français court (ex: "15 jan.")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/**
 * Formate une date en format français long (ex: "15 janvier 2025")
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Formate une date avec le jour de la semaine (ex: "Lundi 15 janvier")
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/**
 * Formate une date en format ISO (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

/**
 * Retourne la date du jour en format ISO
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Formate une date relative (ex: "il y a 2 jours", "aujourd'hui")
 */
export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${diffDays >= 14 ? 's' : ''}`
  return formatDateLong(d)
}

// ===== FORMATAGE DES DISTANCES =====

/**
 * Formate une distance en mètres vers km (ex: "42.5 km")
 */
export function formatDistance(meters: number): string {
  if (!meters || meters <= 0) return '0 km'
  const km = meters / 1000
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`
}

/**
 * Formate une distance en mètres avec unité courte
 */
export function formatDistanceShort(meters: number): string {
  if (!meters || meters <= 0) return '0'
  const km = meters / 1000
  return km >= 10 ? Math.round(km).toString() : km.toFixed(1)
}

// ===== FORMATAGE DES VITESSES =====

/**
 * Formate une vitesse en km/h
 */
export function formatSpeed(kmh: number): string {
  if (!kmh || kmh <= 0) return '0 km/h'
  return `${kmh.toFixed(1)} km/h`
}

/**
 * Calcule et formate la vitesse moyenne (distance en m, durée en s)
 */
export function formatAvgSpeed(distanceMeters: number, durationSeconds: number): string {
  if (!distanceMeters || !durationSeconds || durationSeconds <= 0) return '0 km/h'
  const speedKmh = (distanceMeters / 1000) / (durationSeconds / 3600)
  return `${speedKmh.toFixed(1)} km/h`
}

// ===== FORMATAGE DES NOMBRES =====

/**
 * Formate un nombre avec séparateur de milliers
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR')
}

/**
 * Formate une valeur avec unité et gestion du pluriel
 */
export function formatWithUnit(value: number, unit: string, pluralUnit?: string): string {
  const formattedValue = formatNumber(value)
  if (pluralUnit && Math.abs(value) > 1) {
    return `${formattedValue} ${pluralUnit}`
  }
  return `${formattedValue} ${unit}`
}

// ===== FORMATAGE SPÉCIFIQUE SPORT =====

/**
 * Formate le dénivelé (ex: "1 250 m")
 */
export function formatElevation(meters: number): string {
  if (!meters) return '0 m'
  return `${formatNumber(Math.round(meters))} m`
}

/**
 * Formate la fréquence cardiaque
 */
export function formatHeartRate(bpm: number): string {
  if (!bpm) return '-- bpm'
  return `${Math.round(bpm)} bpm`
}

/**
 * Formate la puissance
 */
export function formatPower(watts: number): string {
  if (!watts) return '-- W'
  return `${Math.round(watts)} W`
}

/**
 * Formate la cadence
 */
export function formatCadence(rpm: number): string {
  if (!rpm) return '-- rpm'
  return `${Math.round(rpm)} rpm`
}

/**
 * Formate le TRIMP
 */
export function formatTrimp(value: number): string {
  if (!value) return '0'
  return Math.round(value).toString()
}

// ===== FORMATAGE DES POURCENTAGES =====

/**
 * Formate un pourcentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formate une différence en pourcentage avec signe
 */
export function formatPercentDiff(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+∞%' : '—'
  const diff = ((current - previous) / previous) * 100
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}%`
}
