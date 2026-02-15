/**
 * Service de parsing des fichiers MRC (format home trainer)
 * Format: fichiers d'entraînement utilisés par Zwift, TrainerRoad, etc.
 */

export interface MrcHeader {
  version: number
  units: string
  description: string
  fileName: string
  format: string
}

export interface MrcDataPoint {
  minutes: number
  percentage: number
  text: string
}

export interface MrcBlock {
  type: 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown'
  duration: string // "MM:SS"
  percentFtp: number
  reps: number
  notes?: string
}

export interface MrcPpgExercise {
  name: string
  duration: string // "MM:SS"
  reps: number | null
  sets: number
  rest: string // "MM:SS"
  notes?: string
}

export interface ParsedMrcFile {
  header: MrcHeader
  dataPoints: MrcDataPoint[]
  category: 'cycling' | 'ppg'
  blocks?: MrcBlock[]
  exercises?: MrcPpgExercise[]
  totalDuration: number // en minutes
  averageIntensity: number // % FTP moyen
  name: string
  level: 'beginner' | 'intermediate' | 'expert'
}

export default class MrcParserService {
  /**
   * Parse un fichier MRC complet
   */
  parse(content: string): ParsedMrcFile {
    const header = this.parseHeader(content)
    const dataPoints = this.parseData(content)

    // Détecter si c'est une séance PPG ou cyclisme
    const isPpg = this.detectPpg(dataPoints)
    const category = isPpg ? 'ppg' : 'cycling'

    // Calculer la durée totale
    const totalDuration = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].minutes : 0

    // Calculer l'intensité moyenne
    const averageIntensity = this.calculateAverageIntensity(dataPoints)

    // Détecter le niveau
    const level = this.detectLevel(header.description, header.fileName)

    // Extraire le nom de la séance
    const name = this.extractName(header)

    if (isPpg) {
      const exercises = this.convertToPpgExercises(dataPoints)
      return {
        header,
        dataPoints,
        category,
        exercises,
        totalDuration,
        averageIntensity,
        name,
        level,
      }
    } else {
      const blocks = this.convertToBlocks(dataPoints)
      return {
        header,
        dataPoints,
        category,
        blocks,
        totalDuration,
        averageIntensity,
        name,
        level,
      }
    }
  }

  /**
   * Parse le header du fichier MRC
   */
  private parseHeader(content: string): MrcHeader {
    const headerMatch = content.match(/\[COURSE HEADER\]([\s\S]*?)\[END COURSE HEADER\]/)
    if (!headerMatch) {
      throw new Error('Format MRC invalide : header non trouvé')
    }

    const headerContent = headerMatch[1]

    const getHeaderValue = (key: string): string => {
      const match = headerContent.match(new RegExp(`${key}\\s*=\\s*(.+)`, 'i'))
      return match ? match[1].trim() : ''
    }

    return {
      version: parseInt(getHeaderValue('VERSION')) || 2,
      units: getHeaderValue('UNITS') || 'METRIC',
      description: getHeaderValue('DESCRIPTION') || '',
      fileName: getHeaderValue('FILE NAME') || '',
      format: 'MINUTES PERCENTAGE TEXT', // Format standard
    }
  }

  /**
   * Parse les données d'entraînement
   */
  private parseData(content: string): MrcDataPoint[] {
    const dataMatch = content.match(/\[COURSE DATA\]([\s\S]*?)\[END COURSE DATA\]/)
    if (!dataMatch) {
      throw new Error('Format MRC invalide : données non trouvées')
    }

    const dataContent = dataMatch[1]
    const lines = dataContent.split('\n').filter((line) => line.trim())
    const dataPoints: MrcDataPoint[] = []

    for (const line of lines) {
      // Format 1: MINUTES PERCENTAGE "TEXT" (avec texte)
      const matchWithText = line.match(/^\s*([\d.]+)\s+([\d.]+)\s+"([^"]*)"/)
      if (matchWithText) {
        dataPoints.push({
          minutes: parseFloat(matchWithText[1]),
          percentage: parseFloat(matchWithText[2]),
          text: matchWithText[3],
        })
        continue
      }

      // Format 2: MINUTES PERCENTAGE (sans texte - format Zwift/TrainerRoad simple)
      const matchSimple = line.match(/^\s*([\d.]+)\s+([\d.]+)\s*$/)
      if (matchSimple) {
        dataPoints.push({
          minutes: parseFloat(matchSimple[1]),
          percentage: parseFloat(matchSimple[2]),
          text: '',
        })
      }
    }

    return dataPoints
  }

  /**
   * Détecter si c'est une séance PPG
   */
  private detectPpg(dataPoints: MrcDataPoint[]): boolean {
    const ppgKeywords = [
      'SQUAT',
      'PLANCHE',
      'FENTES',
      'CHAISE',
      'DEADLIFT',
      'BURPEE',
      'POMPE',
      'CRUNCH',
      'GAINAGE',
      'LUNGE',
      'MOUNTAIN',
      'JUMPING',
      'ND,',
    ]

    for (const point of dataPoints) {
      const text = point.text.toUpperCase()
      for (const keyword of ppgKeywords) {
        if (text.includes(keyword)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Détecter le niveau de la séance
   */
  private detectLevel(
    description: string,
    fileName: string
  ): 'beginner' | 'intermediate' | 'expert' {
    const combined = (description + ' ' + fileName).toLowerCase()

    if (
      combined.includes('débutant') ||
      combined.includes('debutant') ||
      combined.includes('deb') ||
      combined.includes('beginner')
    ) {
      return 'beginner'
    }

    if (
      combined.includes('expert') ||
      combined.includes('exp') ||
      combined.includes('avancé') ||
      combined.includes('advanced') ||
      combined.includes('triathlete') ||
      combined.includes('cyclosportif') ||
      combined.includes('ultra')
    ) {
      return 'expert'
    }

    return 'intermediate'
  }

  /**
   * Extraire un nom propre pour la séance
   */
  private extractName(header: MrcHeader): string {
    // Nettoyer le nom du fichier
    let name = header.fileName
      .replace(/_/g, ' ')
      .replace(/iDO Sport App/gi, '')
      .replace(/créé par.*$/gi, '')
      .trim()

    // Si vide, utiliser la description
    if (!name) {
      name = header.description.replace(/créé par.*$/gi, '').trim()
    }

    // Nettoyer les espaces multiples
    name = name.replace(/\s+/g, ' ').trim()

    return name || 'Séance importée'
  }

  /**
   * Calculer l'intensité moyenne pondérée par la durée
   */
  private calculateAverageIntensity(dataPoints: MrcDataPoint[]): number {
    if (dataPoints.length < 2) return 0

    let totalWeightedIntensity = 0
    let totalDuration = 0

    for (let i = 1; i < dataPoints.length; i++) {
      const duration = dataPoints[i].minutes - dataPoints[i - 1].minutes
      const intensity = dataPoints[i - 1].percentage
      totalWeightedIntensity += duration * intensity
      totalDuration += duration
    }

    return totalDuration > 0 ? Math.round(totalWeightedIntensity / totalDuration) : 0
  }

  /**
   * Convertir les data points en blocs d'entraînement
   */
  private convertToBlocks(dataPoints: MrcDataPoint[]): MrcBlock[] {
    const blocks: MrcBlock[] = []

    if (dataPoints.length < 2) return blocks

    // Regrouper les segments consécutifs avec la même intensité et le même texte
    let i = 0
    while (i < dataPoints.length - 1) {
      const startPoint = dataPoints[i]
      let endPoint = dataPoints[i + 1]
      const intensity = startPoint.percentage
      const text = startPoint.text

      // Chercher la fin de ce segment (même intensité)
      let j = i + 1
      while (j < dataPoints.length - 1 && dataPoints[j].percentage === intensity) {
        j++
      }
      endPoint = dataPoints[j]

      const durationMinutes = endPoint.minutes - startPoint.minutes

      if (durationMinutes > 0) {
        const block: MrcBlock = {
          type: this.detectBlockType(intensity, text),
          duration: this.minutesToDuration(durationMinutes),
          percentFtp: Math.round(intensity),
          reps: 1,
          notes: text || undefined,
        }
        blocks.push(block)
      }

      i = j
    }

    // Fusionner les blocs similaires consécutifs
    return this.mergeConsecutiveBlocks(blocks)
  }

  /**
   * Fusionner les blocs consécutifs identiques
   */
  private mergeConsecutiveBlocks(blocks: MrcBlock[]): MrcBlock[] {
    if (blocks.length <= 1) return blocks

    const merged: MrcBlock[] = []
    let current = { ...blocks[0] }

    for (let i = 1; i < blocks.length; i++) {
      const next = blocks[i]

      // Si même type, même intensité et même notes, fusionner
      if (
        next.type === current.type &&
        next.percentFtp === current.percentFtp &&
        next.notes === current.notes
      ) {
        // Additionner les durées
        const currentSeconds = this.durationToSeconds(current.duration)
        const nextSeconds = this.durationToSeconds(next.duration)
        current.duration = this.minutesToDuration((currentSeconds + nextSeconds) / 60)
      } else {
        merged.push(current)
        current = { ...next }
      }
    }

    merged.push(current)
    return merged
  }

  /**
   * Détecter le type de bloc basé sur l'intensité et le texte
   */
  private detectBlockType(
    intensity: number,
    text: string
  ): 'warmup' | 'interval' | 'effort' | 'recovery' | 'cooldown' {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('échauffement') || lowerText.includes('warm')) {
      return 'warmup'
    }

    if (
      lowerText.includes('récupération') ||
      lowerText.includes('recovery') ||
      lowerText.includes('recup')
    ) {
      if (intensity <= 55) {
        return 'cooldown'
      }
      return 'recovery'
    }

    if (lowerText.includes('retour') || lowerText.includes('cooldown')) {
      return 'cooldown'
    }

    // Basé sur l'intensité
    if (intensity >= 100) {
      return 'effort'
    }

    if (intensity >= 85) {
      return 'interval'
    }

    if (intensity <= 65) {
      return 'recovery'
    }

    return 'interval'
  }

  /**
   * Convertir les data points en exercices PPG
   */
  private convertToPpgExercises(dataPoints: MrcDataPoint[]): MrcPpgExercise[] {
    const exerciseMap = new Map<string, MrcPpgExercise>()

    for (let i = 0; i < dataPoints.length - 1; i++) {
      const point = dataPoints[i]
      const nextPoint = dataPoints[i + 1]
      const text = point.text

      // Ignorer les récupérations
      if (text.toLowerCase().includes('récupération')) {
        continue
      }

      // Extraire le nom de l'exercice (format: "ND, NOM_EXERCICE 3 1 1 1")
      const exerciseMatch = text.match(/(?:ND,\s*)?([A-Z][A-Z\s_]+?)(?:\s+\d+\s+\d+\s+\d+\s+\d+)?$/)
      if (!exerciseMatch) continue

      const exerciseName = exerciseMatch[1]
        .trim()
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      const durationMinutes = nextPoint.minutes - point.minutes

      // Grouper par nom d'exercice
      if (exerciseMap.has(exerciseName)) {
        const existing = exerciseMap.get(exerciseName)!
        existing.sets++
      } else {
        exerciseMap.set(exerciseName, {
          name: exerciseName,
          duration: this.minutesToDuration(durationMinutes),
          reps: null, // En temps, pas en répétitions
          sets: 1,
          rest: '00:15', // Repos standard
          notes: text.includes('3 1 1 1') ? 'Tempo: 3-1-1-1' : undefined,
        })
      }
    }

    return Array.from(exerciseMap.values())
  }

  /**
   * Convertir des minutes en format "MM:SS"
   */
  private minutesToDuration(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  /**
   * Convertir "MM:SS" en secondes
   */
  private durationToSeconds(duration: string): number {
    const [mins, secs] = duration.split(':').map(Number)
    return (mins || 0) * 60 + (secs || 0)
  }

  /**
   * Calculer le TSS estimé pour la séance
   */
  calculateTss(blocks: MrcBlock[], totalDurationMinutes: number): number {
    if (!blocks.length) return 0

    // TSS = (durée en heures) * (IF^2) * 100
    // IF = Intensité Factor = NP / FTP (ici on approxime avec l'intensité moyenne)

    let totalWeightedIntensity = 0
    let totalDuration = 0

    for (const block of blocks) {
      const durationSeconds = this.durationToSeconds(block.duration) * block.reps
      const intensity = block.percentFtp / 100
      totalWeightedIntensity += durationSeconds * Math.pow(intensity, 2)
      totalDuration += durationSeconds
    }

    if (totalDuration === 0) return 0

    const avgIntensityFactor = Math.sqrt(totalWeightedIntensity / totalDuration)
    const hours = totalDurationMinutes / 60
    const tss = Math.round(hours * Math.pow(avgIntensityFactor, 2) * 100)

    return tss
  }

  /**
   * Générer l'intensityRef basé sur les blocs
   */
  generateIntensityRef(blocks: MrcBlock[]): string {
    if (!blocks.length) return '60-70% FTP'

    const intensities = blocks.map((b) => b.percentFtp)
    const min = Math.min(...intensities)
    const max = Math.max(...intensities)

    if (min === max) {
      return `${min}% FTP`
    }

    return `${min}-${max}% FTP`
  }
}
