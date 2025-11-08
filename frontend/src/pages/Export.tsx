import { useState, useEffect } from 'react'
import api from '../services/api'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Export de données</h1>
          <p className="mt-2 text-gray-600">
            Exportez vos données pour les sauvegarder ou les analyser dans d'autres outils
          </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Vos données</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.totalActivities}</div>
                <div className="text-sm text-gray-600 mt-1">Activités</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.totalWeightEntries}</div>
                <div className="text-sm text-gray-600 mt-1">Pesées</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{stats.totalEquipment}</div>
                <div className="text-sm text-gray-600 mt-1">Équipements</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {stats.firstActivityDate && (
                <div>
                  <span className="text-gray-600">Première activité: </span>
                  <span className="font-medium">
                    {new Date(stats.firstActivityDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {stats.lastActivityDate && (
                <div>
                  <span className="text-gray-600">Dernière activité: </span>
                  <span className="font-medium">
                    {new Date(stats.lastActivityDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Membre depuis: </span>
                <span className="font-medium">
                  {new Date(stats.memberSince).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Export complet */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export complet (JSON)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Téléchargez toutes vos données (profil, activités, poids, équipement) dans un
                fichier JSON unique. Idéal pour les sauvegardes complètes.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>✓ Profil utilisateur</li>
                <li>✓ Toutes les activités</li>
                <li>✓ Historique de poids</li>
                <li>✓ Liste d'équipement</li>
              </ul>
            </div>
            <button
              onClick={() => handleDownload('/all', getFileName('export', 'json'))}
              disabled={downloading === '/all'}
              className="ml-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {downloading === '/all' ? 'Téléchargement...' : 'Télécharger JSON'}
            </button>
          </div>
        </div>

        {/* Exports CSV */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Exports CSV</h2>
          <p className="text-sm text-gray-600 mb-6">
            Exportez vos données au format CSV pour les ouvrir dans Excel, Google Sheets ou d'autres
            outils d'analyse.
          </p>

          <div className="space-y-4">
            {/* Activités CSV */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">Activités</h4>
                <p className="text-sm text-gray-500">
                  Date, type, durée, distance, FC, vitesse, puissance, TRIMP, etc.
                </p>
              </div>
              <button
                onClick={() =>
                  handleDownload('/activities/csv', getFileName('activities', 'csv'))
                }
                disabled={downloading === '/activities/csv'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {downloading === '/activities/csv' ? 'Téléchargement...' : 'CSV'}
              </button>
            </div>

            {/* Poids CSV */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">Historique de poids</h4>
                <p className="text-sm text-gray-500">Date, poids, notes</p>
              </div>
              <button
                onClick={() => handleDownload('/weight/csv', getFileName('weight', 'csv'))}
                disabled={downloading === '/weight/csv'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {downloading === '/weight/csv' ? 'Téléchargement...' : 'CSV'}
              </button>
            </div>

            {/* Équipement CSV */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">Équipement</h4>
                <p className="text-sm text-gray-500">
                  Nom, type, marque, modèle, kilométrage, dates
                </p>
              </div>
              <button
                onClick={() => handleDownload('/equipment/csv', getFileName('equipment', 'csv'))}
                disabled={downloading === '/equipment/csv'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {downloading === '/equipment/csv' ? 'Téléchargement...' : 'CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">À propos des exports</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Format JSON :</strong> Contient toutes vos données dans un format structuré.
              Parfait pour les sauvegardes ou l'import dans d'autres applications.
            </p>
            <p>
              <strong>Format CSV :</strong> Compatible avec Excel et Google Sheets. Les fichiers
              sont encodés en UTF-8 avec BOM pour une compatibilité maximale.
            </p>
            <p>
              <strong>Confidentialité :</strong> Vos données ne quittent jamais votre appareil. Les
              exports sont générés côté serveur et téléchargés directement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
