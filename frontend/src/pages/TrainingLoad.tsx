import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import MetricInfo from '../components/ui/MetricInfo'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

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
  const [showExplanation, setShowExplanation] = useState(false)

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

  const periodOptions: { value: string; label: string }[] = [
    { value: '30', label: '30 jours' },
    { value: '60', label: '60 jours' },
    { value: '90', label: '90 jours' },
    { value: '180', label: '180 jours' },
  ]

  const statusMap: Record<string, { label: string; color: string; emoji: string; advice: string }> = {
    fresh: {
      label: 'Très frais',
      color: 'bg-success/10 text-success border-success/30',
      emoji: '💪',
      advice: 'Idéal pour une compétition ou un effort maximal. Attention à ne pas rester trop longtemps dans cet état au risque de perdre en forme.'
    },
    rested: {
      label: 'Reposé',
      color: 'bg-brand/10 text-brand border-brand/30',
      emoji: '😊',
      advice: 'Bon équilibre. Vous pouvez augmenter progressivement la charge ou maintenir ce niveau.'
    },
    optimal: {
      label: 'Optimal',
      color: 'bg-accent/10 text-text-dark border-accent/30',
      emoji: '🎯',
      advice: 'Zone idéale pour progresser ! Continuez ainsi en alternant efforts et récupération.'
    },
    tired: {
      label: 'Fatigué',
      color: 'bg-warning/10 text-warning border-warning/30',
      emoji: '😓',
      advice: 'Privilégiez la récupération active (sorties légères Z1-Z2) ou le repos complet.'
    },
    overreached: {
      label: 'Surentraîné',
      color: 'bg-error/10 text-error border-error/30',
      emoji: '🚨',
      advice: 'Risque de blessure ou de surmenage ! Repos impératif pendant plusieurs jours.'
    },
  }

  // Calcul de la position du TSB sur l'échelle (-40 à +40)
  const getTsbPosition = (tsb: number) => {
    const clampedTsb = Math.max(-40, Math.min(40, tsb))
    return ((clampedTsb + 40) / 80) * 100
  }

  // Zones TSB pour l'échelle visuelle
  const tsbZones = [
    { min: -40, max: -30, label: 'Critique', color: 'bg-red-500', textColor: 'text-red-400' },
    { min: -30, max: -10, label: 'Fatigué', color: 'bg-orange-500', textColor: 'text-orange-400' },
    { min: -10, max: 5, label: 'Optimal', color: 'bg-green-500', textColor: 'text-green-400' },
    { min: 5, max: 25, label: 'Reposé', color: 'bg-blue-500', textColor: 'text-blue-400' },
    { min: 25, max: 40, label: 'Très frais', color: 'bg-cyan-500', textColor: 'text-cyan-400' },
  ]

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
          description="Le modèle PMC (Performance Management Chart) analyse l'équilibre entre votre forme physique et votre fatigue pour optimiser votre entraînement."
          icon="📈"
          gradient="from-[#8BC34A] to-[#FF5252]"
          accentColor="#8BC34A"
        />

        {/* Section explicative dépliable */}
        <div className="glass-panel border overflow-hidden">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <h3 className="font-semibold text-text-dark dark:text-dark-text-contrast">Comprendre le modèle PMC</h3>
                <p className="text-sm text-text-muted">Comment interpréter CTL, ATL et TSB ?</p>
              </div>
            </div>
            <span className={`text-xl transition-transform ${showExplanation ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showExplanation && (
            <div className="p-6 pt-2 border-t border-border-base/30 space-y-6">
              {/* TRIMP */}
              <div className="space-y-2">
                <h4 className="font-semibold text-brand flex items-center gap-2">
                  <span>⚡</span> TRIMP (Training Impulse)
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Le <strong>TRIMP</strong> mesure la charge de chaque séance en combinant la <strong>durée</strong> et l'<strong>intensité cardiaque</strong>.
                  Plus vous vous entraînez longtemps et intensément, plus le TRIMP est élevé. C'est la "monnaie" qui alimente les calculs de CTL et ATL.
                </p>
                <div className="text-xs text-text-muted bg-bg-base/50 dark:bg-dark-bg-base/50 p-2 rounded font-mono">
                  TRIMP = Durée (min) × Intensité relative × Coefficient de zone
                </div>
              </div>

              {/* CTL */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#5CE1E6] flex items-center gap-2">
                  <span>📈</span> CTL - Chronic Training Load (Forme)
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  La <strong>CTL</strong> représente votre <strong>forme physique à long terme</strong>. C'est une moyenne mobile exponentielle
                  de vos TRIMP sur <strong>42 jours</strong>. Elle reflète les adaptations physiologiques de votre corps à l'entraînement.
                </p>
                <ul className="text-sm text-text-secondary list-disc list-inside space-y-1 ml-2">
                  <li><strong>CTL qui monte</strong> : vous progressez, votre forme s'améliore</li>
                  <li><strong>CTL stable</strong> : vous maintenez votre niveau actuel</li>
                  <li><strong>CTL qui descend</strong> : désentraînement, vous perdez en forme</li>
                </ul>
                <div className="text-xs text-text-muted bg-bg-base/50 dark:bg-dark-bg-base/50 p-2 rounded">
                  💡 <strong>Conseil</strong> : Augmentez votre CTL de 3 à 7 points par semaine maximum pour progresser sans risque de blessure.
                </div>
              </div>

              {/* ATL */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#FF5252] flex items-center gap-2">
                  <span>🔥</span> ATL - Acute Training Load (Fatigue)
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  L'<strong>ATL</strong> représente votre <strong>fatigue récente</strong>. C'est une moyenne mobile exponentielle
                  de vos TRIMP sur <strong>7 jours</strong>. Elle monte rapidement après des efforts intenses et descend avec le repos.
                </p>
                <ul className="text-sm text-text-secondary list-disc list-inside space-y-1 ml-2">
                  <li><strong>ATL élevée</strong> : vous accumulez de la fatigue</li>
                  <li><strong>ATL basse</strong> : vous êtes reposé</li>
                  <li><strong>ATL &gt; CTL</strong> : attention, vous vous fatiguez plus vite que vous ne progressez !</li>
                </ul>
              </div>

              {/* TSB */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#8BC34A] flex items-center gap-2">
                  <span>⚖️</span> TSB - Training Stress Balance (Équilibre)
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Le <strong>TSB</strong> (= CTL - ATL) est l'indicateur clé. Il mesure l'<strong>équilibre entre votre forme et votre fatigue</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                    <div className="font-semibold text-green-400 text-sm">TSB Positif (+)</div>
                    <p className="text-xs text-text-secondary mt-1">
                      Vous êtes plus en forme que fatigué. Idéal avant une compétition ou pour un gros effort.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
                    <div className="font-semibold text-red-400 text-sm">TSB Négatif (-)</div>
                    <p className="text-xs text-text-secondary mt-1">
                      Votre fatigue dépasse votre forme. Normal en période d'entraînement, mais attention au surentraînement !
                    </p>
                  </div>
                </div>
              </div>

              {/* Tableau des zones TSB */}
              <div className="space-y-2">
                <h4 className="font-semibold text-text-dark dark:text-dark-text-contrast flex items-center gap-2">
                  <span>🎯</span> Zones d'interprétation du TSB
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-base/30">
                        <th className="text-left py-2 text-text-muted font-medium">Plage TSB</th>
                        <th className="text-left py-2 text-text-muted font-medium">État</th>
                        <th className="text-left py-2 text-text-muted font-medium">Signification</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border-base/20">
                        <td className="py-2 font-mono text-cyan-400">&gt; +25</td>
                        <td className="py-2">💪 Très frais</td>
                        <td className="py-2">Pic de forme, prêt pour la compétition. Risque de perte de forme si trop long.</td>
                      </tr>
                      <tr className="border-b border-border-base/20">
                        <td className="py-2 font-mono text-blue-400">+5 à +25</td>
                        <td className="py-2">😊 Reposé</td>
                        <td className="py-2">Bon état de fraîcheur. Idéal pour des efforts importants.</td>
                      </tr>
                      <tr className="border-b border-border-base/20 bg-green-500/5">
                        <td className="py-2 font-mono text-green-400">-10 à +5</td>
                        <td className="py-2">🎯 Optimal</td>
                        <td className="py-2"><strong>Zone idéale pour progresser</strong>. Léger déséquilibre productif.</td>
                      </tr>
                      <tr className="border-b border-border-base/20">
                        <td className="py-2 font-mono text-orange-400">-30 à -10</td>
                        <td className="py-2">😓 Fatigué</td>
                        <td className="py-2">Fatigue accumulée. Récupération active conseillée.</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-red-400">&lt; -30</td>
                        <td className="py-2">🚨 Critique</td>
                        <td className="py-2">Risque de surentraînement/blessure. Repos obligatoire !</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Période :</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionnez une période" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentLoad && (
          <>
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-5 border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#5CE1E6]"></span>
                    CTL - Forme
                  </p>
                  <MetricInfo metric="ctl" />
                </div>
                <p className="text-3xl font-semibold text-[#5CE1E6]">{currentLoad.ctl}</p>
                <p className="text-xs text-text-muted mt-1">Charge chronique sur 42 jours</p>
                <div className="mt-3 pt-3 border-t border-border-base/30">
                  <p className="text-xs text-text-secondary">
                    {currentLoad.ctl < 30 && "Niveau débutant. Augmentez progressivement."}
                    {currentLoad.ctl >= 30 && currentLoad.ctl < 60 && "Niveau intermédiaire. Bonne base d'endurance."}
                    {currentLoad.ctl >= 60 && currentLoad.ctl < 100 && "Niveau avancé. Forme solide !"}
                    {currentLoad.ctl >= 100 && "Niveau expert. Excellente condition physique."}
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5252]"></span>
                    ATL - Fatigue
                  </p>
                  <MetricInfo metric="atl" />
                </div>
                <p className="text-3xl font-semibold text-[#FF5252]">{currentLoad.atl}</p>
                <p className="text-xs text-text-muted mt-1">Charge aiguë sur 7 jours</p>
                <div className="mt-3 pt-3 border-t border-border-base/30">
                  <p className="text-xs text-text-secondary">
                    {currentLoad.atl <= currentLoad.ctl * 0.8 && "Fatigue basse. Marge pour intensifier."}
                    {currentLoad.atl > currentLoad.ctl * 0.8 && currentLoad.atl <= currentLoad.ctl * 1.2 && "Fatigue modérée. Bon équilibre charge/récup."}
                    {currentLoad.atl > currentLoad.ctl * 1.2 && "Fatigue élevée. Pensez à récupérer."}
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#8BC34A]"></span>
                    TSB - Équilibre
                  </p>
                  <MetricInfo metric="tsb" />
                </div>
                <p className={`text-3xl font-semibold ${currentLoad.tsb > 0 ? 'text-success' : currentLoad.tsb < -20 ? 'text-error' : 'text-warning'}`}>
                  {currentLoad.tsb > 0 ? '+' : ''}{currentLoad.tsb}
                </p>
                <p className="text-xs text-text-muted mt-1">CTL - ATL = Fraîcheur</p>
              </div>
            </div>

            {/* Échelle visuelle TSB */}
            <div className="glass-panel p-6 border">
              <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-4 flex items-center gap-2">
                <span>⚖️</span> Votre équilibre actuel
              </h3>

              {/* Barre de progression TSB */}
              <div className="relative mb-6">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {tsbZones.map((zone, i) => (
                    <div
                      key={i}
                      className={`${zone.color} opacity-60`}
                      style={{ width: `${((zone.max - zone.min) / 80) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Marqueur de position */}
                <div
                  className="absolute top-0 h-8 w-1 bg-white shadow-lg transition-all duration-500"
                  style={{ left: `${getTsbPosition(currentLoad.tsb)}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                    {currentLoad.tsb > 0 ? '+' : ''}{currentLoad.tsb}
                  </div>
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-2 text-xs text-text-muted">
                  <span>-40</span>
                  <span>-20</span>
                  <span>0</span>
                  <span>+20</span>
                  <span>+40</span>
                </div>
              </div>

              {/* Légende des zones */}
              <div className="flex flex-wrap gap-3 justify-center">
                {tsbZones.map((zone, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-3 h-3 rounded-full ${zone.color}`}></span>
                    <span className={zone.textColor}>{zone.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statut et recommandation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>{statusMap[currentLoad.status]?.emoji || '📊'}</span>
                  Votre statut actuel
                </h3>
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${statusMap[currentLoad.status]?.color || 'bg-bg-gray-100'}`}>
                  {statusMap[currentLoad.status]?.label || 'Neutre'}
                </span>
                <p className="text-sm text-text-secondary mt-4">
                  {statusMap[currentLoad.status]?.advice || currentLoad.recommendation}
                </p>
              </div>

              <div className="glass-panel p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Recommandation personnalisée
                </h3>
                <p className="text-text-secondary">{currentLoad.recommendation}</p>

                {/* Conseils rapides selon le TSB */}
                <div className="mt-4 pt-4 border-t border-border-base/30">
                  <p className="text-xs text-text-muted mb-2">Actions suggérées :</p>
                  <ul className="text-sm text-text-secondary space-y-1">
                    {currentLoad.tsb > 25 && (
                      <>
                        <li>• Planifiez une compétition ou un défi</li>
                        <li>• Reprenez l'entraînement pour ne pas perdre en forme</li>
                      </>
                    )}
                    {currentLoad.tsb > 5 && currentLoad.tsb <= 25 && (
                      <>
                        <li>• Bon moment pour un effort intense</li>
                        <li>• Augmentez progressivement la charge</li>
                      </>
                    )}
                    {currentLoad.tsb >= -10 && currentLoad.tsb <= 5 && (
                      <>
                        <li>• Continuez votre programme actuel</li>
                        <li>• Alternez efforts et récupération</li>
                      </>
                    )}
                    {currentLoad.tsb >= -30 && currentLoad.tsb < -10 && (
                      <>
                        <li>• Réduisez l'intensité des séances</li>
                        <li>• Privilégiez les sorties en Zone 1-2</li>
                      </>
                    )}
                    {currentLoad.tsb < -30 && (
                      <>
                        <li>• Repos complet pendant 2-3 jours</li>
                        <li>• Vérifiez votre sommeil et nutrition</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Graphique d'évolution */}
        <div className="glass-panel p-6 border">
          <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2 flex items-center gap-2">
            <span>📊</span> Évolution sur {period} jours
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Suivez l'évolution de votre forme (CTL), fatigue (ATL) et équilibre (TSB) dans le temps.
          </p>
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
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      'CTL (Forme)': `${value} - Votre niveau de forme`,
                      'ATL (Fatigue)': `${value} - Votre niveau de fatigue`,
                      'TSB (Équilibre)': `${value > 0 ? '+' : ''}${value} - ${value > 5 ? 'Frais' : value < -10 ? 'Fatigué' : 'Équilibré'}`
                    }
                    return [labels[name] || value, name]
                  }}
                />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <ReferenceLine y={0} stroke="#8BC34A" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Équilibre', fill: '#8BC34A', fontSize: 10 }} />
                <ReferenceLine y={-10} stroke="#FF5252" strokeDasharray="2 2" strokeOpacity={0.3} />
                <ReferenceLine y={5} stroke="#5CE1E6" strokeDasharray="2 2" strokeOpacity={0.3} />
                <Line type="monotone" dataKey="ctl" stroke="#5CE1E6" name="CTL (Forme)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="atl" stroke="#FF5252" name="ATL (Fatigue)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="tsb" stroke="#8BC34A" name="TSB (Équilibre)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-border-base/30 text-xs text-text-muted">
            <strong>Astuce de lecture :</strong> Quand la courbe CTL (bleue) monte, vous progressez.
            Quand TSB (verte) descend sous -10, pensez à récupérer. La zone optimale pour progresser
            est quand TSB oscille entre -10 et +5.
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
