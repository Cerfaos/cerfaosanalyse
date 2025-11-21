import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import MetricInfo from '../components/ui/MetricInfo'

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
      console.error("Erreur lors du chargement de la charge d'entraînement:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const periodOptions: { value: string; label: string; color: string; colorDark: string }[] = [
    { value: '30', label: '30 jours', color: 'bg-blue-100 border-blue-400 text-blue-800', colorDark: 'dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-200' },
    { value: '60', label: '60 jours', color: 'bg-green-100 border-green-400 text-green-800', colorDark: 'dark:bg-green-950/40 dark:border-green-600 dark:text-green-200' },
    { value: '90', label: '90 jours', color: 'bg-orange-100 border-orange-400 text-orange-800', colorDark: 'dark:bg-orange-950/40 dark:border-orange-600 dark:text-orange-200' },
    { value: '180', label: '180 jours', color: 'bg-purple-100 border-purple-400 text-purple-800', colorDark: 'dark:bg-purple-950/40 dark:border-purple-600 dark:text-purple-200' },
  ]

  const statusMap: Record<string, { label: string; color: string }> = {
    fresh: { label: 'Très frais', color: 'bg-success/10 text-success border-success/30' },
    rested: { label: 'Reposé', color: 'bg-brand/10 text-brand border-brand/30' },
    optimal: { label: 'Optimal', color: 'bg-accent/10 text-text-dark border-accent/30' },
    tired: { label: 'Fatigué', color: 'bg-warning/10 text-warning border-warning/30' },
    overreached: { label: 'Surentraîné', color: 'bg-error/10 text-error border-error/30' },
  }

  if (loading) {
    return (
      <AppLayout title="Charge d'entraînement" description="Suivi CTL / ATL / TSB">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Charge d'entraînement" description="Comprenez votre forme et votre fatigue">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Performance"
          title="Charge d'entraînement"
          description="Analysez votre CTL (forme), ATL (fatigue) et TSB (équilibre) pour optimiser votre entraînement."
          icon="📈"
          gradient="from-[#8BC34A] to-[#FF5252]"
          accentColor="#8BC34A"
        />

        <div className="flex flex-wrap gap-3">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all border ${
                period === option.value
                  ? 'bg-[#8BC34A] text-white border-[#8BC34A] shadow-md'
                  : 'bg-[#0A191A]/60 text-gray-400 border-[#8BC34A]/20 hover:border-[#8BC34A]/40 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {currentLoad && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard label="CTL - Forme" value={currentLoad.ctl.toString()} helper="Charge chronique (42 j)" metric="ctl" />
              <MetricCard label="ATL - Fatigue" value={currentLoad.atl.toString()} helper="Charge aiguë (7 j)" metric="atl" />
              <MetricCard
                label="TSB - Équilibre"
                value={`${currentLoad.tsb > 0 ? '+' : ''}${currentLoad.tsb}`}
                helper="CTL - ATL"
                accent={currentLoad.tsb > 0 ? 'text-success' : 'text-error'}
                metric="tsb"
              />
              <div className="glass-panel p-5 border">
                <p className="text-sm text-text-muted mb-2">Statut</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusMap[currentLoad.status]?.color || 'bg-bg-gray-100'}`}>
                  {statusMap[currentLoad.status]?.label || 'Neutre'}
                </span>
              </div>
            </div>

            <div className="glass-panel p-6 border">
              <h3 className="text-lg font-semibold mb-2">Recommandation</h3>
              <p className="text-text-secondary">{currentLoad.recommendation}</p>
            </div>
          </>
        )}

        <div className="glass-panel p-6 border">
          <h3 className="text-lg font-semibold text-white mb-4">Évolution CTL / ATL / TSB</h3>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={320}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 25, 26, 0.95)',
                    border: '1px solid rgba(139, 195, 74, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
                  itemStyle={{ color: '#9CA3AF' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <ReferenceLine y={0} stroke="#8BC34A" strokeDasharray="3 3" strokeOpacity={0.5} />
                <Line type="monotone" dataKey="ctl" stroke="#5CE1E6" name="CTL (Forme)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="atl" stroke="#FF5252" name="ATL (Fatigue)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="tsb" stroke="#8BC34A" name="TSB (Équilibre)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function MetricCard({ label, value, helper, accent, metric }: { label: string; value: string; helper?: string; accent?: string; metric?: string }) {
  return (
    <div className="glass-panel p-5 border">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-text-muted">{label}</p>
        {metric && <MetricInfo metric={metric} />}
      </div>
      <p className={`text-3xl font-semibold ${accent || 'text-text-dark dark:text-dark-text-contrast'}`}>{value}</p>
      {helper && <p className="text-xs text-text-muted mt-1">{helper}</p>}
    </div>
  )
}
