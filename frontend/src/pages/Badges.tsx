import { useState, useEffect } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'

interface Badge {
  id: number
  code: string
  name: string
  description: string
  icon: string
  category: 'distance' | 'activities' | 'elevation' | 'streak' | 'time' | 'special'
  level: number
  conditionType: string
  conditionValue: number | null
}

interface BadgeWithProgress {
  badge: Badge
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  currentValue: number | null
  targetValue: number | null
}

interface BadgesData {
  unlocked: BadgeWithProgress[]
  locked: BadgeWithProgress[]
  stats: {
    total: number
    unlocked: number
    locked: number
    percentageUnlocked: number
  }
}

const CATEGORIES = [
  { value: 'all', label: 'Tous', icon: '🏆' },
  { value: 'distance', label: 'Distance', icon: '📏' },
  { value: 'activities', label: 'Activités', icon: '🚴' },
  { value: 'elevation', label: 'Dénivelé', icon: '⛰️' },
  { value: 'streak', label: 'Régularité', icon: '🔥' },
  { value: 'time', label: 'Temps', icon: '⏱️' },
  { value: 'special', label: 'Spéciaux', icon: '⭐' },
]

export default function Badges() {
  const [badges, setBadges] = useState<BadgesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/badges')
      setBadges(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBadges = (badgeList: BadgeWithProgress[]) => {
    if (selectedCategory === 'all') return badgeList
    return badgeList.filter((b) => b.badge.category === selectedCategory)
  }

  const formatValue = (value: number | null, type: string): string => {
    if (value === null) return '?'

    switch (type) {
      case 'total_distance':
        return `${(value / 1000).toFixed(0)} km`
      case 'total_activities':
        return `${value} ${value > 1 ? 'activités' : 'activité'}`
      case 'total_elevation':
        return `${value.toFixed(0)} m`
      case 'consecutive_days':
        return `${value} ${value > 1 ? 'jours' : 'jour'}`
      case 'total_time':
        const hours = Math.floor(value / 3600)
        return `${hours}h`
      default:
        return String(value)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-accent'
    if (percentage >= 50) return 'bg-warning'
    if (percentage >= 25) return 'bg-info'
    return 'bg-text-muted dark:bg-dark-text-muted'
  }

  const getBadgeLevelColor = (level: number) => {
    if (level === 1) return 'border-amber-600 bg-amber-50 dark:bg-amber-900/20'
    if (level === 2) return 'border-gray-400 bg-gray-50 dark:bg-gray-800/20'
    if (level === 3) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    if (level === 4) return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
    if (level === 5) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    return 'border-red-500 bg-red-50 dark:bg-red-900/20'
  }

  if (loading) {
    return (
      <AppLayout title="Badges" description="Suivez vos accomplissements">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  if (!badges) {
    return (
      <AppLayout title="Badges" description="Suivez vos accomplissements">
        <div className="glass-panel p-6 text-center text-text-secondary">
          Erreur lors du chargement des badges
        </div>
      </AppLayout>
    )
  }

  const filteredUnlocked = filterBadges(badges.unlocked)
  const filteredLocked = filterBadges(badges.locked)

  return (
    <AppLayout title="Badges" description="Suivez vos accomplissements et débloquez de nouveaux défis">
      <div className="space-y-8">
        {/* Statistiques globales */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast mb-2 font-display">
                Vos badges
              </h2>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                {badges.stats.unlocked} sur {badges.stats.total} badges débloqués
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-bg-subtle dark:text-dark-bg-subtle"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - badges.stats.percentageUnlocked / 100)}`}
                    className="text-accent transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">
                    {badges.stats.percentageUnlocked}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres de catégories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all border-2 ${
                selectedCategory === category.value
                  ? 'bg-accent text-white border-accent shadow-md transform scale-105'
                  : 'bg-white dark:bg-dark-surface text-text-secondary dark:text-dark-text-secondary border-panel-border hover:bg-bg-subtle dark:hover:bg-dark-bg-subtle'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Badges débloqués */}
        {filteredUnlocked.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast mb-4 font-display flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              Badges débloqués ({filteredUnlocked.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUnlocked.map((item) => (
                <div
                  key={item.badge.id}
                  className={`glass-panel p-6 relative overflow-hidden border-2 ${getBadgeLevelColor(
                    item.badge.level
                  )}`}
                >
                  {/* Badge de niveau */}
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-success/90 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>

                  {/* Icône */}
                  <div className="flex justify-center mb-3">
                    <span className="text-5xl">{item.badge.icon}</span>
                  </div>

                  {/* Nom */}
                  <h4 className="text-lg font-semibold text-center text-text-dark dark:text-dark-text-contrast mb-2">
                    {item.badge.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary mb-3">
                    {item.badge.description}
                  </p>

                  {/* Date de déblocage */}
                  {item.unlockedAt && (
                    <p className="text-xs text-center text-text-muted dark:text-dark-text-muted">
                      Débloqué le{' '}
                      {new Date(item.unlockedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges à débloquer */}
        {filteredLocked.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast mb-4 font-display flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              À débloquer ({filteredLocked.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLocked.map((item) => (
                <div
                  key={item.badge.id}
                  className="glass-panel p-6 opacity-80 hover:opacity-100 transition-opacity"
                >
                  {/* Icône */}
                  <div className="flex justify-center mb-3 opacity-50">
                    <span className="text-5xl grayscale">{item.badge.icon}</span>
                  </div>

                  {/* Nom */}
                  <h4 className="text-lg font-semibold text-center text-text-dark dark:text-dark-text-contrast mb-2">
                    {item.badge.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary mb-4">
                    {item.badge.description}
                  </p>

                  {/* Barre de progression */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
                      <span>Progression</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-bg-subtle dark:bg-dark-bg-subtle rounded-full h-2 overflow-hidden border border-panel-border">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressColor(item.progress)}`}
                        style={{ width: `${Math.min(item.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Valeurs */}
                  {item.targetValue !== null && (
                    <p className="text-xs text-center text-text-muted dark:text-dark-text-muted">
                      {formatValue(item.currentValue, item.badge.conditionType)} /{' '}
                      {formatValue(item.targetValue, item.badge.conditionType)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun badge dans la catégorie */}
        {filteredUnlocked.length === 0 && filteredLocked.length === 0 && selectedCategory !== 'all' && (
          <div className="glass-panel p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-text-secondary dark:text-dark-text-secondary text-lg">
              Aucun badge dans cette catégorie
            </p>
          </div>
        )}

        {/* Message si aucun badge du tout */}
        {badges.stats.total === 0 && (
          <div className="glass-panel p-12 text-center">
            <span className="text-6xl mb-4 block">🏆</span>
            <p className="text-text-secondary dark:text-dark-text-secondary text-lg mb-4">
              Aucun badge disponible
            </p>
            <p className="text-text-muted dark:text-dark-text-muted">
              Commencez à enregistrer des activités pour débloquer vos premiers badges !
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
