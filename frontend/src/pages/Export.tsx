import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import toast from 'react-hot-toast'

interface ExportStats {
  totalActivities: number
  totalWeightEntries: number
  totalEquipment: number
  firstActivityDate: string | null
  lastActivityDate: string | null
  memberSince: string
}

export default function Export() {
  const [stats, setStats] = useState<ExportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [cleanImport, setCleanImport] = useState(false)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/exports/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
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

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement')
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
    } catch (error) {
      console.error('Erreur lors du téléchargement de la sauvegarde:', error)
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

      // Lire le fichier
      const fileContent = await backupFile.text()
      const backupData = JSON.parse(fileContent)

      // Valider le format
      if (backupData.exportType !== 'FULL_BACKUP') {
        toast.error('Format de sauvegarde invalide')
        return
      }

      // Envoyer au serveur
      const response = await api.post('/api/exports/restore', backupData, {
        params: { clean: cleanImport },
      })

      toast.success(`Sauvegarde restaurée avec succès ! ${response.data.data.imported.activities} activités, ${response.data.data.imported.weightHistories} pesées, ${response.data.data.imported.equipment} équipements, ${response.data.data.imported.goals} objectifs, ${response.data.data.imported.badges} badges importés.`)

      setShowRestoreModal(false)
      setBackupFile(null)
      setCleanImport(false)

      // Recharger les stats
      fetchStats()

      // Recharger la page après 2s
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      console.error('Erreur lors de la restauration:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la restauration de la sauvegarde')
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Export de données" description="Préparation des statistiques">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Export de données" description="Sauvegardez vos données en JSON ou CSV">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="glass-panel p-6">
          <h1 className="text-3xl font-bold text-text-dark font-display">Export de données</h1>
          <p className="mt-2 text-text-body">
            Exportez vos données pour les sauvegarder ou les analyser dans d'autres outils
          </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="glass-panel p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4 font-display">Vos données</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <div className="pt-6 border-t border-border-base grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {stats.firstActivityDate && (
                <div>
                  <span className="text-text-body">Première activité: </span>
                  <span className="font-medium">
                    {new Date(stats.firstActivityDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {stats.lastActivityDate && (
                <div>
                  <span className="text-text-body">Dernière activité: </span>
                  <span className="font-medium">
                    {new Date(stats.lastActivityDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              <div>
                <span className="text-text-body">Membre depuis: </span>
                <span className="font-medium">
                  {new Date(stats.memberSince).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sauvegarde et restauration */}
        <div className="glass-panel p-6 border-2 border-cta">
          <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast mb-4 font-display flex items-center gap-2">
            <span className="text-3xl">💾</span>
            Sauvegarde & Restauration
          </h2>
          <p className="text-text-body dark:text-dark-text-secondary mb-6">
            Protection complète de vos données. Créez une sauvegarde de toutes vos données ou restaurez une sauvegarde précédente en cas de problème.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sauvegarde complète */}
            <div className="bg-bg-subtle dark:bg-dark-bg/50 p-6 rounded-xl border-2 border-panel-border">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">⬇️</span>
                <div>
                  <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                    Créer une sauvegarde
                  </h3>
                  <p className="text-sm text-text-body dark:text-dark-text-secondary mb-4">
                    Téléchargez une copie complète de toutes vos données en un seul fichier JSON.
                  </p>
                </div>
              </div>

              <ul className="text-sm text-text-body dark:text-dark-text-secondary space-y-2 mb-4 ml-12">
                <li>✅ Toutes les activités (avec GPS et météo)</li>
                <li>✅ Historique de poids complet</li>
                <li>✅ Équipements et kilométrage</li>
                <li>✅ Objectifs personnels</li>
                <li>✅ Badges débloqués</li>
                <li>✅ Paramètres du profil</li>
              </ul>

              <button
                onClick={handleBackupDownload}
                disabled={downloading === '/backup'}
                className="w-full btn-primary font-display text-lg"
              >
                {downloading === '/backup' ? '⏳ Création...' : '💾 Créer une sauvegarde'}
              </button>
            </div>

            {/* Restauration */}
            <div className="bg-bg-subtle dark:bg-dark-bg/50 p-6 rounded-xl border-2 border-panel-border">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">⬆️</span>
                <div>
                  <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                    Restaurer une sauvegarde
                  </h3>
                  <p className="text-sm text-text-body dark:text-dark-text-secondary mb-4">
                    Importez un fichier de sauvegarde pour restaurer vos données.
                  </p>
                </div>
              </div>

              <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-4 mb-4 ml-12">
                <p className="text-sm text-warning-dark dark:text-warning font-medium flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    La restauration ajoutera les données de la sauvegarde aux données existantes.
                    Utilisez l'option "Nettoyage complet" pour remplacer toutes vos données actuelles.
                  </span>
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full px-6 py-3 rounded-xl border-2 border-cta bg-cta/20 text-cta-dark dark:text-cta hover:bg-cta/30 transition-all font-medium font-display text-lg"
              >
                {importing ? '⏳ Restauration...' : '📁 Sélectionner un fichier'}
              </button>
            </div>
          </div>

          {/* Info supplémentaire */}
          <div className="mt-6 bg-info/10 border-2 border-info/40 rounded-lg p-4">
            <p className="text-sm text-info-dark dark:text-info">
              <strong>💡 Conseil :</strong> Créez une sauvegarde régulièrement (hebdomadaire ou mensuelle) pour protéger vos données.
              Conservez vos fichiers de sauvegarde dans un endroit sûr (cloud, disque dur externe, etc.).
            </p>
          </div>
        </div>

        {/* Export complet */}
        <div className="glass-panel p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-dark mb-2">Export complet (JSON)</h3>
              <p className="text-sm text-text-body mb-4">
                Téléchargez toutes vos données (profil, activités, poids, équipement) dans un
                fichier JSON unique. Idéal pour les sauvegardes complètes.
              </p>
              <ul className="text-sm text-text-secondary space-y-1 mb-4">
                <li>✓ Profil utilisateur</li>
                <li>✓ Toutes les activités</li>
                <li>✓ Historique de poids</li>
                <li>✓ Liste d'équipement</li>
              </ul>
            </div>
            <button
              onClick={() => handleDownload('/all', getFileName('export', 'json'))}
              disabled={downloading === '/all'}
              className="btn-primary ml-4 whitespace-nowrap font-display"
            >
              {downloading === '/all' ? 'Téléchargement...' : 'Télécharger JSON'}
            </button>
          </div>
        </div>

        {/* Exports CSV et GPX */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4 font-display">Exports de données</h2>
          <p className="text-sm text-text-body dark:text-dark-text-secondary mb-6">
            Exportez vos données au format CSV pour l'analyse ou GPX pour les activités avec GPS.
          </p>

          <div className="space-y-4">
            {/* Activités CSV */}
            <div className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors">
              <div>
                <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">Activités (CSV)</h4>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  Date, type, durée, distance, FC, vitesse, puissance, TRIMP, etc.
                </p>
              </div>
              <button
                onClick={() =>
                  handleDownload('/activities/csv', getFileName('activities', 'csv'))
                }
                disabled={downloading === '/activities/csv'}
                className="btn-primary px-6"
              >
                {downloading === '/activities/csv' ? 'Téléchargement...' : 'CSV'}
              </button>
            </div>

            {/* Export GPX info */}
            <div className="flex items-center justify-between p-4 border-2 border-info/40 bg-info/10 rounded-xl">
              <div>
                <h4 className="font-medium text-info-dark dark:text-info">Activités (GPX)</h4>
                <p className="text-sm text-info-dark/80 dark:text-info/80">
                  Export individuel disponible sur chaque activité avec données GPS
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/activities'}
                className="px-6 py-2 rounded-xl border-2 border-info bg-info/20 text-info-dark dark:text-info hover:bg-info/30 transition-all font-medium"
              >
                Voir activités
              </button>
            </div>

            {/* Poids CSV */}
            <div className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors">
              <div>
                <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">Historique de poids (CSV)</h4>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Date, poids, notes</p>
              </div>
              <button
                onClick={() => handleDownload('/weight/csv', getFileName('weight', 'csv'))}
                disabled={downloading === '/weight/csv'}
                className="btn-primary px-6"
              >
                {downloading === '/weight/csv' ? 'Téléchargement...' : 'CSV'}
              </button>
            </div>

            {/* Équipement CSV */}
            <div className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors">
              <div>
                <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">Équipement (CSV)</h4>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  Nom, type, marque, modèle, kilométrage, dates
                </p>
              </div>
              <button
                onClick={() => handleDownload('/equipment/csv', getFileName('equipment', 'csv'))}
                disabled={downloading === '/equipment/csv'}
                className="btn-primary px-6"
              >
                {downloading === '/equipment/csv' ? 'Téléchargement...' : 'CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="glass-panel p-6 border-2 border-info bg-info/10">
          <h3 className="font-semibold text-text-dark dark:text-dark-text-contrast mb-3 font-display">À propos des exports</h3>
          <div className="space-y-3 text-sm text-text-body dark:text-dark-text-secondary">
            <p>
              <strong className="text-text-dark dark:text-dark-text-contrast">Format JSON :</strong> Contient toutes vos données dans un format structuré.
              Parfait pour les sauvegardes complètes ou l'import dans d'autres applications.
            </p>
            <p>
              <strong className="text-text-dark dark:text-dark-text-contrast">Format CSV :</strong> Compatible avec Excel et Google Sheets. Les fichiers
              sont encodés en UTF-8 avec BOM pour une compatibilité maximale. Idéal pour l'analyse de données.
            </p>
            <p>
              <strong className="text-text-dark dark:text-dark-text-contrast">Format GPX :</strong> Format standard pour les traces GPS. Compatible avec Strava,
              Garmin Connect, et la plupart des applications de sport. Export individuel par activité.
            </p>
            <p>
              <strong className="text-text-dark dark:text-dark-text-contrast">Confidentialité :</strong> Vos données restent hébergées localement. Les exports
              sont générés côté serveur et téléchargés directement sur votre appareil.
            </p>
          </div>
        </div>

        {/* Modal de restauration */}
        {showRestoreModal && backupFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  Confirmer la restauration
                </h2>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Fichier sélectionné :</strong> {backupFile.name}
                    </p>
                    <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">
                      <strong>Taille :</strong> {(backupFile.size / 1024).toFixed(2)} Ko
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 dark:text-yellow-200 font-medium">
                      ⚠️ Attention : Cette opération va importer les données de la sauvegarde.
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
                          Nettoyage complet (Supprimer toutes les données existantes)
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Si coché, toutes vos données actuelles seront supprimées avant l'import.
                          Sinon, les données de la sauvegarde seront ajoutées aux données existantes.
                        </p>
                      </div>
                    </label>
                  </div>

                  {cleanImport && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-900 dark:text-red-200 font-medium flex items-start gap-2">
                        <span className="text-xl">🚨</span>
                        <span>
                          <strong>DANGER :</strong> Toutes vos données actuelles seront définitivement supprimées !
                          Cette action est irréversible. Assurez-vous d'avoir une sauvegarde récente.
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
                      onClick={handleRestore}
                      disabled={importing}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        cleanImport
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {importing ? '⏳ Restauration en cours...' : cleanImport ? '🚨 Nettoyer et restaurer' : '✅ Restaurer'}
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
