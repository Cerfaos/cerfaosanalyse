import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'

interface FatigueAnalysis {
  status: string
  riskLevel: number
  indicators: string[]
  recommendations: string[]
  ctlTrend: number
  atlTrend: number
  tsbTrend: number
}

interface GoalSuggestion {
  type: string
  target: number
  unit: string
  timeframe: string
  difficulty: string
  basedOn: string
  confidence: number
}

interface PerformancePrediction {
  predictedTime: number
  predictedTimeFormatted: string
  predictedAvgSpeed: number
  predictedAvgHR: number
  predictedTrimp: number
  confidence: number
  basedOn: number
}

export default function Insights() {
  const navigate = useNavigate()
  const [fatigue, setFatigue] = useState<FatigueAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([])
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [predictionForm, setPredictionForm] = useState({
    activityType: 'Cyclisme',
    targetDistance: 50,
  })
  const [predictingLoading, setPredictingLoading] = useState(false)
  const [creatingGoal, setCreatingGoal] = useState<number | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [fatigueRes, suggestionsRes] = await Promise.all([
        api.get('/api/analytics/fatigue'),
        api.get('/api/analytics/suggest-goals'),
      ])

      setFatigue(fatigueRes.data.data)
      setSuggestions(suggestionsRes.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrediction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setPredictingLoading(true)
      const response = await api.post('/api/analytics/predict-performance', predictionForm)
      setPrediction(response.data.data)
    } catch (error: any) {
      console.error('Erreur de prédiction:', error)
      alert(error.response?.data?.message || 'Erreur lors de la prédiction')
    } finally {
      setPredictingLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: string }> = {
      fresh: {
        label: 'Très frais',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '💪',
      },
      normal: {
        label: 'Normal',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: '👍',
      },
      tired: {
        label: 'Fatigué',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '😓',
      },
      overreached: {
        label: 'Surentraîné',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '⚠️',
      },
      critical: {
        label: 'Critique',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '🚨',
      },
    }
    return configs[status] || configs.normal
  }

  const getDifficultyConfig = (difficulty: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      easy: { label: 'Facile', color: 'bg-green-100 text-green-700' },
      moderate: { label: 'Modéré', color: 'bg-blue-100 text-blue-700' },
      challenging: { label: 'Challengeant', color: 'bg-orange-100 text-orange-700' },
      ambitious: { label: 'Ambitieux', color: 'bg-red-100 text-red-700' },
    }
    return configs[difficulty] || configs.moderate
  }

  const parseGoalType = (type: string) => {
    // Extraire le type d'activité et le type d'objectif
    let activityType = ''
    let goalTypeLabel = ''
    let icon = '🎯'

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

    if (type.includes('_distance')) {
      activityType = type.replace('_distance', '')
      goalTypeLabel = 'Distance'
      icon = activityIcons[activityType] || '📏'
    } else if (type.includes('_longest')) {
      activityType = type.replace('_longest', '')
      goalTypeLabel = 'Plus longue sortie'
      icon = activityIcons[activityType] || '🏆'
    } else if (type.includes('_frequency')) {
      activityType = type.replace('_frequency', '')
      goalTypeLabel = 'Fréquence'
      icon = activityIcons[activityType] || '📅'
    } else if (type.includes('trimp')) {
      goalTypeLabel = 'Charge TRIMP'
      icon = '💪'
    } else if (type === 'activities_count') {
      goalTypeLabel = 'Nombre d\'activités'
      icon = '📊'
    }

    const activityLabel = activityType
      ? activityType.charAt(0).toUpperCase() + activityType.slice(1)
      : ''

    return { activityType: activityLabel, goalTypeLabel, icon }
  }

  const createGoalFromSuggestion = async (suggestion: GoalSuggestion, index: number) => {
    try {
      setCreatingGoal(index)

      // Extraire le type d'objectif depuis le type de suggestion
      // Les types peuvent être: cyclisme_distance, course_frequency, weekly_trimp, etc.
      // Types valides dans la DB: distance, duration, trimp, activities_count
      let goalType = 'distance'
      let activityType = ''

      if (suggestion.type.includes('_distance') || suggestion.type.includes('_longest')) {
        goalType = 'distance'
        activityType = suggestion.type.replace('_distance', '').replace('_longest', '')
      } else if (suggestion.type.includes('_frequency')) {
        goalType = 'activities_count'
        activityType = suggestion.type.replace('_frequency', '')
      } else if (suggestion.type.includes('trimp')) {
        goalType = 'trimp'
      } else if (suggestion.type === 'activities_count') {
        goalType = 'activities_count'
      }

      // Valider que target est un nombre valide
      const targetValue = Number(suggestion.target)
      if (isNaN(targetValue) || targetValue <= 0 || !isFinite(targetValue)) {
        alert('La valeur cible de cet objectif est invalide. Veuillez réessayer ou choisir un autre objectif.')
        return
      }

      // Calculer la date de fin basée sur le timeframe
      // Périodes valides dans la DB: weekly, monthly, yearly, custom
      const startDate = new Date()
      const endDate = new Date()
      let period = 'monthly'

      if (suggestion.timeframe === 'semaine') {
        endDate.setDate(endDate.getDate() + 7)
        period = 'weekly'
      } else if (suggestion.timeframe === 'mois') {
        endDate.setMonth(endDate.getMonth() + 1)
        period = 'monthly'
      } else if (suggestion.timeframe.includes('trimestre')) {
        endDate.setMonth(endDate.getMonth() + 3)
        period = 'custom' // trimestre = custom avec dates spécifiques
      } else {
        endDate.setMonth(endDate.getMonth() + 1) // Par défaut 1 mois
        period = 'monthly'
      }

      // Créer un titre lisible
      const activityLabel = activityType ? activityType.charAt(0).toUpperCase() + activityType.slice(1) : ''
      const goalLabel = goalType === 'distance' ? 'Distance' : goalType === 'activities_count' ? 'Activités' : 'TRIMP'
      const title = activityLabel
        ? `${goalLabel} ${activityLabel} - ${targetValue} ${suggestion.unit}`
        : `${goalLabel} - ${targetValue} ${suggestion.unit}`

      const goalData = {
        type: goalType,
        targetValue: targetValue,
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        title,
        description: `Objectif suggéré automatiquement : ${suggestion.basedOn}`,
      }

      await api.post('/api/goals', goalData)

      // Rediriger vers la page des objectifs
      navigate('/goals')
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'objectif:', error)
      alert(error.response?.data?.message || 'Erreur lors de la création de l\'objectif')
    } finally {
      setCreatingGoal(null)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Analyses" description="Analyse intelligente de vos données">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement des analyses...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Analyses" description="Analyse intelligente et prédictions basées sur vos données">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Intelligence"
          title="Analyses & Prédictions"
          description="Analyses personnalisées basées sur vos données d'entraînement pour optimiser vos performances."
          icon="🧠"
          gradient="from-[#5CE1E6] to-[#8BC34A]"
          accentColor="#5CE1E6"
        />

        {/* Analyse de fatigue */}
        {fatigue && (
          <Section title="État de forme" icon="❤️">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="glass-panel p-6 h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{getStatusConfig(fatigue.status).icon}</div>
                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${getStatusConfig(fatigue.status).color}`}
                    >
                      {getStatusConfig(fatigue.status).label}
                    </span>
                    <div className="mt-4">
                      <div className="text-sm text-text-muted mb-1">Niveau de risque</div>
                      <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            fatigue.riskLevel >= 80
                              ? 'bg-red-500'
                              : fatigue.riskLevel >= 60
                                ? 'bg-orange-500'
                                : fatigue.riskLevel >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                          }`}
                          style={{ width: `${fatigue.riskLevel}%` }}
                        />
                      </div>
                      <div className="text-xs text-text-muted mt-1">{fatigue.riskLevel}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="glass-panel p-6 h-full">
                  <h3 className="font-semibold mb-3">Indicateurs détectés</h3>
                  {fatigue.indicators.length > 0 ? (
                    <ul className="space-y-2 mb-4">
                      {fatigue.indicators.map((indicator, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-orange-500">⚡</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-muted mb-4">Aucun indicateur de fatigue détecté</p>
                  )}

                  <h3 className="font-semibold mb-3">Recommandations</h3>
                  <ul className="space-y-2">
                    {fatigue.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-brand">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Prédiction de performance */}
        <Section title="Prédiction de performance" icon="🎯">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <form onSubmit={handlePrediction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type d'activité</label>
                  <select
                    value={predictionForm.activityType}
                    onChange={(e) => setPredictionForm({ ...predictionForm, activityType: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-brand/30"
                  >
                    <option value="Cyclisme">Cyclisme</option>
                    <option value="Course">Course à pied</option>
                    <option value="Natation">Natation</option>
                    <option value="Marche">Marche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Distance cible (km)</label>
                  <input
                    type="number"
                    value={predictionForm.targetDistance}
                    onChange={(e) =>
                      setPredictionForm({ ...predictionForm, targetDistance: parseFloat(e.target.value) })
                    }
                    min="1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-brand/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={predictingLoading}
                  className="w-full btn-primary"
                >
                  {predictingLoading ? 'Calcul en cours...' : 'Prédire ma performance'}
                </button>
              </form>
            </div>

            {prediction && (
              <div className="glass-panel p-6">
                <h3 className="font-semibold mb-4">Résultats de la prédiction</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Temps prédit</span>
                    <span className="text-xl font-bold text-brand">{prediction.predictedTimeFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Vitesse moyenne</span>
                    <span className="font-semibold">{prediction.predictedAvgSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">FC moyenne prédite</span>
                    <span className="font-semibold">{prediction.predictedAvgHR} bpm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">TRIMP estimé</span>
                    <span className="font-semibold">{prediction.predictedTrimp} pts</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-base/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Confiance</span>
                      <span className="font-medium">{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full bg-brand transition-all"
                        style={{ width: `${prediction.confidence}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      Basé sur {prediction.basedOn} activités similaires
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Suggestions d'objectifs */}
        <Section title="Objectifs suggérés" icon="🎯">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => {
              const { activityType, goalTypeLabel, icon } = parseGoalType(suggestion.type)
              return (
                <div key={index} className="glass-panel p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-text-dark dark:text-dark-text-contrast">
                          {activityType || goalTypeLabel}
                        </div>
                        {activityType && (
                          <div className="text-xs text-text-muted">{goalTypeLabel}</div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyConfig(suggestion.difficulty).color}`}>
                      {getDifficultyConfig(suggestion.difficulty).label}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">
                      {suggestion.target} <span className="text-lg">{suggestion.unit}</span>
                    </div>
                    <div className="text-sm text-text-secondary">par {suggestion.timeframe}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-muted border-t border-border-base/30 pt-3">
                    <span>{suggestion.basedOn}</span>
                    <span className="font-medium">{suggestion.confidence}%</span>
                  </div>

                  <button
                    onClick={() => createGoalFromSuggestion(suggestion, index)}
                    disabled={creatingGoal === index}
                    className="w-full mt-3 px-3 py-2 text-sm bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingGoal === index ? 'Création...' : 'Créer cet objectif'}
                  </button>
                </div>
              )
            })}
          </div>
        </Section>
      </div>
    </AppLayout>
  )
}
