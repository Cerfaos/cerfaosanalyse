import { useState, useEffect } from 'react'
import api from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeightEntry {
  id: number
  date: string
  weight: number
  notes: string | null
  createdAt: string
}

interface WeightStats {
  count: number
  min: number | null
  max: number | null
  average: number | null
  current: number | null
  trend30Days: number | null
  trend90Days: number | null
  firstDate: string | null
  lastDate: string | null
}

export default function Weight() {
  const [weightHistories, setWeightHistories] = useState<WeightEntry[]>([])
  const [stats, setStats] = useState<WeightStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [historiesRes, statsRes] = await Promise.all([
        api.get('/api/weight-histories'),
        api.get('/api/weight-histories/stats'),
      ])

      setWeightHistories(historiesRes.data.data.data || [])
      setStats(statsRes.data.data)
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setError('Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFormLoading(true)

    try {
      await api.post('/api/weight-histories', {
        date: formData.date,
        weight: Number(formData.weight),
        notes: formData.notes || null,
      })

      setSuccess('Pesée enregistrée avec succès !')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        notes: '',
      })

      // Recharger les données
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette pesée ?')) return

    try {
      await api.delete(`/api/weight-histories/${id}`)
      setSuccess('Pesée supprimée')
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const chartData = weightHistories
    .slice()
    .reverse()
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }),
      poids: w.weight,
    }))

  const getTrendText = (trend: number | null) => {
    if (trend === null) return 'Pas assez de données'
    if (trend > 0) return `+${trend.toFixed(1)} kg`
    if (trend < 0) return `${trend.toFixed(1)} kg`
    return 'Stable'
  }

  const getTrendColor = (trend: number | null) => {
    if (trend === null) return 'text-text-tertiary'
    if (trend > 0) return 'text-red-600'
    if (trend < 0) return 'text-green-600'
    return 'text-text-tertiary'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">Suivi du poids</h1>
        <p className="text-text-secondary">
          Enregistrez vos pesées et suivez votre évolution
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

      {/* Statistiques */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Poids actuel</p>
            <p className="text-3xl font-bold text-accent-500">
              {stats.current ? `${stats.current} kg` : '-'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Moyenne</p>
            <p className="text-3xl font-bold text-text-dark">
              {stats.average ? `${stats.average} kg` : '-'}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Min: {stats.min} kg · Max: {stats.max} kg
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Tendance 30j</p>
            <p className={`text-3xl font-bold ${getTrendColor(stats.trend30Days)}`}>
              {getTrendText(stats.trend30Days)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <p className="text-sm text-text-secondary mb-1">Tendance 90j</p>
            <p className={`text-3xl font-bold ${getTrendColor(stats.trend90Days)}`}>
              {getTrendText(stats.trend90Days)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">
              Nouvelle pesée
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-body mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-text-body mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Ex: 70.5"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-body mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Commentaires..."
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-6 py-3 bg-accent-500 text-white rounded-md hover:bg-accent-600 shadow-button hover:shadow-button-hover transition-all font-medium disabled:opacity-50"
              >
                {formLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>

        {/* Graphique et liste */}
        <div className="lg:col-span-2 space-y-6">
          {/* Graphique */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
              <h2 className="text-xl font-semibold text-text-dark mb-6">
                Évolution du poids
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="poids"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Liste */}
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">Historique</h2>

            {loading ? (
              <p className="text-center text-text-secondary py-8">Chargement...</p>
            ) : weightHistories.length === 0 ? (
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
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
                <p className="text-text-secondary">Aucune pesée enregistrée</p>
                <p className="text-sm text-text-tertiary mt-2">
                  Ajoutez votre première pesée pour commencer le suivi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {weightHistories.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 border border-border-base rounded-md hover:bg-bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-text-dark text-lg">
                          {entry.weight} kg
                        </p>
                        <p className="text-sm text-text-secondary">
                          {new Date(entry.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-text-tertiary mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-2"
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
  )
}
