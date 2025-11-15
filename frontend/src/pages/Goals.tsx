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
  { value: 'activities_count', label: 'Nombre d\'activités', unit: 'activités', icon: '🚴' },
]

const PERIODS = [
  { value: 'weekly', label: 'Hebdomadaire', icon: '📅' },
  { value: 'monthly', label: 'Mensuel', icon: '📆' },
  { value: 'yearly', label: 'Annuel', icon: '🗓️' },
  { value: 'custom', label: 'Personnalisé', icon: '🎯' },
]

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎯 Mes Objectifs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Définissez et suivez vos objectifs d'entraînement
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nouvel objectif
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Objectifs actifs</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {activeGoals.length}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complétés</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {completedGoals.length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {goals.length}
                </p>
              </div>
              <div className="text-4xl">📊</div>
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun objectif défini
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez par créer votre premier objectif d'entraînement
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un objectif
            </button>
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

  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg p-6 border ${
      isCompleted ? 'border-green-500' : isActive ? 'border-blue-500' : 'border-gray-200 dark:border-dark-border'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{goalType?.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {period?.icon} {period?.label}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(goal)}
            className={`px-3 py-1 rounded-lg text-sm ${
              isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isActive ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {goal.description}
        </p>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progression</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatValue(goal.currentValue, goal.type)} / {formatValue(goal.targetValue, goal.type)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-bg rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="text-right text-sm font-medium text-gray-900 dark:text-white mt-1">
          {percentage}%
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span>
          Du {new Date(goal.startDate).toLocaleDateString()}
        </span>
        <span>
          au {new Date(goal.endDate).toLocaleDateString()}
        </span>
      </div>

      {isCompleted && (
        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-center mb-4">
          ✅ Objectif atteint !
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(goal)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
