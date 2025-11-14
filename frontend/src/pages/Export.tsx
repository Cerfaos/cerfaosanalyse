import { useState, useEffect } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'

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

        {/* Exports CSV */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">Exports CSV</h2>
          <p className="text-sm text-text-body mb-6">
            Exportez vos données au format CSV pour les ouvrir dans Excel, Google Sheets ou d'autres
            outils d'analyse.
          </p>

          <div className="space-y-4">
            {/* Activités CSV */}
            <div className="flex items-center justify-between p-4 border border-border-base rounded-lg hover:bg-bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-text-dark">Activités</h4>
                <p className="text-sm text-text-secondary">
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

            {/* Poids CSV */}
            <div className="flex items-center justify-between p-4 border border-border-base rounded-lg hover:bg-bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-text-dark">Historique de poids</h4>
                <p className="text-sm text-text-secondary">Date, poids, notes</p>
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
            <div className="flex items-center justify-between p-4 border border-border-base rounded-lg hover:bg-bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-text-dark">Équipement</h4>
                <p className="text-sm text-text-secondary">
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
        <div className="glass-panel p-6 border border-info bg-info-light/70">
          <h3 className="font-semibold text-text-dark mb-3 font-display">À propos des exports</h3>
          <div className="space-y-2 text-sm text-info-dark">
            <p>
              <strong>Format JSON :</strong> Contient toutes vos données dans un format structuré.
              Parfait pour les sauvegardes ou l'import dans d'autres applications.
            </p>
            <p>
              <strong>Format CSV :</strong> Compatible avec Excel et Google Sheets. Les fichiers
              sont encodés en UTF-8 avec BOM pour une compatibilité maximale.
            </p>
            <p>
              <strong>Confidentialité :</strong> Vos données restent hébergées localement. Les exports
              sont générés côté serveur Cerfao et téléchargés directement.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
