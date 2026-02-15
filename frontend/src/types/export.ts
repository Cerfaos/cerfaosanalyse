/**
 * Types pour la page Export
 */

export interface ExtendedStats {
  totalActivities: number
  totalWeightEntries: number
  totalEquipment: number
  totalTrainingSessions: number
  totalTrainingTemplates: number
  totalTrainingPrograms: number
  totalPpgExercises: number
  firstActivityDate: string | null
  lastActivityDate: string | null
  memberSince: string
  estimatedDataSize: string
}

export interface BackupInfo {
  name: string
  date: string
  size: string
}

export interface BackupStatus {
  backups: {
    full: BackupInfo[]
    db: BackupInfo[]
    uploads: BackupInfo[]
  }
  summary: {
    totalFull: number
    totalDb: number
    totalUploads: number
    totalSize: string
    lastBackupDate: string | null
  }
  serverBackupEnabled: boolean
  backupSchedule: string
}
