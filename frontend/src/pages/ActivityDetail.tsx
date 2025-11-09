import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import 'leaflet/dist/leaflet.css'

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
  gpsData: string | null
  createdAt: string
}

interface GpsPoint {
  lat: number
  lon: number
  ele?: number
  time?: string
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [gpsData, setGpsData] = useState<GpsPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isReplacingFile, setIsReplacingFile] = useState(false)
  const [replacementFile, setReplacementFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [editForm, setEditForm] = useState({
    type: '',
    date: '',
    durationHours: '',
    durationMinutes: '',
    durationSeconds: '',
    distanceKm: '',
    avgHeartRate: '',
    maxHeartRate: '',
    avgSpeed: '',
    maxSpeed: '',
    avgPower: '',
    normalizedPower: '',
    avgCadence: '',
    elevationGain: '',
    calories: '',
  })

  useEffect(() => {
    loadActivity()
  }, [id])

  const loadActivity = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/activities/${id}`)
      const activityData = response.data.data

      setActivity(activityData)

      // Parser les données GPS si disponibles
      if (activityData.gpsData) {
        try {
          const parsed = JSON.parse(activityData.gpsData)
          setGpsData(parsed)
        } catch (err) {
          console.error('Erreur parsing GPS:', err)
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement activité:', err)
      setError('Impossible de charger l\'activité')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = () => {
    if (!activity) return

    // Convertir la durée en secondes vers HH:MM:SS
    const hours = Math.floor(activity.duration / 3600)
    const minutes = Math.floor((activity.duration % 3600) / 60)
    const seconds = activity.duration % 60

    // Convertir la distance en mètres vers km
    const distanceInKm = (activity.distance / 1000).toFixed(2)

    setEditForm({
      type: activity.type,
      date: new Date(activity.date).toISOString().split('T')[0],
      durationHours: hours.toString(),
      durationMinutes: minutes.toString(),
      durationSeconds: seconds.toString(),
      distanceKm: distanceInKm,
      avgHeartRate: activity.avgHeartRate?.toString() || '',
      maxHeartRate: activity.maxHeartRate?.toString() || '',
      avgSpeed: activity.avgSpeed?.toString() || '',
      maxSpeed: activity.maxSpeed?.toString() || '',
      avgPower: activity.avgPower?.toString() || '',
      normalizedPower: activity.normalizedPower?.toString() || '',
      avgCadence: activity.avgCadence?.toString() || '',
      elevationGain: activity.elevationGain?.toString() || '',
      calories: activity.calories?.toString() || '',
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Convertir HH:MM:SS en secondes
      const hours = Number(editForm.durationHours) || 0
      const minutes = Number(editForm.durationMinutes) || 0
      const seconds = Number(editForm.durationSeconds) || 0
      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds

      // Convertir km en mètres
      const distanceInMeters = Math.round(Number(editForm.distanceKm) * 1000)

      const updateData: any = {
        type: editForm.type,
        date: editForm.date,
        duration: totalSeconds,
        distance: distanceInMeters,
      }

      // Ajouter les champs optionnels seulement s'ils sont renseignés
      if (editForm.avgHeartRate) updateData.avgHeartRate = Number(editForm.avgHeartRate)
      if (editForm.maxHeartRate) updateData.maxHeartRate = Number(editForm.maxHeartRate)
      if (editForm.avgSpeed) updateData.avgSpeed = Number(editForm.avgSpeed)
      if (editForm.maxSpeed) updateData.maxSpeed = Number(editForm.maxSpeed)
      if (editForm.avgPower) updateData.avgPower = Number(editForm.avgPower)
      if (editForm.normalizedPower) updateData.normalizedPower = Number(editForm.normalizedPower)
      if (editForm.avgCadence) updateData.avgCadence = Number(editForm.avgCadence)
      if (editForm.elevationGain) updateData.elevationGain = Number(editForm.elevationGain)
      if (editForm.calories) updateData.calories = Number(editForm.calories)

      await api.patch(`/api/activities/${id}`, updateData)

      setIsEditing(false)
      loadActivity() // Recharger l'activité mise à jour
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      alert('Erreur lors de la mise à jour de l\'activité')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplacementFile(e.target.files[0])
    }
  }

  const handleReplaceFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replacementFile) return

    setError('')
    setSuccess('')
    setUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', replacementFile)

      await api.post(`/api/activities/${id}/replace-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Fichier remplacé avec succès !')
      setReplacementFile(null)
      setIsReplacingFile(false)

      // Reset file input
      const fileInput = document.getElementById('replacement-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Recharger l'activité
      loadActivity()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du remplacement du fichier')
    } finally {
      setUploadingFile(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min ${secs.toString().padStart(2, '0')}s`
    }
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }

  const formatSpeed = (kmh: number | null) => {
    if (!kmh) return '-'
    return `${kmh.toFixed(1)} km/h`
  }

  const formatPace = (kmh: number | null) => {
    if (!kmh || kmh === 0) return '-'
    const minPerKm = 60 / kmh
    const minutes = Math.floor(minPerKm)
    const seconds = Math.round((minPerKm - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  }

  const calculateHRZones = () => {
    if (!user?.fcMax || !user?.fcRepos || !activity?.avgHeartRate) {
      return null
    }

    const fcReserve = user.fcMax - user.fcRepos

    const zones = [
      { zone: 1, name: 'Z1 - Récup', min: Math.round(user.fcRepos + 0.5 * fcReserve), max: Math.round(user.fcRepos + 0.6 * fcReserve), color: '#3B82F6' },
      { zone: 2, name: 'Z2 - Endurance', min: Math.round(user.fcRepos + 0.6 * fcReserve), max: Math.round(user.fcRepos + 0.7 * fcReserve), color: '#10B981' },
      { zone: 3, name: 'Z3 - Tempo', min: Math.round(user.fcRepos + 0.7 * fcReserve), max: Math.round(user.fcRepos + 0.8 * fcReserve), color: '#F59E0B' },
      { zone: 4, name: 'Z4 - Seuil', min: Math.round(user.fcRepos + 0.8 * fcReserve), max: Math.round(user.fcRepos + 0.9 * fcReserve), color: '#F97316' },
      { zone: 5, name: 'Z5 - VO2max', min: Math.round(user.fcRepos + 0.9 * fcReserve), max: user.fcMax, color: '#EF4444' },
    ]

    // Déterminer la zone de la FC moyenne
    let currentZone = zones[0]
    for (const zone of zones) {
      if (activity.avgHeartRate >= zone.min && activity.avgHeartRate <= zone.max) {
        currentZone = zone
        break
      }
    }

    return { zones, currentZone }
  }

  const hrZonesData = calculateHRZones()

  // Préparer les données pour le graphique d'élévation
  const elevationChartData = gpsData
    .filter((point) => point.ele !== undefined)
    .map((point, index) => ({
      index,
      elevation: point.ele,
    }))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-center text-text-secondary py-8">Chargement...</p>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Activité non trouvée'}
        </div>
        <button
          onClick={() => navigate('/activities')}
          className="mt-4 px-4 py-2 text-accent-500 hover:text-accent-600"
        >
          ← Retour aux activités
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/activities')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux activités
        </button>

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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.type}</h1>
            <p className="text-gray-600">
              {new Date(activity.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            {activity.fileName && (
              <p className="text-sm text-gray-500 mt-1">
                Fichier: {activity.fileName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activity.fileName && (
              <button
                onClick={() => setIsReplacingFile(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Remplacer le fichier
              </button>
            )}
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier l'activité
            </button>
          </div>
        </div>
      </div>

      {/* Modal de remplacement de fichier */}
      {isReplacingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Remplacer le fichier</h2>
            <p className="text-sm text-gray-600 mb-4">
              Le remplacement du fichier mettra à jour toutes les données de l'activité (durée, distance, GPS, etc.) avec les nouvelles données du fichier.
            </p>

            <form onSubmit={handleReplaceFile} className="space-y-4">
              <div>
                <label htmlFor="replacement-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau fichier
                </label>
                <input
                  type="file"
                  id="replacement-file"
                  accept=".fit,.gpx,.csv"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">Formats acceptés: FIT, GPX, CSV</p>
              </div>

              {replacementFile && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    Fichier sélectionné: <strong>{replacementFile.name}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Taille: {(replacementFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplacingFile(false)
                    setReplacementFile(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile || !replacementFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile ? 'Remplacement...' : 'Remplacer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire d'édition */}
      {isEditing && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-blue-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Modifier l'activité</h2>
          <form onSubmit={handleSubmitEdit} className="space-y-6">
            {/* Section Informations générales */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Cyclisme">Cyclisme</option>
                    <option value="Course">Course</option>
                    <option value="Natation">Natation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.distanceKm}
                    onChange={(e) => setEditForm({ ...editForm, distanceKm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Number(editForm.distanceKm).toFixed(2)} km = {(Number(editForm.distanceKm) * 1000).toFixed(0)} m
                  </p>
                </div>
              </div>

              {/* Durée en 3 champs séparés */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (HH:MM:SS) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      value={editForm.durationHours}
                      onChange={(e) => setEditForm({ ...editForm, durationHours: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="HH"
                      min="0"
                      max="99"
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Heures</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={editForm.durationMinutes}
                      onChange={(e) => setEditForm({ ...editForm, durationMinutes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM"
                      min="0"
                      max="59"
                      required
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Minutes</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={editForm.durationSeconds}
                      onChange={(e) => setEditForm({ ...editForm, durationSeconds: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SS"
                      min="0"
                      max="59"
                      required
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Secondes</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: {formatDuration(
                    (Number(editForm.durationHours) || 0) * 3600 +
                    (Number(editForm.durationMinutes) || 0) * 60 +
                    (Number(editForm.durationSeconds) || 0)
                  )}
                </p>
              </div>
            </div>

            {/* Section Cardio */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Fréquence cardiaque</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FC Moyenne (bpm)
                  </label>
                  <input
                    type="number"
                    value={editForm.avgHeartRate}
                    onChange={(e) => setEditForm({ ...editForm, avgHeartRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FC Maximale (bpm)
                  </label>
                  <input
                    type="number"
                    value={editForm.maxHeartRate}
                    onChange={(e) => setEditForm({ ...editForm, maxHeartRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="250"
                  />
                </div>
              </div>
            </div>

            {/* Section Vitesse */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Vitesse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vitesse Moyenne (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.avgSpeed}
                    onChange={(e) => setEditForm({ ...editForm, avgSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vitesse Maximale (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.maxSpeed}
                    onChange={(e) => setEditForm({ ...editForm, maxSpeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section Puissance */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Puissance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puissance Moyenne (W)
                  </label>
                  <input
                    type="number"
                    value={editForm.avgPower}
                    onChange={(e) => setEditForm({ ...editForm, avgPower: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puissance Normalisée (W)
                  </label>
                  <input
                    type="number"
                    value={editForm.normalizedPower}
                    onChange={(e) => setEditForm({ ...editForm, normalizedPower: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section Autres données */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Autres données</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cadence Moyenne (rpm)
                  </label>
                  <input
                    type="number"
                    value={editForm.avgCadence}
                    onChange={(e) => setEditForm({ ...editForm, avgCadence: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dénivelé (m)
                  </label>
                  <input
                    type="number"
                    value={editForm.elevationGain}
                    onChange={(e) => setEditForm({ ...editForm, elevationGain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={editForm.calories}
                    onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Note d'information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Si vous modifiez la fréquence cardiaque moyenne ou la durée,
                le TRIMP sera automatiquement recalculé par le système.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
          <p className="text-sm text-text-secondary mb-1">Distance</p>
          <p className="text-2xl font-bold text-accent-500">{formatDistance(activity.distance)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
          <p className="text-sm text-text-secondary mb-1">Durée</p>
          <p className="text-2xl font-bold text-text-dark">{formatDuration(activity.duration)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
          <p className="text-sm text-text-secondary mb-1">Vitesse moy</p>
          <p className="text-2xl font-bold text-text-dark">{formatSpeed(activity.avgSpeed)}</p>
          <p className="text-xs text-text-tertiary">{formatPace(activity.avgSpeed)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
          <p className="text-sm text-text-secondary mb-1">FC moyenne</p>
          <p className="text-2xl font-bold text-text-dark">
            {activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : '-'}
          </p>
          <p className="text-xs text-text-tertiary">
            Max: {activity.maxHeartRate ? `${activity.maxHeartRate} bpm` : '-'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
          <p className="text-sm text-text-secondary mb-1">Dénivelé</p>
          <p className="text-2xl font-bold text-text-dark">
            {activity.elevationGain ? `${activity.elevationGain} m` : '-'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-border-base shadow-card">
          <p className="text-sm text-text-secondary mb-1">TRIMP</p>
          <p className="text-2xl font-bold text-accent-500">{activity.trimp || '-'}</p>
        </div>
      </div>

      {/* Carte GPS */}
      {gpsData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-border-base shadow-card mb-8">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Tracé GPS</h2>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[gpsData[0].lat, gpsData[0].lon]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline
                positions={gpsData.map((point) => [point.lat, point.lon])}
                color="#3B82F6"
                weight={3}
              />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Graphique d'élévation */}
      {elevationChartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-border-base shadow-card mb-8">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Profil d'élévation</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={elevationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="index" stroke="#6B7280" hide />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                }}
                formatter={(value: any) => [`${value} m`, 'Altitude']}
              />
              <Line
                type="monotone"
                dataKey="elevation"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                fill="#10B981"
                fillOpacity={0.1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Zones de FC */}
      {hrZonesData && (
        <div className="bg-white p-6 rounded-lg border border-border-base shadow-card mb-8">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Analyse des zones FC</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Zone d'entraînement:</strong> {hrZonesData.currentZone.name} ({hrZonesData.currentZone.min}-{hrZonesData.currentZone.max} bpm)
            </p>
            <p className="text-sm text-blue-800 mt-1">
              FC moyenne: <strong>{activity.avgHeartRate} bpm</strong> | FC max: <strong>{activity.maxHeartRate} bpm</strong>
            </p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hrZonesData.zones}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="min" fill="#94A3B8" name="Min" />
              <Bar dataKey="max" fill="#3B82F6" name="Max" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Données supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cardio */}
        {(activity.avgHeartRate || activity.maxHeartRate) && (
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Cardio</h3>
            <div className="space-y-3">
              {activity.avgHeartRate && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">FC moyenne</span>
                  <span className="font-medium text-text-dark">{activity.avgHeartRate} bpm</span>
                </div>
              )}
              {activity.maxHeartRate && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">FC maximale</span>
                  <span className="font-medium text-text-dark">{activity.maxHeartRate} bpm</span>
                </div>
              )}
              {activity.trimp && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">TRIMP</span>
                  <span className="font-medium text-accent-500">{activity.trimp}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vitesse */}
        {(activity.avgSpeed || activity.maxSpeed) && (
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Vitesse</h3>
            <div className="space-y-3">
              {activity.avgSpeed && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vitesse moyenne</span>
                  <span className="font-medium text-text-dark">{formatSpeed(activity.avgSpeed)}</span>
                </div>
              )}
              {activity.maxSpeed && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vitesse maximale</span>
                  <span className="font-medium text-text-dark">{formatSpeed(activity.maxSpeed)}</span>
                </div>
              )}
              {activity.avgSpeed && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Allure moyenne</span>
                  <span className="font-medium text-text-dark">{formatPace(activity.avgSpeed)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Puissance */}
        {(activity.avgPower || activity.normalizedPower) && (
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Puissance</h3>
            <div className="space-y-3">
              {activity.avgPower && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Puissance moyenne</span>
                  <span className="font-medium text-text-dark">{activity.avgPower} W</span>
                </div>
              )}
              {activity.normalizedPower && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Puissance normalisée</span>
                  <span className="font-medium text-text-dark">{activity.normalizedPower} W</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Autres */}
        {(activity.avgCadence || activity.calories) && (
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Autres données</h3>
            <div className="space-y-3">
              {activity.avgCadence && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Cadence moyenne</span>
                  <span className="font-medium text-text-dark">{activity.avgCadence} rpm</span>
                </div>
              )}
              {activity.calories && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Calories</span>
                  <span className="font-medium text-text-dark">{activity.calories} kcal</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
