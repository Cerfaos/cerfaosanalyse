import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

interface HeartRateZone {
  zone: number
  name: string
  min: number
  max: number
  description: string
}

interface HeartRateZonesData {
  fcMax: number
  fcRepos: number
  fcReserve: number
  zones: HeartRateZone[]
}

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [hrZones, setHrZones] = useState<HeartRateZonesData | null>(null)

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    fcMax: user?.fcMax || '',
    fcRepos: user?.fcRepos || '',
    weightCurrent: user?.weightCurrent || '',
    theme: user?.theme || 'light',
  })

  // Charger les zones FC si disponibles
  useEffect(() => {
    if (user?.fcMax && user?.fcRepos) {
      loadHeartRateZones()
    }
  }, [user?.fcMax, user?.fcRepos])

  const loadHeartRateZones = async () => {
    try {
      const response = await api.get('/api/users/hr-zones')
      setHrZones(response.data.data)
    } catch (err) {
      console.error('Erreur chargement zones FC:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = {
        fullName: formData.fullName.trim() || null,
        fcMax: formData.fcMax && formData.fcMax !== '' ? Number(formData.fcMax) : null,
        fcRepos: formData.fcRepos && formData.fcRepos !== '' ? Number(formData.fcRepos) : null,
        weightCurrent: formData.weightCurrent && formData.weightCurrent !== '' ? Number(formData.weightCurrent) : null,
        theme: formData.theme,
      }

      console.log('Envoi du payload:', payload)

      const response = await api.patch('/api/users/profile', payload)
      const updatedUser = response.data.data

      console.log('Utilisateur mis à jour:', updatedUser)

      updateUser(updatedUser)
      setSuccess('Profil mis à jour avec succès !')

      // Recharger les zones FC si elles ont changé
      if (payload.fcMax || payload.fcRepos) {
        loadHeartRateZones()
      }
    } catch (err: any) {
      console.error('Erreur complète:', err)
      console.error('Réponse erreur:', err.response?.data)
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getZoneColor = (zone: number) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-300',
      'bg-green-100 text-green-700 border-green-300',
      'bg-yellow-100 text-yellow-700 border-yellow-300',
      'bg-orange-100 text-orange-700 border-orange-300',
      'bg-red-100 text-red-700 border-red-300',
    ]
    return colors[zone - 1] || colors[0]
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">Mon profil</h1>
        <p className="text-text-secondary">
          Configurez vos paramètres physiologiques pour des analyses précises
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">
              Informations personnelles
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text-body mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                  placeholder="Votre nom"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fcMax" className="block text-sm font-medium text-text-body mb-2">
                    FC maximale (bpm)
                  </label>
                  <input
                    type="number"
                    id="fcMax"
                    name="fcMax"
                    value={formData.fcMax}
                    onChange={handleChange}
                    min="100"
                    max="220"
                    className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                    placeholder="Ex: 185"
                  />
                  <p className="text-sm text-text-tertiary mt-1">Entre 100 et 220 bpm</p>
                </div>

                <div>
                  <label htmlFor="fcRepos" className="block text-sm font-medium text-text-body mb-2">
                    FC au repos (bpm)
                  </label>
                  <input
                    type="number"
                    id="fcRepos"
                    name="fcRepos"
                    value={formData.fcRepos}
                    onChange={handleChange}
                    min="30"
                    max="100"
                    className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                    placeholder="Ex: 50"
                  />
                  <p className="text-sm text-text-tertiary mt-1">Entre 30 et 100 bpm</p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="weightCurrent"
                  className="block text-sm font-medium text-text-body mb-2"
                >
                  Poids actuel (kg)
                </label>
                <input
                  type="number"
                  id="weightCurrent"
                  name="weightCurrent"
                  value={formData.weightCurrent}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  step="0.1"
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                  placeholder="Ex: 70.5"
                />
                <p className="text-sm text-text-tertiary mt-1">Entre 30 et 300 kg</p>
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-text-body mb-2">
                  Thème de l'interface
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-accent-500 text-white rounded-md hover:bg-accent-600 shadow-button hover:shadow-button-hover transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>

        {/* Informations compte */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Compte</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="text-text-dark font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">ID utilisateur</p>
                <p className="text-text-dark font-medium">#{user?.id}</p>
              </div>
            </div>
          </div>

          {hrZones && (
            <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Réserve cardiaque
              </h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-accent-500">{hrZones.fcReserve}</p>
                <p className="text-sm text-text-secondary mt-1">
                  bpm ({hrZones.fcMax} - {hrZones.fcRepos})
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zones de fréquence cardiaque */}
      {hrZones && (
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-text-dark mb-4">
              Zones de fréquence cardiaque (Karvonen)
            </h2>
            <p className="text-text-secondary mb-6">
              Vos zones d'entraînement calculées selon la méthode Karvonen
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {hrZones.zones.map((zone) => (
                <div
                  key={zone.zone}
                  className={`p-4 rounded-lg border-2 ${getZoneColor(zone.zone)}`}
                >
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold">Z{zone.zone}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">{zone.name}</h4>
                  <p className="text-2xl font-bold mb-1">
                    {zone.min}-{zone.max}
                  </p>
                  <p className="text-xs opacity-75">{zone.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>Astuce :</strong> Ces zones seront utilisées pour analyser vos
                activités et calculer le TRIMP (Training Impulse).
              </p>
            </div>
          </div>
        </div>
      )}

      {!hrZones && user?.fcMax && user?.fcRepos && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <p className="text-yellow-800">
            ⚠️ Impossible de calculer les zones FC. Vérifiez vos paramètres.
          </p>
        </div>
      )}

      {(!user?.fcMax || !user?.fcRepos) && (
        <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-md">
          <p className="text-blue-800">
            ℹ️ Configurez votre FC max et FC repos pour voir vos zones d'entraînement.
          </p>
        </div>
      )}
    </div>
  )
}
