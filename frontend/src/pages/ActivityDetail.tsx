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
          className="text-accent-500 hover:text-accent-600 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux activités
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">{activity.type}</h1>
            <p className="text-text-secondary">
              {new Date(activity.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          {activity.fileName && (
            <p className="text-sm text-text-tertiary">
              Fichier: {activity.fileName}
            </p>
          )}
        </div>
      </div>

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
