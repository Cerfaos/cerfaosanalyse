/**
 * Types pour les exports
 */

export interface UserExportData {
  email: string
  fullName: string | null
  fcMax: number | null
  fcRepos: number | null
  weightCurrent?: number | null
  theme?: string | null
  avatarUrl?: string | null
}

export interface ActivityExportData {
  date: string | null
  type: string
  duration: number
  distance: number
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
  fileName: string | null
}

export interface WeightExportData {
  date: string | null
  weight: number
  notes: string | null
}

export interface EquipmentExportData {
  name: string
  type: string
  brand: string | null
  model: string | null
  initialDistance: number
  currentDistance: number
  alertDistance: number | null
  purchaseDate: string | null
  retirementDate: string | null
  isActive: boolean
  notes: string | null
}

export interface ExportAllData {
  exportDate: string | null
  user: UserExportData
  activities: ActivityExportData[]
  weightHistories: WeightExportData[]
  equipment: EquipmentExportData[]
}

export interface BackupData {
  version: string
  exportDate: string | null
  exportType: 'FULL_BACKUP'
  user: UserExportData
  activities: Record<string, unknown>[]
  weightHistories: Record<string, unknown>[]
  equipment: Record<string, unknown>[]
  metadata: {
    totalActivities: number
    totalWeightEntries: number
    totalEquipment: number
  }
}

export interface ImportResult {
  activities: number
  weightHistories: number
  equipment: number
}

export interface BackupFileInfo {
  name: string
  date: string
  size: string
}

export interface BackupStatus {
  full: BackupFileInfo[]
  db: BackupFileInfo[]
  uploads: BackupFileInfo[]
}

export interface BackupSummary {
  totalFull: number
  totalDb: number
  totalUploads: number
  totalSize: string
  lastBackupDate: string | null
}

export interface ExportStats {
  totalActivities: number
  totalWeightEntries: number
  totalEquipment: number
  firstActivityDate: string | null
  lastActivityDate: string | null
  memberSince: string | null
}

export interface ExtendedStats extends ExportStats {
  totalTrainingSessions: number
  totalTrainingTemplates: number
  totalTrainingPrograms: number
  totalPpgExercises: number
  estimatedDataSize: string
}

export interface CsvColumn<T> {
  header: string
  getValue: (item: T) => string | number
}

export interface ActivityFilters {
  type?: string
  search?: string
  startDate?: string
  endDate?: string
}
