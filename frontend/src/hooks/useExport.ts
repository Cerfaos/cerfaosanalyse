/**
 * Hook pour gérer la page Export
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { ExtendedStats, BackupStatus } from '../types/export'

export function useExport() {
  const [stats, setStats] = useState<ExtendedStats | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showBackupDetails, setShowBackupDetails] = useState(false)
  const [cleanImport, setCleanImport] = useState(false)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [statsResponse, backupResponse] = await Promise.all([
        api.get('/api/exports/extended-stats'),
        api.get('/api/exports/backup-status'),
      ])
      setStats(statsResponse.data.data)
      setBackupStatus(backupResponse.data.data)
    } catch {
      // Erreurs gérées par l'intercepteur
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDownload = useCallback(async (endpoint: string, filename: string) => {
    try {
      setDownloading(endpoint)
      const response = await api.get(`/api/exports${endpoint}`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setDownloading(null)
    }
  }, [])

  const getFileName = useCallback((type: string, extension: string) => {
    const date = new Date().toISOString().split('T')[0]
    return `cerfaos-${type}-${date}.${extension}`
  }, [])

  const handleBackupDownload = useCallback(async () => {
    try {
      setDownloading('/backup')
      const response = await api.get('/api/exports/backup', {
        responseType: 'blob',
      })

      const now = new Date()
      const filename = `cerfaos-backup-${now.toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Sauvegarde téléchargée avec succès')
    } catch {
      toast.error('Erreur lors du téléchargement de la sauvegarde')
    } finally {
      setDownloading(null)
    }
  }, [])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setBackupFile(file)
        setShowRestoreModal(true)
      } else {
        toast.error('Veuillez sélectionner un fichier JSON valide')
      }
    }
  }, [])

  const handleRestore = useCallback(async () => {
    if (!backupFile) return

    try {
      setImporting(true)

      const fileContent = await backupFile.text()
      const backupData = JSON.parse(fileContent)

      if (backupData.exportType !== 'FULL_BACKUP') {
        toast.error('Format de sauvegarde invalide')
        return
      }

      const response = await api.post('/api/exports/restore', backupData, {
        params: { clean: cleanImport },
      })

      toast.success(
        `Sauvegarde restaurée ! ${response.data.data.imported.activities} activités, ${response.data.data.imported.weightHistories} pesées, ${response.data.data.imported.equipment} équipements importés.`
      )

      setShowRestoreModal(false)
      setBackupFile(null)
      setCleanImport(false)

      fetchData()

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors de la restauration')
    } finally {
      setImporting(false)
    }
  }, [backupFile, cleanImport, fetchData])

  const closeRestoreModal = useCallback(() => {
    setShowRestoreModal(false)
    setBackupFile(null)
    setCleanImport(false)
  }, [])

  return {
    // State
    stats,
    backupStatus,
    loading,
    downloading,
    importing,
    showRestoreModal,
    showBackupDetails,
    cleanImport,
    backupFile,
    fileInputRef,
    // Actions
    setShowBackupDetails,
    setCleanImport,
    handleDownload,
    getFileName,
    handleBackupDownload,
    handleFileSelect,
    handleRestore,
    closeRestoreModal,
  }
}

// Utilitaires de formatage
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getTimeSinceLastBackup(dateString: string | null): string {
  if (!dateString) return 'Jamais'
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  return 'Récemment'
}
