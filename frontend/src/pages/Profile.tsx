import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api, { getAvatarUrl } from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { Section } from '../components/ui/Section'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || '')
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

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

  useEffect(() => {
    if (!avatarFile) {
      console.log('useEffect: Mise à jour avatarPreview avec user.avatarUrl =', user?.avatarUrl)
      setAvatarPreview(user?.avatarUrl || '')
    }
  }, [user?.avatarUrl, avatarFile])

  useEffect(() => {
    return () => {
      if (avatarObjectUrl) {
        URL.revokeObjectURL(avatarObjectUrl)
      }
    }
  }, [avatarObjectUrl])

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) {
        setAvatarError('Veuillez sélectionner un fichier image')
        return
      }
      setAvatarError('')
      if (avatarObjectUrl) {
        URL.revokeObjectURL(avatarObjectUrl)
      }
      const previewUrl = URL.createObjectURL(file)
      setAvatarObjectUrl(previewUrl)
      setAvatarFile(file)
      setAvatarPreview(previewUrl)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setAvatarError('Choisissez une image avant de télécharger')
      return
    }
    setAvatarUploading(true)
    setAvatarError('')
    try {
      const formDataAvatar = new FormData()
      formDataAvatar.append('avatar', avatarFile)
      const response = await api.post('/api/users/avatar', formDataAvatar, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const newAvatar =
        response.data?.data?.avatarUrl || response.data?.data?.avatar || response.data?.avatarUrl || ''
      console.log('Avatar uploadé:', newAvatar)
      if (newAvatar) {
        updateUser({ avatarUrl: newAvatar })
        console.log('User mis à jour avec avatarUrl:', newAvatar)
        setSuccess('Avatar mis à jour avec succès !')
        // Révoquer l'ancienne URL blob
        if (avatarObjectUrl) {
          URL.revokeObjectURL(avatarObjectUrl)
          setAvatarObjectUrl(null)
        }
        // Réinitialiser le fichier pour permettre au useEffect de synchroniser avatarPreview
        setAvatarFile(null)
      } else {
        setAvatarError('Impossible de récupérer la nouvelle image')
      }
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || err.message || 'Erreur lors du téléversement')
    } finally {
      setAvatarUploading(false)
    }
  }

  const getZoneColor = (zone: number) => {
    const colors = [
      // Zone 1 - Récupération : Bleu vif
      'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800/60 text-blue-900 dark:text-blue-100 border-blue-500 dark:border-blue-400',
      // Zone 2 - Endurance : Vert éclatant
      'bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/60 dark:to-emerald-800/60 text-green-900 dark:text-green-100 border-green-500 dark:border-green-400',
      // Zone 3 - Tempo : Jaune doré
      'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/60 dark:to-yellow-800/60 text-yellow-900 dark:text-yellow-100 border-yellow-500 dark:border-yellow-400',
      // Zone 4 - Seuil : Orange intense
      'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/60 dark:to-orange-800/60 text-orange-900 dark:text-orange-100 border-orange-500 dark:border-orange-400',
      // Zone 5 - Maximum : Rouge vif
      'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/60 dark:to-red-800/60 text-red-900 dark:text-red-100 border-red-500 dark:border-red-400',
    ]
    return colors[zone - 1] || colors[0]
  }

  return (
    <AppLayout title="Mon profil" description="Paramètres physiologiques et compte">
      <div className="max-w-4xl mx-auto space-y-8">
        <Section eyebrow="Profil" title="Vos informations" description="Configurez vos constantes pour des analyses précises" />

        {success && <div className="glass-panel border-success/30 text-success px-4 py-3">{success}</div>}
        {error && <div className="glass-panel border-error/30 text-error px-4 py-3">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Informations personnelles" className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Nom complet" htmlFor="fullName">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border-base bg-bg-white focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none"
                  placeholder="Votre nom"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="FC maximale (bpm)" htmlFor="fcMax" helper="Entre 100 et 220 bpm">
                  <input
                    type="number"
                    id="fcMax"
                    name="fcMax"
                    value={formData.fcMax}
                    onChange={handleChange}
                    min="100"
                    max="220"
                    className="w-full px-4 py-3 rounded-lg border border-border-base bg-bg-white focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none"
                    placeholder="Ex: 185"
                  />
                </FormField>

                <FormField label="FC au repos (bpm)" htmlFor="fcRepos" helper="Entre 30 et 100 bpm">
                  <input
                    type="number"
                    id="fcRepos"
                    name="fcRepos"
                    value={formData.fcRepos}
                    onChange={handleChange}
                    min="30"
                    max="100"
                    className="w-full px-4 py-3 rounded-lg border border-border-base bg-bg-white focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none"
                    placeholder="Ex: 50"
                  />
                </FormField>
              </div>

              <FormField label="Poids actuel (kg)" htmlFor="weightCurrent" helper="Entre 30 et 300 kg">
                <input
                  type="number"
                  id="weightCurrent"
                  name="weightCurrent"
                  value={formData.weightCurrent}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg border border-border-base bg-bg-white focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none"
                  placeholder="Ex: 70.5"
                />
              </FormField>

              <FormField label="Thème de l'interface" htmlFor="theme">
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border-base bg-bg-white focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                </select>
              </FormField>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full font-display"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card title="Photo de profil">
              <div className="space-y-5">
                <div className="flex flex-col items-center">
                  {avatarPreview ? (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-brand via-accent to-brand rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <img
                        src={avatarPreview.startsWith('blob:') ? avatarPreview : getAvatarUrl(avatarPreview)}
                        alt="Avatar utilisateur"
                        className="relative h-32 w-32 rounded-full border-4 border-white dark:border-dark-surface object-cover shadow-lg ring-4 ring-brand/20"
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-brand via-accent to-brand rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative h-32 w-32 rounded-full border-4 border-white dark:border-dark-surface bg-gradient-to-br from-brand/20 to-accent/20 flex items-center justify-center text-5xl font-bold text-brand shadow-lg ring-4 ring-brand/20">
                        {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-center text-text-secondary mt-3 max-w-xs">
                    Format recommandé: image carrée, 2 Mo max, JPG/PNG
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="form-control text-sm"
                  />
                  {avatarError && <p className="text-sm text-danger">{avatarError}</p>}
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={avatarUploading || !avatarFile}
                    className="btn-primary w-full font-display"
                  >
                    {avatarUploading ? 'Téléversement...' : "Mettre à jour l'avatar"}
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Compte">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-text-secondary">Email</p>
                  <p className="font-medium text-text-dark dark:text-dark-text-contrast">{user?.email}</p>
                </div>
                <div>
                  <p className="text-text-secondary">ID utilisateur</p>
                  <p className="font-medium text-text-dark dark:text-dark-text-contrast">#{user?.id}</p>
                </div>
              </div>
            </Card>

            {hrZones && (
              <Card title="Réserve cardiaque">
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand">{hrZones.fcReserve}</p>
                  <p className="text-sm text-text-secondary">
                    bpm ({hrZones.fcMax} - {hrZones.fcRepos})
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {hrZones && (
          <Card title="Zones de fréquence cardiaque (Karvonen)" description="Vos zones d'entraînement calculées via Karvonen">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {hrZones.zones.map((zone) => (
                <div
                  key={zone.zone}
                  className={`p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${getZoneColor(zone.zone)}`}
                >
                  <div className="text-center mb-2">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-black/20 text-xl font-bold">
                      {zone.zone}
                    </span>
                  </div>
                  <h4 className="font-semibold text-center text-sm mb-2">{zone.name}</h4>
                  <p className="text-2xl font-bold text-center mb-1 whitespace-nowrap">{zone.min}-{zone.max}</p>
                  <p className="text-xs text-center opacity-75 leading-snug">{zone.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 glass-panel p-4 border border-info">
              <p className="text-sm text-info-dark">
                💡 Ces zones alimentent les calculs TRIMP et les alertes de charge.
              </p>
            </div>
          </Card>
        )}

        {!hrZones && user?.fcMax && user?.fcRepos && (
          <Card>
            <p className="text-warning">
              ⚠️ Impossible de calculer les zones FC. Vérifiez vos paramètres.
            </p>
          </Card>
        )}

        {(!user?.fcMax || !user?.fcRepos) && (
          <Card>
            <p className="text-info-dark">
              ℹ️ Configurez votre FC max et FC repos pour voir vos zones d'entraînement.
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
