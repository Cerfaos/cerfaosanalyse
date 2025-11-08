import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../services/api'

interface TrainingLoadData {
  date: string
  trimp: number
  ctl: number
  atl: number
  tsb: number
}

interface CurrentLoad {
  ctl: number
  atl: number
  tsb: number
  status: string
  recommendation: string
}

export default function TrainingLoad() {
  const [period, setPeriod] = useState('90')
  const [currentLoad, setCurrentLoad] = useState<CurrentLoad | null>(null)
  const [history, setHistory] = useState<TrainingLoadData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrainingLoad()
  }, [period])

  const fetchTrainingLoad = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/activities/training-load?days=${period}`)
      setCurrentLoad(response.data.data.current)
      setHistory(response.data.data.history)
    } catch (error) {
      console.error('Erreur lors du chargement de la charge d\'entraînement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'rested':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'optimal':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'tired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'overreached':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'Très Frais'
      case 'rested':
        return 'Reposé'
      case 'optimal':
        return 'Optimal'
      case 'tired':
        return 'Fatigué'
      case 'overreached':
        return 'Surentraîné'
      default:
        return 'Neutre'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Charge d'Entraînement</h1>
          <p className="mt-2 text-gray-600">
            Suivez votre forme (CTL), fatigue (ATL) et équilibre (TSB)
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['30', '60', '90', '180'].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {days} jours
              </button>
            ))}
          </div>
        </div>

        {/* Indicateurs actuels */}
        {currentLoad && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 mb-1">CTL - Forme</div>
              <div className="text-3xl font-bold text-blue-600">{currentLoad.ctl}</div>
              <div className="text-xs text-gray-500 mt-1">Charge chronique (42j)</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 mb-1">ATL - Fatigue</div>
              <div className="text-3xl font-bold text-orange-600">{currentLoad.atl}</div>
              <div className="text-xs text-gray-500 mt-1">Charge aiguë (7j)</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 mb-1">TSB - Équilibre</div>
              <div className={`text-3xl font-bold ${currentLoad.tsb > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentLoad.tsb > 0 ? '+' : ''}{currentLoad.tsb}
              </div>
              <div className="text-xs text-gray-500 mt-1">CTL - ATL</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500 mb-1">Statut</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(currentLoad.status)}`}>
                {getStatusLabel(currentLoad.status)}
              </div>
            </div>
          </div>
        )}

        {/* Recommandation */}
        {currentLoad && (
          <div className={`mb-8 p-6 rounded-lg border-l-4 ${getStatusColor(currentLoad.status)}`}>
            <h3 className="font-semibold mb-2">Recommandation</h3>
            <p>{currentLoad.recommendation}</p>
          </div>
        )}

        {/* Graphique de la charge d'entraînement */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Évolution CTL / ATL / TSB</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                formatter={(value: number) => [Math.round(value * 10) / 10, '']}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="ctl"
                stroke="#3B82F6"
                name="CTL (Forme)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="atl"
                stroke="#F59E0B"
                name="ATL (Fatigue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="tsb"
                stroke="#10B981"
                name="TSB (Équilibre)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique du TRIMP quotidien */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">TRIMP Quotidien</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                formatter={(value: number) => [value, 'TRIMP']}
              />
              <Line
                type="monotone"
                dataKey="trimp"
                stroke="#8B5CF6"
                name="TRIMP"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Légende explicative */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Comment interpréter ces données ?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>CTL (Chronic Training Load)</strong> : Votre forme générale. Plus c'est élevé, meilleure est votre condition physique. Se construit lentement sur 6 semaines.
            </p>
            <p>
              <strong>ATL (Acute Training Load)</strong> : Votre niveau de fatigue actuel. Reflète l'intensité de votre entraînement récent (7 derniers jours).
            </p>
            <p>
              <strong>TSB (Training Stress Balance)</strong> : L'équilibre entre forme et fatigue.
              • TSB positif = bien reposé, idéal pour une compétition
              • TSB proche de 0 = zone optimale pour progresser
              • TSB négatif = fatigue accumulée, attention au surentraînement
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
