import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface PersonalRecord {
  id: number
  recordType: string
  recordTypeName: string
  activityType: string
  value: number
  unit: string
  achievedAt: string
  previousValue: number | null
  previousAchievedAt: string | null
  activityId: number
  activityDate: string
  improvement?: number | null
}

interface RecordsData {
  [activityType: string]: PersonalRecord[]
}

interface RecordStats {
  totalRecords: number
  recentRecords: number
  byActivityType: Record<string, number>
}

const ACTIVITY_TYPES = [
  { value: 'all', label: 'Tous', icon: '🏆' },
  { value: 'Cyclisme', label: 'Cyclisme', icon: '🚴' },
  { value: 'Course', label: 'Course', icon: '🏃' },
  { value: 'Marche', label: 'Marche', icon: '🚶' },
  { value: 'Natation', label: 'Natation', icon: '🏊' },
  { value: 'Randonnée', label: 'Randonnée', icon: '🥾' },
]

const RECORD_TYPE_ICONS: Record<string, string> = {
  max_distance: '📏',
  max_avg_speed: '⚡',
  max_speed: '🚀',
  max_trimp: '💪',
  max_elevation: '⛰️',
  longest_duration: '⏱️',
  max_avg_heart_rate: '❤️',
  max_calories: '🔥',
}

const RECORD_TYPE_COLORS: Record<string, string> = {
  max_distance: 'from-blue-500 to-blue-600',
  max_avg_speed: 'from-yellow-500 to-orange-500',
  max_speed: 'from-red-500 to-pink-500',
  max_trimp: 'from-purple-500 to-indigo-500',
  max_elevation: 'from-green-500 to-emerald-500',
  longest_duration: 'from-cyan-500 to-blue-500',
  max_avg_heart_rate: 'from-rose-500 to-red-500',
  max_calories: 'from-orange-500 to-red-500',
}

export default function Records() {
  const [records, setRecords] = useState<RecordsData | null>(null)
  const [recentRecords, setRecentRecords] = useState<PersonalRecord[]>([])
  const [stats, setStats] = useState<RecordStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [recalculating, setRecalculating] = useState(false)
  const [showRecalculateConfirm, setShowRecalculateConfirm] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const [recordsRes, recentRes, statsRes] = await Promise.all([
        api.get('/api/records'),
        api.get('/api/records/recent?days=30'),
        api.get('/api/records/stats'),
      ])
      setRecords(recordsRes.data.data)
      setRecentRecords(recentRes.data.data)
      setStats(statsRes.data.data)
    } catch (error) {
      // Erreur gérée par toast
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateClick = () => {
    setShowRecalculateConfirm(true)
  }

  const handleRecalculateConfirm = async () => {
    setShowRecalculateConfirm(false)
    try {
      setRecalculating(true)
      await api.get('/api/records/recalculate')
      await fetchRecords()
    } catch {
      // Erreur silencieuse
    } finally {
      setRecalculating(false)
    }
  }

  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'km':
        return `${value.toFixed(2)} km`
      case 'km/h':
        return `${value.toFixed(1)} km/h`
      case 'm':
        return `${Math.round(value)} m`
      case 'min':
        const hours = Math.floor(value / 60)
        const mins = Math.round(value % 60)
        return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`
      case 'bpm':
        return `${Math.round(value)} bpm`
      case 'kcal':
        return `${Math.round(value)} kcal`
      case 'points':
        return `${Math.round(value)} pts`
      default:
        return `${value} ${unit}`
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatImprovement = (improvement: number | null | undefined): string => {
    if (improvement === null || improvement === undefined) return ''
    const sign = improvement > 0 ? '+' : ''
    return `${sign}${improvement.toFixed(1)}%`
  }

  const getFilteredRecords = (): RecordsData => {
    if (!records) return {}
    if (selectedType === 'all') return records
    return { [selectedType]: records[selectedType] || [] }
  }

  if (loading) {
    return (
      <AppLayout title="Records Personnels" description="Vos meilleures performances">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  if (!records || !stats) {
    return (
      <AppLayout title="Records Personnels" description="Vos meilleures performances">
        <div className="glass-panel p-6 text-center text-text-secondary">
          Erreur lors du chargement des records
        </div>
      </AppLayout>
    )
  }

  const filteredRecords = getFilteredRecords()

  return (
    <AppLayout title="Records Personnels" description="Vos meilleures performances par discipline">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Records"
          title="Records Personnels"
          description="Suivez vos meilleures performances et battez vos propres records."
          icon="records"
          gradient="from-[#FFAB40] to-[#FF5252]"
          accentColor="#FFAB40"
          actions={
            <button
              onClick={handleRecalculateClick}
              disabled={recalculating}
              className="px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors disabled:opacity-50"
            >
              {recalculating ? 'Recalcul...' : 'Recalculer'}
            </button>
          }
        />

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-[#8BC34A] mb-1">{stats.totalRecords}</div>
            <div className="text-sm text-gray-400">
              Records actuels
            </div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-[#5CE1E6] mb-1">{stats.recentRecords}</div>
            <div className="text-sm text-gray-400">
              Battus ce mois
            </div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-[#FFAB40] mb-1">
              {Object.keys(stats.byActivityType).length}
            </div>
            <div className="text-sm text-gray-400">
              Types d'activités
            </div>
          </div>
        </div>

        {/* Records récents */}
        {recentRecords.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span>🔥</span> Records récents (30 derniers jours)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentRecords.slice(0, 6).map((record) => (
                <Link
                  key={record.id}
                  to={`/activities/${record.activityId}`}
                  className="glass-panel p-4 hover:shadow-lg transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {RECORD_TYPE_ICONS[record.recordType] || '🏅'}
                    </span>
                    {record.improvement && (
                      <span className="text-sm font-bold text-[#8BC34A]">
                        {formatImprovement(record.improvement)}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-white">
                    {record.recordTypeName}
                  </div>
                  <div className="text-lg font-bold text-[#8BC34A]">
                    {formatValue(record.value, record.unit)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {record.activityType} - {formatDate(record.achievedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filtres par type d'activité */}
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all border ${
                selectedType === type.value
                  ? 'bg-[#8BC34A] text-white border-[#8BC34A] shadow-md transform scale-105'
                  : 'bg-[#0A191A]/60 text-gray-400 border-[#8BC34A]/20 hover:border-[#8BC34A]/40 hover:text-white'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Records par type d'activité */}
        {Object.entries(filteredRecords).map(([activityType, activityRecords]) => (
          <div key={activityType} className="space-y-4">
            <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast flex items-center gap-2">
              <span className="text-2xl">
                {ACTIVITY_TYPES.find((t) => t.value === activityType)?.icon || '🏅'}
              </span>
              {activityType}
              <span className="text-sm text-text-muted dark:text-dark-text-muted font-normal">
                ({activityRecords.length} records)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activityRecords.map((record) => (
                <Link
                  key={record.id}
                  to={`/activities/${record.activityId}`}
                  className="glass-panel p-6 relative overflow-hidden group hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      RECORD_TYPE_COLORS[record.recordType] || 'from-gray-500 to-gray-600'
                    } opacity-5 group-hover:opacity-10 transition-opacity`}
                  />

                  {/* Badge nouveau record */}
                  {record.previousValue && (
                    <div className="absolute top-2 right-2 bg-success text-white text-xs px-2 py-1 rounded-full font-bold">
                      PR
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Icône */}
                    <div className="flex justify-center mb-3">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                          RECORD_TYPE_COLORS[record.recordType] || 'from-gray-500 to-gray-600'
                        } flex items-center justify-center text-3xl shadow-lg`}
                      >
                        {RECORD_TYPE_ICONS[record.recordType] || '🏅'}
                      </div>
                    </div>

                    {/* Nom du record */}
                    <h4 className="text-center font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                      {record.recordTypeName}
                    </h4>

                    {/* Valeur actuelle */}
                    <div className="text-center text-2xl font-bold text-brand mb-2">
                      {formatValue(record.value, record.unit)}
                    </div>

                    {/* Amélioration */}
                    {record.previousValue && (
                      <div className="text-center text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
                        <span className="text-text-muted dark:text-dark-text-muted">
                          Précédent:{' '}
                        </span>
                        <span className="line-through">
                          {formatValue(record.previousValue, record.unit)}
                        </span>
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-center text-xs text-text-muted dark:text-dark-text-muted">
                      {formatDate(record.achievedAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Message si aucun record */}
        {Object.keys(filteredRecords).length === 0 && (
          <div className="glass-panel p-12 text-center">
            <span className="text-6xl mb-4 block">🏋️</span>
            <p className="text-text-secondary dark:text-dark-text-secondary text-lg mb-4">
              {selectedType === 'all'
                ? 'Aucun record personnel enregistré'
                : `Aucun record pour ${selectedType}`}
            </p>
            <p className="text-text-muted dark:text-dark-text-muted">
              Importez des activités pour commencer à suivre vos records personnels !
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showRecalculateConfirm}
        onClose={() => setShowRecalculateConfirm(false)}
        onConfirm={handleRecalculateConfirm}
        title="Recalculer les records"
        message="Recalculer tous vos records ? Cette opération peut prendre du temps."
        confirmLabel="Recalculer"
        variant="warning"
      />
    </AppLayout>
  )
}
