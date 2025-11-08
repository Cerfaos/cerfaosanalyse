import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Activity {
  id: number
  date: string
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
  createdAt: string
}

interface ActivityStats {
  count: number
  totalDuration: number
  totalDistance: number
  totalTrimp: number
  avgDuration: number
  avgDistance: number
  avgTrimp: number
  avgHeartRate: number
  byType: Record<string, number>
}

export default function Activities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filterType, setFilterType] = useState('')
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadData()
  }, [filterType, period])

  const loadData = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filterType) params.type = filterType

      const [activitiesRes, statsRes] = await Promise.all([
        api.get('/api/activities', { params }),
        api.get('/api/activities/stats', { params: { period, type: filterType } }),
      ])

      setActivities(activitiesRes.data.data.data || [])
      setStats(statsRes.data.data)
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setError('Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setError('')
    setSuccess('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      await api.post('/api/activities/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Activité importée avec succès !')
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Recharger les données
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'import')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette activité ?')) return

    try {
      await api.delete(`/api/activities/${id}`)
      setSuccess('Activité supprimée')
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min ${secs}s`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }

  const formatSpeed = (kmh: number | null) => {
    if (!kmh) return '-'
    return `${kmh.toFixed(1)} km/h`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Cyclisme':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'Course':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">Activités</h1>
        <p className="text-text-secondary">
          Importez vos activités et suivez vos performances
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Statistiques */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Activités</p>
            <p className="text-3xl font-bold text-accent-500">{stats.count}</p>
            <p className="text-xs text-text-tertiary mt-1">Sur {period} jours</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Distance totale</p>
            <p className="text-3xl font-bold text-text-dark">
              {formatDistance(stats.totalDistance)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Moy: {formatDistance(stats.avgDistance)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Temps total</p>
            <p className="text-3xl font-bold text-text-dark">
              {formatDuration(stats.totalDuration)}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Moy: {formatDuration(stats.avgDuration)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">TRIMP total</p>
            <p className="text-3xl font-bold text-accent-500">{stats.totalTrimp}</p>
            <p className="text-xs text-text-tertiary mt-1">
              Moy: {stats.avgTrimp} / activité
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire d'upload */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">
              Importer une activité
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-text-body mb-2">
                  Fichier
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept=".fit,.gpx,.csv"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
                <p className="text-sm text-text-tertiary mt-2">
                  Formats acceptés: FIT, GPX, CSV
                </p>
              </div>

              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    Fichier sélectionné: <strong>{selectedFile.name}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Taille: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full px-6 py-3 bg-accent-500 text-white rounded-md hover:bg-accent-600 shadow-button hover:shadow-button-hover transition-all font-medium disabled:opacity-50"
              >
                {uploading ? 'Import en cours...' : 'Importer'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Le TRIMP sera calculé automatiquement si votre activité contient des données de fréquence cardiaque et que vous avez configuré vos FC max et repos dans votre profil.
              </p>
            </div>
          </div>
        </div>

        {/* Liste et filtres */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtres */}
          <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="period" className="block text-sm font-medium text-text-body mb-2">
                  Période
                </label>
                <select
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">90 derniers jours</option>
                  <option value="365">1 an</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label htmlFor="type" className="block text-sm font-medium text-text-body mb-2">
                  Type d'activité
                </label>
                <select
                  id="type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Tous les types</option>
                  <option value="Cyclisme">Cyclisme</option>
                  <option value="Course">Course</option>
                  <option value="Natation">Natation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">Historique</h2>

            {loading ? (
              <p className="text-center text-text-secondary py-8">Chargement...</p>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-text-tertiary mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-text-secondary">Aucune activité enregistrée</p>
                <p className="text-sm text-text-tertiary mt-2">
                  Importez votre première activité pour commencer
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border border-border-base rounded-md hover:bg-bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/activities/${activity.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-accent-500">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-dark">
                            {activity.type}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {new Date(activity.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-text-tertiary">Distance</p>
                          <p className="font-medium text-text-dark">
                            {formatDistance(activity.distance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Durée</p>
                          <p className="font-medium text-text-dark">
                            {formatDuration(activity.duration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">FC moy</p>
                          <p className="font-medium text-text-dark">
                            {activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">TRIMP</p>
                          <p className="font-medium text-accent-500">
                            {activity.trimp || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(activity.id)
                      }}
                      className="text-red-600 hover:text-red-700 transition-colors p-2 ml-4"
                      title="Supprimer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
