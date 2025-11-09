import { useState, useEffect, useRef } from 'react'
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
  const formRef = useRef<HTMLDivElement>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filterType, setFilterType] = useState('')
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload')
  const [manualFormData, setManualFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Cyclisme',
    hours: '',
    minutes: '',
    seconds: '',
    distance: '',
    avgHeartRate: '',
    maxHeartRate: '',
    avgSpeed: '',
    maxSpeed: '',
    elevationGain: '',
    calories: '',
    avgCadence: '',
    avgPower: '',
    normalizedPower: '',
  })

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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      // Convertir le temps en secondes
      const duration =
        (Number(manualFormData.hours) || 0) * 3600 +
        (Number(manualFormData.minutes) || 0) * 60 +
        (Number(manualFormData.seconds) || 0)

      // Convertir la distance en mètres
      const distance = Number(manualFormData.distance) * 1000

      const payload: any = {
        date: manualFormData.date,
        type: manualFormData.type,
        duration,
        distance,
      }

      // Ajouter les champs optionnels seulement s'ils sont remplis
      if (manualFormData.avgHeartRate) payload.avgHeartRate = Number(manualFormData.avgHeartRate)
      if (manualFormData.maxHeartRate) payload.maxHeartRate = Number(manualFormData.maxHeartRate)
      if (manualFormData.avgSpeed) payload.avgSpeed = Number(manualFormData.avgSpeed)
      if (manualFormData.maxSpeed) payload.maxSpeed = Number(manualFormData.maxSpeed)
      if (manualFormData.elevationGain) payload.elevationGain = Number(manualFormData.elevationGain)
      if (manualFormData.calories) payload.calories = Number(manualFormData.calories)
      if (manualFormData.avgCadence) payload.avgCadence = Number(manualFormData.avgCadence)
      if (manualFormData.avgPower) payload.avgPower = Number(manualFormData.avgPower)
      if (manualFormData.normalizedPower)
        payload.normalizedPower = Number(manualFormData.normalizedPower)

      await api.post('/api/activities/create', payload)

      setSuccess('Activité créée avec succès !')
      setManualFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Cyclisme',
        hours: '',
        minutes: '',
        seconds: '',
        distance: '',
        avgHeartRate: '',
        maxHeartRate: '',
        avgSpeed: '',
        maxSpeed: '',
        elevationGain: '',
        calories: '',
        avgCadence: '',
        avgPower: '',
        normalizedPower: '',
      })

      // Recharger les données
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'activité")
    } finally {
      setUploading(false)
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

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Focus sur l'input file pour améliorer l'UX
      setTimeout(() => {
        const fileInput = document.getElementById('file-upload')
        if (fileInput) {
          fileInput.focus()
        }
      }, 500)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activités</h1>
          <p className="text-gray-600">
            Importez vos activités et suivez vos performances
          </p>
        </div>
        <button
          onClick={scrollToForm}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all font-semibold whitespace-nowrap border-2 border-blue-600 hover:border-blue-700"
          style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#ffffff' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Importer une activité
        </button>
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
        {/* Formulaire */}
        <div ref={formRef} className="lg:col-span-1" id="import-form">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nouvelle activité</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Importer un fichier
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Créer manuellement
              </button>
            </div>

            {/* Upload Form */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Fichier
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".fit,.gpx,.csv"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">Formats acceptés: FIT, GPX, CSV</p>
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
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Import en cours...' : 'Importer'}
                </button>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce :</strong> Le TRIMP sera calculé automatiquement si votre
                    activité contient des données de fréquence cardiaque.
                  </p>
                </div>
              </form>
            )}

            {/* Manual Form */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="manual-date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="manual-date"
                      value={manualFormData.date}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, date: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="manual-type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'activité *
                    </label>
                    <select
                      id="manual-type"
                      value={manualFormData.type}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, type: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Cyclisme">Cyclisme</option>
                      <option value="Course">Course</option>
                      <option value="Natation">Natation</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="HH"
                          value={manualFormData.hours}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, hours: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        />
                        <p className="text-xs text-gray-500 text-center mt-1">Heures</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          value={manualFormData.minutes}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, minutes: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        />
                        <p className="text-xs text-gray-500 text-center mt-1">Minutes</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="SS"
                          value={manualFormData.seconds}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, seconds: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        />
                        <p className="text-xs text-gray-500 text-center mt-1">Secondes</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="manual-distance" className="block text-sm font-medium text-gray-700 mb-2">
                      Distance (km) *
                    </label>
                    <input
                      type="number"
                      id="manual-distance"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 42.5"
                      value={manualFormData.distance}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, distance: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="manual-avgHR" className="block text-sm font-medium text-gray-700 mb-2">
                      FC moyenne
                    </label>
                    <input
                      type="number"
                      id="manual-avgHR"
                      min="0"
                      placeholder="bpm"
                      value={manualFormData.avgHeartRate}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, avgHeartRate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="manual-maxHR" className="block text-sm font-medium text-gray-700 mb-2">
                      FC max
                    </label>
                    <input
                      type="number"
                      id="manual-maxHR"
                      min="0"
                      placeholder="bpm"
                      value={manualFormData.maxHeartRate}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, maxHeartRate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="manual-elevation" className="block text-sm font-medium text-gray-700 mb-2">
                      Dénivelé (m)
                    </label>
                    <input
                      type="number"
                      id="manual-elevation"
                      min="0"
                      placeholder="Ex: 450"
                      value={manualFormData.elevationGain}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, elevationGain: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="manual-calories" className="block text-sm font-medium text-gray-700 mb-2">
                      Calories
                    </label>
                    <input
                      type="number"
                      id="manual-calories"
                      min="0"
                      placeholder="kcal"
                      value={manualFormData.calories}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, calories: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Création en cours...' : 'Créer l\'activité'}
                </button>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce :</strong> Le TRIMP sera calculé automatiquement si vous
                    renseignez la FC moyenne et que votre profil est configuré.
                  </p>
                </div>
              </form>
            )}
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
