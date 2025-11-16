import { useState, useEffect } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import toast from 'react-hot-toast'

interface Goal {
  id: number
  userId: number
  type: 'distance' | 'duration' | 'trimp' | 'activities_count'
  targetValue: number
  currentValue: number
  period: 'weekly' | 'monthly' | 'yearly' | 'custom'
  startDate: string
  endDate: string
  title: string
  description: string | null
  isActive: boolean
  isCompleted: boolean
  percentage?: number
  createdAt: string
  updatedAt: string
}

interface NewGoal {
  type: 'distance' | 'duration' | 'trimp' | 'activities_count'
  targetValue: number
  period: 'weekly' | 'monthly' | 'yearly' | 'custom'
  startDate: string
  endDate: string
  title: string
  description: string
}

const GOAL_TYPES = [
  { value: 'distance', label: 'Distance', unit: 'km', icon: '📏' },
  { value: 'duration', label: 'Durée', unit: 'heures', icon: '⏱️' },
  { value: 'trimp', label: 'TRIMP', unit: 'points', icon: '💪' },
  { value: 'activities_count', label: 'Nombre d\'activités', unit: 'activités', icon: '🎯' },
]

const PERIODS = [
  { value: 'weekly', label: 'Hebdomadaire', icon: '📅' },
  { value: 'monthly', label: 'Mensuel', icon: '📆' },
  { value: 'yearly', label: 'Annuel', icon: '🗓️' },
  { value: 'custom', label: 'Personnalisé', icon: '🎯' },
]

// Fonction pour détecter l'icône d'activité depuis le titre
const getActivityIconFromTitle = (title: string): string | null => {
  const activityIcons: Record<string, string> = {
    cyclisme: '🚴',
    course: '🏃',
    marche: '🚶',
    natation: '🏊',
    rameur: '🚣',
    musculation: '💪',
    randonnée: '🥾',
    vtt: '🚵',
  }

  const lowerTitle = title.toLowerCase()
  for (const [activity, icon] of Object.entries(activityIcons)) {
    if (lowerTitle.includes(activity)) {
      return icon
    }
  }
  return null
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState<NewGoal>({
    type: 'distance',
    targetValue: 100,
    period: 'weekly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: '',
    description: '',
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/goals')
      setGoals(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error)
      toast.error('Erreur lors du chargement des objectifs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/goals', formData)
      toast.success('Objectif créé avec succès')
      setShowCreateModal(false)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création de l\'objectif')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGoal) return

    try {
      await api.patch(`/api/goals/${editingGoal.id}`, formData)
      toast.success('Objectif modifié avec succès')
      setEditingGoal(null)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error('Erreur lors de la modification de l\'objectif')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return

    try {
      await api.delete(`/api/goals/${id}`)
      toast.success('Objectif supprimé')
      fetchGoals()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async (goal: Goal) => {
    try {
      await api.patch(`/api/goals/${goal.id}`, { isActive: !goal.isActive })
      toast.success(goal.isActive ? 'Objectif désactivé' : 'Objectif activé')
      fetchGoals()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error('Erreur lors de la modification')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'distance',
      targetValue: 100,
      period: 'weekly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: '',
      description: '',
    })
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      type: goal.type,
      targetValue: goal.targetValue,
      period: goal.period,
      startDate: goal.startDate.split('T')[0],
      endDate: goal.endDate.split('T')[0],
      title: goal.title,
      description: goal.description || '',
    })
  }

  const formatValue = (value: number, type: string): string => {
    const goalType = GOAL_TYPES.find(t => t.value === type)
    if (!goalType) return value.toString()

    switch (type) {
      case 'distance':
        return `${(value / 1000).toFixed(0)} km`
      case 'duration':
        return `${Math.floor(value / 3600)} h`
      case 'trimp':
        return `${value.toFixed(0)} points`
      case 'activities_count':
        return `${value} ${value > 1 ? 'activités' : 'activité'}`
      default:
        return value.toString()
    }
  }

  const activeGoals = goals.filter(g => g.isActive && !g.isCompleted)
  const completedGoals = goals.filter(g => g.isCompleted)
  const inactiveGoals = goals.filter(g => !g.isActive && !g.isCompleted)

  if (loading) {
    return (
      <AppLayout title="Objectifs" description="Chargement des objectifs">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Objectifs" description="Définissez et suivez vos objectifs d'entraînement">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="glass-panel p-6 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                🎯
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand font-semibold mb-1">
                  Objectifs
                </p>
                <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
                  Mes Objectifs
                </h1>
                <p className="text-text-secondary dark:text-dark-text-secondary max-w-2xl">
                  Définissez et suivez vos objectifs d'entraînement pour atteindre vos ambitions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-brand to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel objectif
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Objectifs actifs</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 group-hover:scale-110 transition-transform duration-300 origin-left">
                  {activeGoals.length}
                </p>
              </div>
              <div className="text-4xl group-hover:animate-bounce">🎯</div>
            </div>
          </div>
          <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Complétés</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1 group-hover:scale-110 transition-transform duration-300 origin-left">
                  {completedGoals.length}
                </p>
              </div>
              <div className="text-4xl group-hover:animate-bounce">✅</div>
            </div>
          </div>
          <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total</p>
                <p className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast mt-1 group-hover:scale-110 transition-transform duration-300 origin-left">
                  {goals.length}
                </p>
              </div>
              <div className="text-4xl group-hover:animate-bounce">📊</div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Objectifs actifs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  formatValue={formatValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Objectifs complétés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  formatValue={formatValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Goals */}
        {inactiveGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Objectifs inactifs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inactiveGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  formatValue={formatValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="glass-panel p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-blue-500/5" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-32 translate-y-32 blur-3xl" />
            <div className="relative z-10">
              <div className="text-7xl mb-6 animate-bounce">🎯</div>
              <h3 className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast mb-3">
                Aucun objectif défini
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary mb-8 leading-relaxed max-w-md mx-auto">
                Commencez par créer votre premier objectif d'entraînement pour suivre vos progrès et atteindre vos ambitions sportives.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-brand to-blue-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg font-medium"
              >
                Créer un objectif
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingGoal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {editingGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                </h2>
                <form onSubmit={editingGoal ? handleUpdate : handleCreate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type d'objectif
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                      >
                        {GOAL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valeur cible
                      </label>
                      <input
                        type="number"
                        value={formData.targetValue}
                        onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                        required
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {GOAL_TYPES.find(t => t.value === formData.type)?.unit}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Période
                      </label>
                      <select
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                      >
                        {PERIODS.map((period) => (
                          <option key={period.value} value={period.value}>
                            {period.icon} {period.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date de début
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (optionnelle)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        setEditingGoal(null)
                        resetForm()
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingGoal ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onToggleActive,
  formatValue,
}: {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: number) => void
  onToggleActive: (goal: Goal) => void
  formatValue: (value: number, type: string) => string
}) {
  const goalType = GOAL_TYPES.find(t => t.value === goal.type)
  const period = PERIODS.find(p => p.value === goal.period)

  const percentage = goal.percentage || 0
  const isCompleted = goal.isCompleted
  const isActive = goal.isActive

  const getProgressColor = (pct: number, completed: boolean) => {
    if (completed) return 'from-green-500 to-emerald-600'
    if (pct >= 75) return 'from-green-500 to-emerald-600'
    if (pct >= 50) return 'from-yellow-500 to-amber-600'
    if (pct >= 25) return 'from-orange-500 to-red-600'
    return 'from-red-500 to-rose-600'
  }

  const getTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      'distance': 'from-blue-500 to-indigo-600',
      'duration': 'from-purple-500 to-violet-600',
      'trimp': 'from-orange-500 to-red-600',
      'activities_count': 'from-green-500 to-emerald-600',
    }
    return gradients[type] || 'from-gray-500 to-slate-600'
  }

  // Détecter l'icône d'activité depuis le titre
  const activityIcon = getActivityIconFromTitle(goal.title)
  const displayIcon = activityIcon || goalType?.icon

  return (
    <div className={`glass-panel p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${
      isCompleted ? 'ring-2 ring-green-500/50' : isActive ? 'ring-2 ring-blue-500/30' : 'opacity-75 hover:opacity-100'
    }`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getTypeGradient(goal.type)} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTypeGradient(goal.type)} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {displayIcon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-dark dark:text-dark-text-contrast">
                {goal.title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                {period?.icon} {period?.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => onToggleActive(goal)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {isActive ? '● Actif' : '○ Inactif'}
          </button>
        </div>

        {goal.description && (
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4 leading-relaxed">
            {goal.description}
          </p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary dark:text-dark-text-secondary font-medium">Progression</span>
            <span className="font-bold text-text-dark dark:text-dark-text-contrast">
              {formatValue(goal.currentValue, goal.type)} / {formatValue(goal.targetValue, goal.type)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-border/50 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full bg-gradient-to-r ${getProgressColor(percentage, isCompleted)} transition-all duration-700 ease-out relative`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-text-muted dark:text-dark-text-muted">
              {percentage >= 100 ? 'Objectif dépassé !' : percentage >= 75 ? 'Presque là !' : percentage >= 50 ? 'À mi-chemin' : 'En cours'}
            </span>
            <span className={`text-lg font-bold ${
              percentage >= 100 ? 'text-green-600 dark:text-green-400' :
              percentage >= 75 ? 'text-green-600 dark:text-green-400' :
              percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-orange-600 dark:text-orange-400'
            }`}>
              {percentage}%
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-text-muted dark:text-dark-text-muted mb-4 bg-black/5 dark:bg-white/5 rounded-lg p-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(goal.startDate).toLocaleDateString('fr-FR')}
          </span>
          <span>→</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {new Date(goal.endDate).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {isCompleted && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-center mb-4 font-medium flex items-center justify-center gap-2">
            <div className="text-2xl">🏆</div>
            Objectif atteint !
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(goal)}
            className="flex-1 px-4 py-2.5 bg-brand/10 text-brand hover:bg-brand/20 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="px-4 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
