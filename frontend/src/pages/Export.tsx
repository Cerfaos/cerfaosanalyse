import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import toast from 'react-hot-toast'

interface ExtendedStats {
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

interface BackupInfo {
  name: string
  date: string
  size: string
}

interface BackupStatus {
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

export default function Export() {
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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
  }

  const handleDownload = async (endpoint: string, filename: string) => {
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
  }

  const getFileName = (type: string, extension: string) => {
    const date = new Date().toISOString().split('T')[0]
    return `cerfaos-${type}-${date}.${extension}`
  }

  const handleBackupDownload = async () => {
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
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setBackupFile(file)
        setShowRestoreModal(true)
      } else {
        toast.error('Veuillez sélectionner un fichier JSON valide')
      }
    }
  }

  const handleRestore = async () => {
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

      toast.success(`Sauvegarde restaurée ! ${response.data.data.imported.activities} activités, ${response.data.data.imported.weightHistories} pesées, ${response.data.data.imported.equipment} équipements importés.`)

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
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeSinceLastBackup = (dateString: string | null) => {
    if (!dateString) return 'Jamais'
    const diff = Date.now() - new Date(dateString).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    return 'Récemment'
  }

  if (loading) {
    return (
      <AppLayout title="Export de données" description="Préparation des statistiques">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Export de données" description="Sauvegardez vos données">
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          eyebrow="Données"
          title="Sauvegarde & Export"
          description="Gérez vos sauvegardes et exportez vos données pour les analyser."
          icon="export"
          gradient="from-[#5CE1E6] to-[#8BC34A]"
          accentColor="#5CE1E6"
        />

        {/* Statut des sauvegardes serveur */}
        {backupStatus && (
          <div className="glass-panel p-6 border-2 border-success/50 bg-success/5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-2xl">
                  <span className="text-success">&#x2713;</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-dark dark:text-dark-text-contrast font-display">
                    Sauvegardes automatiques
                  </h2>
                  <p className="text-sm text-text-body dark:text-dark-text-secondary">
                    {backupStatus.backupSchedule} | {backupStatus.summary.totalFull} sauvegarde{backupStatus.summary.totalFull > 1 ? 's' : ''} disponible{backupStatus.summary.totalFull > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-body dark:text-dark-text-secondary">Dernière sauvegarde</div>
                <div className="font-medium text-success">
                  {getTimeSinceLastBackup(backupStatus.summary.lastBackupDate)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-cta">{backupStatus.summary.totalFull}</div>
                <div className="text-xs text-text-body">Sauvegardes complètes</div>
              </div>
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-brand">{backupStatus.summary.totalDb}</div>
                <div className="text-xs text-text-body">Bases de données</div>
              </div>
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-accent">{backupStatus.summary.totalUploads}</div>
                <div className="text-xs text-text-body">Archives uploads</div>
              </div>
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">{backupStatus.summary.totalSize}</div>
                <div className="text-xs text-text-body">Espace utilisé</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBackupDetails(!showBackupDetails)}
              className="text-sm text-cta hover:underline flex items-center gap-1"
            >
              {showBackupDetails ? 'Masquer les détails' : 'Voir les détails'}
              <span className={`transition-transform ${showBackupDetails ? 'rotate-180' : ''}`}>&#x25BC;</span>
            </button>

            {showBackupDetails && (
              <div className="mt-4 space-y-4">
                {backupStatus.backups.full.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text-dark dark:text-dark-text-contrast mb-2">Sauvegardes complètes</h4>
                    <div className="space-y-1">
                      {backupStatus.backups.full.slice(0, 5).map((backup) => (
                        <div key={backup.name} className="flex items-center justify-between text-sm bg-bg-subtle dark:bg-dark-bg/30 px-3 py-2 rounded">
                          <span className="font-mono text-xs">{backup.name}</span>
                          <span className="text-text-body">{formatDate(backup.date)} ({backup.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-info/10 border border-info/30 rounded-lg p-3">
                  <p className="text-sm text-info-dark dark:text-info">
                    <strong>Info :</strong> Les sauvegardes serveur sont stockées sur le serveur et incluent la base de données SQLite complète et tous les fichiers uploadés.
                    Utilisez <code className="bg-info/20 px-1 rounded">./scripts/restore-db.sh</code> pour restaurer depuis le serveur.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistiques des données */}
        {stats && (
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 font-display flex items-center gap-2">
              <span className="text-2xl">&#128202;</span>
              Vos données
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-cta">{stats.totalActivities}</div>
                <div className="text-sm text-text-body mt-1">Activités</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-brand">{stats.totalWeightEntries}</div>
                <div className="text-sm text-text-body mt-1">Pesées</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-accent">{stats.totalEquipment}</div>
                <div className="text-sm text-text-body mt-1">Équipements</div>
              </div>
              <div className="glass-panel p-4 text-center">
                <div className="text-3xl font-bold text-warning">{stats.totalTrainingSessions}</div>
                <div className="text-sm text-text-body mt-1">Séances</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">{stats.totalTrainingTemplates}</div>
                <div className="text-xs text-text-body">Templates</div>
              </div>
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">{stats.totalTrainingPrograms}</div>
                <div className="text-xs text-text-body">Programmes</div>
              </div>
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">{stats.totalPpgExercises}</div>
                <div className="text-xs text-text-body">Exercices PPG</div>
              </div>
              <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">{stats.estimatedDataSize}</div>
                <div className="text-xs text-text-body">Taille estimée</div>
              </div>
            </div>

            <div className="border-t border-border-base pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {stats.firstActivityDate && (
                <div>
                  <span className="text-text-body">Première activité : </span>
                  <span className="font-medium">{new Date(stats.firstActivityDate).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {stats.lastActivityDate && (
                <div>
                  <span className="text-text-body">Dernière activité : </span>
                  <span className="font-medium">{new Date(stats.lastActivityDate).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              <div>
                <span className="text-text-body">Membre depuis : </span>
                <span className="font-medium">{new Date(stats.memberSince).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sauvegarde utilisateur (JSON) */}
        <div className="glass-panel p-6 border-2 border-cta">
          <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast mb-2 font-display flex items-center gap-2">
            <span className="text-3xl">&#128190;</span>
            Sauvegarde portable
          </h2>
          <p className="text-text-body dark:text-dark-text-secondary mb-6">
            Téléchargez vos données au format JSON pour les transférer vers un autre compte ou serveur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Créer une sauvegarde */}
            <div className="bg-bg-subtle dark:bg-dark-bg/50 p-6 rounded-xl border-2 border-panel-border">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">&#11015;&#65039;</span>
                <div>
                  <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                    Exporter mes données
                  </h3>
                  <p className="text-sm text-text-body dark:text-dark-text-secondary mb-4">
                    Fichier JSON contenant toutes vos données personnelles.
                  </p>
                </div>
              </div>

              <ul className="text-sm text-text-body dark:text-dark-text-secondary space-y-1 mb-4 ml-12">
                <li>&#10003; Activités avec GPS et météo</li>
                <li>&#10003; Historique de poids</li>
                <li>&#10003; Équipements et kilométrage</li>
                <li>&#10003; Paramètres du profil</li>
              </ul>

              <button
                onClick={handleBackupDownload}
                disabled={downloading === '/backup'}
                className="w-full btn-primary font-display text-lg"
              >
                {downloading === '/backup' ? 'Création...' : 'Télécharger (JSON)'}
              </button>
            </div>

            {/* Restaurer */}
            <div className="bg-bg-subtle dark:bg-dark-bg/50 p-6 rounded-xl border-2 border-panel-border">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">&#11014;&#65039;</span>
                <div>
                  <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                    Importer une sauvegarde
                  </h3>
                  <p className="text-sm text-text-body dark:text-dark-text-secondary mb-4">
                    Restaurez vos données depuis un fichier JSON.
                  </p>
                </div>
              </div>

              <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-3 mb-4 ml-12">
                <p className="text-sm text-warning-dark dark:text-warning font-medium">
                  Les données importées seront ajoutées aux données existantes.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Sélectionner un fichier de sauvegarde JSON"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full px-6 py-3 rounded-xl border-2 border-cta bg-cta/20 text-cta-dark dark:text-cta hover:bg-cta/30 transition-all font-medium font-display text-lg"
              >
                {importing ? 'Importation...' : 'Sélectionner un fichier'}
              </button>
            </div>
          </div>
        </div>

        {/* Exports CSV/GPX */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-2 font-display flex items-center gap-2">
            <span className="text-2xl">&#128196;</span>
            Exports pour analyse
          </h2>
          <p className="text-sm text-text-body dark:text-dark-text-secondary mb-6">
            Exportez vos données au format CSV pour Excel/Google Sheets ou GPX pour les applications GPS.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors">
              <div>
                <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">Activités (CSV)</h4>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  Date, type, durée, distance, FC, vitesse, puissance, TRIMP
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload('/activities/csv', getFileName('activities', 'csv'))}
                disabled={downloading === '/activities/csv'}
                className="btn-primary px-6"
              >
                {downloading === '/activities/csv' ? '...' : 'CSV'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors">
              <div>
                <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">Historique de poids (CSV)</h4>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Date, poids, notes</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload('/weight/csv', getFileName('weight', 'csv'))}
                disabled={downloading === '/weight/csv'}
                className="btn-primary px-6"
              >
                {downloading === '/weight/csv' ? '...' : 'CSV'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors">
              <div>
                <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">Équipement (CSV)</h4>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  Nom, type, marque, modèle, kilométrage
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload('/equipment/csv', getFileName('equipment', 'csv'))}
                disabled={downloading === '/equipment/csv'}
                className="btn-primary px-6"
              >
                {downloading === '/equipment/csv' ? '...' : 'CSV'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border-2 border-info/40 bg-info/10 rounded-xl">
              <div>
                <h4 className="font-medium text-info-dark dark:text-info">Activités (GPX)</h4>
                <p className="text-sm text-info-dark/80 dark:text-info/80">
                  Export individuel sur chaque activité avec données GPS
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.location.href = '/activities'}
                className="px-6 py-2 rounded-xl border-2 border-info bg-info/20 text-info-dark dark:text-info hover:bg-info/30 transition-all font-medium"
              >
                Activités
              </button>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="glass-panel p-6 border-2 border-info bg-info/10">
          <h3 className="font-semibold text-text-dark dark:text-dark-text-contrast mb-3 font-display">Types de sauvegardes</h3>
          <div className="space-y-3 text-sm text-text-body dark:text-dark-text-secondary">
            <p>
              <strong className="text-success">Sauvegardes serveur (automatiques) :</strong> Sauvegarde complète de la base de données SQLite et des fichiers uploadés. Gérées automatiquement par le serveur avec rotation (7 dernières conservées).
            </p>
            <p>
              <strong className="text-cta">Sauvegarde portable (JSON) :</strong> Export de vos données personnelles pour transfert vers un autre compte ou serveur. Peut être réimporté via l'interface.
            </p>
            <p>
              <strong className="text-brand">Exports CSV/GPX :</strong> Pour analyse dans Excel, Google Sheets, ou applications GPS tierces.
            </p>
          </div>
        </div>

        {/* Modal de restauration */}
        {showRestoreModal && backupFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>&#9888;&#65039;</span>
                  Confirmer l'importation
                </h2>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Fichier :</strong> {backupFile.name}
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">
                      <strong>Taille :</strong> {(backupFile.size / 1024).toFixed(2)} Ko
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cleanImport}
                        onChange={(e) => setCleanImport(e.target.checked)}
                        className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Nettoyage complet avant import
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Supprime toutes vos données actuelles avant d'importer.
                        </p>
                      </div>
                    </label>
                  </div>

                  {cleanImport && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-900 dark:text-red-200 font-medium flex items-start gap-2">
                        <span className="text-xl">&#128680;</span>
                        <span>
                          <strong>DANGER :</strong> Toutes vos données actuelles seront supprimées !
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRestoreModal(false)
                        setBackupFile(null)
                        setCleanImport(false)
                      }}
                      disabled={importing}
                      className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleRestore}
                      disabled={importing}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        cleanImport
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {importing ? 'Importation...' : cleanImport ? 'Nettoyer et importer' : 'Importer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
