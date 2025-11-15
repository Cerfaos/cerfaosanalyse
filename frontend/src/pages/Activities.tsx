import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { Section } from '../components/ui/Section'
import { Card } from '../components/ui/Card'

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  description: string
  icon: string
  clouds: number
  visibility: number
}

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
  weather: string | null
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
  const [selectedGpxFile, setSelectedGpxFile] = useState<File | null>(null)
  const [manualGpxFile, setManualGpxFile] = useState<File | null>(null)
  const [filterType, setFilterType] = useState('')
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload')
  const [manualFormData, setManualFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
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

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-border-base bg-bg-white/90 focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none transition'
  const compactInputClass = 'w-full px-3 py-2 rounded-xl border border-border-base bg-bg-white/90 focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none text-center transition'
  const labelClass = 'block text-sm font-medium text-text-body mb-2'
  const primaryActionClass = 'btn-primary w-full font-display'

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

      // Ajouter le fichier GPX s'il est présent
      if (selectedGpxFile) {
        formData.append('gpxFile', selectedGpxFile)
      }

      await api.post('/api/activities/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Activité importée avec succès !')
      setSelectedFile(null)
      setSelectedGpxFile(null)

      // Reset file inputs
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      const gpxInput = document.getElementById('gpx-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      if (gpxInput) gpxInput.value = ''

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

      const formData = new FormData()
      formData.append('date', manualFormData.date)
      formData.append('type', manualFormData.type)
      formData.append('duration', duration.toString())
      formData.append('distance', distance.toString())

      // Ajouter les champs optionnels seulement s'ils sont remplis
      if (manualFormData.avgHeartRate) formData.append('avgHeartRate', manualFormData.avgHeartRate)
      if (manualFormData.maxHeartRate) formData.append('maxHeartRate', manualFormData.maxHeartRate)
      if (manualFormData.avgSpeed) formData.append('avgSpeed', manualFormData.avgSpeed)
      if (manualFormData.maxSpeed) formData.append('maxSpeed', manualFormData.maxSpeed)
      if (manualFormData.elevationGain) formData.append('elevationGain', manualFormData.elevationGain)
      if (manualFormData.calories) formData.append('calories', manualFormData.calories)
      if (manualFormData.avgCadence) formData.append('avgCadence', manualFormData.avgCadence)
      if (manualFormData.avgPower) formData.append('avgPower', manualFormData.avgPower)
      if (manualFormData.normalizedPower) formData.append('normalizedPower', manualFormData.normalizedPower)

      // Ajouter le fichier GPX s'il est présent
      if (manualGpxFile) {
        formData.append('gpxFile', manualGpxFile)
      }

      await api.post('/api/activities/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

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
      setManualGpxFile(null)

      // Reset file input
      const fileInput = document.getElementById('manual-gpx-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Recharger les données
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'activité")
    } finally {
      setUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.round(seconds)
    let hours = Math.floor(totalSeconds / 3600)
    let minutes = Math.floor((totalSeconds % 3600) / 60)
    let secs = totalSeconds % 60

    if (secs === 60) {
      secs = 0
      minutes += 1
    }

    if (minutes === 60) {
      minutes = 0
      hours += 1
    }

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min ${secs
        .toString()
        .padStart(2, '0')}s`
    }
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }

  const periodLabel = () => {
    switch (period) {
      case '7':
        return '7 derniers jours'
      case '30':
        return '30 derniers jours'
      case '90':
        return '90 derniers jours'
      case '365':
        return 'Cette année'
      default:
        return ''
    }
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
      case 'Marche':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M12 3v18m0-18l-3 3m3-3l3 3" />
          </svg>
        )
      case 'Rameur':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )
      case 'Randonnée':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l7 18m0 0l7-18M12 21V3" />
          </svg>
        )
      case 'Natation':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5" />
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

  const actions = (
    <button onClick={scrollToForm} className="btn-primary font-display">
      Nouvelle importation
    </button>
  )

  return (
    <AppLayout title="Activités" description="Importez vos fichiers et suivez vos stats" actions={actions}>
      <div className="space-y-8">
        <Section eyebrow="Activités" title="Suivi des sorties" description="Importez vos fichiers ou ajoutez vos entraînements manuellement." />

        {success && (
          <div className="glass-panel border-success/30 text-success px-4 py-3">
            {success}
          </div>
        )}

        {error && (
          <div className="glass-panel border-error/30 text-error px-4 py-3">
            {error}
          </div>
        )}

        {stats && stats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Activités" description={periodLabel()}>
              <p className="text-3xl font-bold text-brand">{stats.count}</p>
              <p className="text-xs text-text-muted">Moyenne: {stats.avgDistance ? formatDistance(stats.avgDistance) : '-'} par sortie</p>
            </Card>
            <Card title="Distance totale">
              <p className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast">{formatDistance(stats.totalDistance)}</p>
              <p className="text-xs text-text-muted">Moyenne: {formatDistance(stats.avgDistance)}</p>
            </Card>
            <Card title="Temps total">
              <p className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-text-muted">Moyenne: {formatDuration(stats.avgDuration)}</p>
            </Card>
            <Card title="TRIMP total">
              <p className="text-3xl font-bold text-brand">{stats.totalTrimp}</p>
              <p className="text-xs text-text-muted">Moyenne: {stats.avgTrimp} / activité</p>
            </Card>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={formRef} className="lg:col-span-1" id="import-form">
          <Card title="Nouvelle activité">

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 rounded-2xl px-4 py-3 text-lg font-semibold font-display border-4 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-panel-bg text-text-primary border-panel-border shadow-xl'
                    : 'text-text-secondary border-dashed border-panel-border hover:bg-panel-bg/30'
                }`}
              >
                Importer un fichier
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 rounded-2xl px-4 py-3 text-lg font-semibold font-display border-4 transition-all ${
                  activeTab === 'manual'
                    ? 'bg-panel-bg text-text-primary border-panel-border shadow-xl'
                    : 'text-text-secondary border-dashed border-panel-border hover:bg-panel-bg/30'
                }`}
              >
                Créer manuellement
              </button>
            </div>

            {/* Upload Form */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className={labelClass}>
                    Fichier FIT/CSV *
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".fit,.csv"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-3 border border-border-base rounded-xl bg-bg-white/90 focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
                  />
                  <p className="text-sm text-text-muted mt-2">📊 Fichier contenant les métriques (durée, FC, puissance...)</p>
                </div>

                {selectedFile && (
                  <div className="glass-panel p-3 border border-accent">
                    <p className="text-sm text-text-body">
                      Fichier métrique: <strong>{selectedFile.name}</strong>
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Taille: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="gpx-upload" className={labelClass}>
                    Fichier GPX (optionnel)
                  </label>
                  <input
                    type="file"
                    id="gpx-upload"
                    accept=".gpx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedGpxFile(e.target.files[0])
                      }
                    }}
                    className="w-full px-4 py-3 border border-border-base rounded-xl bg-bg-white/90 focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
                  />
                  <p className="text-sm text-text-muted mt-2">📍 Fichier pour la trace GPS complète</p>
                </div>

                {selectedGpxFile && (
                  <div className="glass-panel p-3 border border-success/40 bg-success-light/60">
                    <p className="text-sm text-success">
                      ✓ Fichier GPS: <strong>{selectedGpxFile.name}</strong>
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Taille: {(selectedGpxFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className={primaryActionClass}
                >
                  {uploading ? 'Import en cours...' : 'Importer'}
                </button>

                <div className="glass-panel p-4 border border-info bg-info-light/60">
                  <p className="text-sm text-info-dark">
                    <strong>💡 Import en 2 étapes :</strong>
                  </p>
                  <ul className="text-sm text-info-dark mt-2 space-y-1 list-disc list-inside">
                    <li>Le fichier FIT/CSV fournit les métriques (durée, FC, puissance, etc.)</li>
                    <li>Le fichier GPX (optionnel) fournit la trace GPS complète</li>
                    <li>Le TRIMP est calculé automatiquement si FC disponible</li>
                  </ul>
                </div>
              </form>
            )}

            {/* Manual Form */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="manual-date" className={labelClass}>
                      Date et heure *
                    </label>
                    <input
                      type="datetime-local"
                      id="manual-date"
                      value={manualFormData.date}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, date: e.target.value })
                      }
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="manual-type" className={labelClass}>
                      Type d'activité *
                    </label>
                    <select
                      id="manual-type"
                      value={manualFormData.type}
                      onChange={(e) =>
                        setManualFormData({ ...manualFormData, type: e.target.value })
                      }
                      required
                      className={inputClass}
                    >
                      <option value="Cyclisme">Cyclisme</option>
                      <option value="Course">Course</option>
                      <option value="Marche">Marche</option>
                      <option value="Rameur">Rameur</option>
                      <option value="Randonnée">Randonnée</option>
                      <option value="Natation">Natation</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Entraînement">Entraînement</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Durée *</label>
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
                          className={compactInputClass}
                        />
                        <p className="text-xs text-text-muted text-center mt-1">Heures</p>
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
                          className={compactInputClass}
                        />
                        <p className="text-xs text-text-muted text-center mt-1">Minutes</p>
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
                          className={compactInputClass}
                        />
                        <p className="text-xs text-text-muted text-center mt-1">Secondes</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="manual-distance" className={labelClass}>
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
                      className={inputClass}
                    />
                  </div>

                  {/* Champs avancés (FC, Dénivelé, Calories) - seulement pour Cyclisme et Course */}
                  {(manualFormData.type === 'Cyclisme' || manualFormData.type === 'Course') && (
                    <>
                      <div>
                        <label htmlFor="manual-avgHR" className={labelClass}>
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
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-maxHR" className={labelClass}>
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
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-elevation" className={labelClass}>
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
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-calories" className={labelClass}>
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
                          className={inputClass}
                        />
                      </div>
                    </>
                  )}

                  {/* Champ Calories uniquement pour Rameur et Marche */}
                  {(manualFormData.type === 'Rameur' || manualFormData.type === 'Marche') && (
                    <div>
                      <label htmlFor="manual-calories" className={labelClass}>
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
                        className={inputClass}
                      />
                    </div>
                  )}

                  {/* Champs spécifiques au Cyclisme et Course */}
                  {(manualFormData.type === 'Cyclisme' || manualFormData.type === 'Course') && (
                    <>
                      <div>
                        <label htmlFor="manual-avgSpeed" className={labelClass}>
                          Vitesse moyenne (km/h)
                        </label>
                        <input
                          type="number"
                          id="manual-avgSpeed"
                          step="0.1"
                          min="0"
                          placeholder="km/h"
                          value={manualFormData.avgSpeed}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, avgSpeed: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-maxSpeed" className={labelClass}>
                          Vitesse max (km/h)
                        </label>
                        <input
                          type="number"
                          id="manual-maxSpeed"
                          step="0.1"
                          min="0"
                          placeholder="km/h"
                          value={manualFormData.maxSpeed}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, maxSpeed: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-avgCadence" className={labelClass}>
                          Cadence moyenne (rpm/spm)
                        </label>
                        <input
                          type="number"
                          id="manual-avgCadence"
                          min="0"
                          placeholder="rpm/spm"
                          value={manualFormData.avgCadence}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, avgCadence: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-avgPower" className={labelClass}>
                          Puissance moyenne (W)
                        </label>
                        <input
                          type="number"
                          id="manual-avgPower"
                          min="0"
                          placeholder="watts"
                          value={manualFormData.avgPower}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, avgPower: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="manual-normalizedPower" className={labelClass}>
                          Puissance normalisée (W)
                        </label>
                        <input
                          type="number"
                          id="manual-normalizedPower"
                          min="0"
                          placeholder="watts"
                          value={manualFormData.normalizedPower}
                          onChange={(e) =>
                            setManualFormData({ ...manualFormData, normalizedPower: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <label htmlFor="manual-gpx-file" className={labelClass}>
                      Fichier GPX (optionnel)
                    </label>
                    <input
                      type="file"
                      id="manual-gpx-file"
                      accept=".gpx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setManualGpxFile(e.target.files[0])
                        }
                      }}
                      className={inputClass}
                    />
                    <p className="text-sm text-text-muted mt-2">
                      📍 Si vous fournissez un fichier GPX, la distance, la durée et le dénivelé seront extraits automatiquement du fichier et remplaceront les valeurs saisies manuellement. Le fichier permet aussi d'obtenir la météo exacte de votre localisation.
                    </p>
                    {manualGpxFile && (
                      <div className="glass-panel border border-success/40 bg-success-light/60 p-3 rounded-xl mt-2">
                        <p className="text-sm text-success">
                          ✓ Fichier sélectionné: <strong>{manualGpxFile.name}</strong>
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          Les données GPS (distance, durée, dénivelé) du fichier seront utilisées en priorité
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={primaryActionClass}
                >
                  {uploading ? 'Création en cours...' : 'Créer l\'activité'}
                </button>

                <div className="glass-panel p-4 border border-info bg-info-light/60">
                  <p className="text-sm text-info-dark">
                    <strong>💡 Astuce :</strong> Le TRIMP sera calculé automatiquement si vous
                    renseignez la FC moyenne et que votre profil est configuré.
                  </p>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Liste et filtres */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtres */}
          <div className="glass-panel p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="period" className="block text-sm font-medium text-text-body mb-2">
                  Période
                </label>
                <select
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-border-base rounded-xl focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                  className="w-full px-4 py-2 border border-border-base rounded-xl focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
                >
                  <option value="">Tous les types</option>
                  <option value="Cyclisme">Cyclisme</option>
                  <option value="Course">Course</option>
                  <option value="Rameur">Rameur</option>
                  <option value="Marche">Marche</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="glass-panel p-6">
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
                            {' à '}
                            {new Date(activity.date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
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
                        <div>
                          <p className="text-text-tertiary">Météo</p>
                          {activity.weather && (() => {
                            try {
                              const weather: WeatherData = JSON.parse(activity.weather)
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <img
                                      src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                                      alt={weather.description}
                                      className="w-6 h-6"
                                    />
                                    <p className="font-medium text-text-dark">
                                      {Math.round(weather.temperature)}°C
                                    </p>
                                  </div>
                                  <p className="text-xs text-text-tertiary capitalize">
                                    {weather.description}
                                  </p>
                                  <p className="text-xs text-text-tertiary">
                                    💨 {weather.windSpeed} km/h ({weather.windDirection}°)
                                  </p>
                                </div>
                              )
                            } catch (e) {
                              return <p className="font-medium text-text-dark">-</p>
                            }
                          })() || <p className="font-medium text-text-dark">-</p>}
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
    </AppLayout>
  )
}
