import { useState, useEffect } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
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
  const [fatigue, setFatigue] = useState<FatigueAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([])
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [predictionForm, setPredictionForm] = useState({
    activityType: 'Cyclisme',
    targetDistance: 50,
  })
  const [predictingLoading, setPredictingLoading] = useState(false)

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

  if (loading) {
    return (
      <AppLayout title="Insights" description="Analyse intelligente de vos données">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement des analyses...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Insights" description="Analyse intelligente et prédictions basées sur vos données">
      <div className="space-y-8">
        {/* En-tête */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              🧠
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-purple-600 font-semibold mb-1">
                Intelligence
              </p>
              <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
                Insights & Prédictions
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary max-w-2xl">
                Analyses personnalisées basées sur vos données d'entraînement pour optimiser vos performances.
              </p>
            </div>
          </div>
        </div>

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
            {suggestions.map((suggestion, index) => (
              <div key={index} className="glass-panel p-5 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyConfig(suggestion.difficulty).color}`}>
                    {getDifficultyConfig(suggestion.difficulty).label}
                  </span>
                  <span className="text-xs text-text-muted">{suggestion.confidence}% confiance</span>
                </div>

                <div className="mb-3">
                  <div className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">
                    {suggestion.target} <span className="text-lg">{suggestion.unit}</span>
                  </div>
                  <div className="text-sm text-text-secondary">par {suggestion.timeframe}</div>
                </div>

                <div className="text-xs text-text-muted border-t border-border-base/30 pt-3">
                  {suggestion.basedOn}
                </div>

                <button className="w-full mt-3 px-3 py-2 text-sm bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors">
                  Créer cet objectif
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppLayout>
  )
}
