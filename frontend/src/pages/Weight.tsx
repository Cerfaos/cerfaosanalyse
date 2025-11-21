import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'

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
  const formRef = useRef<HTMLDivElement>(null)
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
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement")
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
    if (trend === null) return 'text-text-muted'
    if (trend > 0) return 'text-error'
    if (trend < 0) return 'text-success'
    return 'text-text-muted'
  }

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        const weightInput = document.getElementById('weight')
        if (weightInput) weightInput.focus()
      }, 400)
    }
  }

  const actions = (
    <button onClick={scrollToForm} className="btn-primary font-display">
      Enregistrer une pesée
    </button>
  )

  if (loading) {
    return (
      <AppLayout title="Suivi du poids" description="Chargement des données" actions={actions}>
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Suivi du poids" description="Enregistrez vos pesées et suivez vos tendances" actions={actions}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Suivi"
          title="Suivi du poids"
          description="Enregistrez vos pesées et suivez vos tendances corporelles."
          icon="⚖️"
          gradient="from-[#5CE1E6] to-[#8BC34A]"
          accentColor="#5CE1E6"
        />

        {success && <div className="glass-panel border-success/30 text-success px-4 py-3">{success}</div>}
        {error && <div className="glass-panel border-error/30 text-error px-4 py-3">{error}</div>}

        {stats && stats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6">
              <p className="text-sm text-text-secondary mb-1">Poids actuel</p>
              <p className="text-3xl font-semibold text-brand">{stats.current ? `${stats.current} kg` : '-'}</p>
            </div>
            <div className="glass-panel p-6">
              <p className="text-sm text-text-secondary mb-1">Moyenne</p>
              <p className="text-3xl font-semibold text-text-dark">{stats.average ? `${stats.average} kg` : '-'}</p>
              <p className="text-xs text-text-muted mt-1">Min: {stats.min} kg · Max: {stats.max} kg</p>
            </div>
            <div className="glass-panel p-6">
              <p className="text-sm text-text-secondary mb-1">Tendance 30j</p>
              <p className={`text-3xl font-semibold ${getTrendColor(stats.trend30Days)}`}>{getTrendText(stats.trend30Days)}</p>
            </div>
            <div className="glass-panel p-6">
              <p className="text-sm text-text-secondary mb-1">Tendance 90j</p>
              <p className={`text-3xl font-semibold ${getTrendColor(stats.trend90Days)}`}>{getTrendText(stats.trend90Days)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div ref={formRef} className="lg:col-span-1" id="weight-form">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-6">Nouvelle pesée</h2>
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
                    className="w-full px-4 py-3 border border-border-base rounded-lg focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
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
                    className="w-full px-4 py-3 border border-border-base rounded-lg focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-text-body mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-border-base rounded-lg focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
                    placeholder="Comment vous sentez-vous ?"
                  ></textarea>
                </div>
              <button
                type="submit"
                disabled={formLoading}
                className="btn-primary w-full"
              >
                {formLoading ? 'Enregistrement...' : 'Ajouter la pesée'}
              </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-text-dark">Évolution</h2>
                  <p className="text-sm text-text-muted">Sur vos 30 dernières entrées</p>
                </div>
              </div>
              {weightHistories.length > 0 ? (
                <div className="h-64 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={260}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 25, 26, 0.95)',
                          border: '1px solid rgba(139, 195, 74, 0.3)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#5CE1E6' }}
                        formatter={(value: number) => [`${value} kg`, 'Poids']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line type="monotone" dataKey="poids" stroke="#5CE1E6" strokeWidth={3} dot={{ r: 3, fill: '#5CE1E6' }} activeDot={{ r: 6, fill: '#8BC34A' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-text-muted">Pas encore de données</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-text-dark mb-4">Historique des pesées</h2>
          <div className="glass-panel p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-base">
                <thead className="bg-bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Poids</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-bg-white divide-y divide-border-base">
                  {weightHistories.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">{entry.weight} kg</td>
                      <td className="px-6 py-4 text-sm text-text-body">{entry.notes || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDelete(entry.id)} className="text-error hover:text-error-dark">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
