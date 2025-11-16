import Tooltip from './Tooltip'

interface MetricInfoProps {
  metric: string
  className?: string
}

const metricDescriptions: Record<string, { title: string; description: string; formula?: string }> = {
  trimp: {
    title: 'TRIMP (Training Impulse)',
    description:
      "Mesure la charge d'entraînement basée sur la durée et l'intensité cardiaque. Plus la valeur est élevée, plus l'effort est important.",
    formula: 'TRIMP = Durée × FC moyenne × Facteur de genre',
  },
  ctl: {
    title: 'CTL (Chronic Training Load)',
    description:
      "Charge chronique d'entraînement sur 42 jours. Représente votre niveau de forme physique actuel.",
    formula: 'Moyenne exponentielle sur 42 jours du TRIMP quotidien',
  },
  atl: {
    title: 'ATL (Acute Training Load)',
    description:
      "Charge aiguë d'entraînement sur 7 jours. Représente votre fatigue récente.",
    formula: 'Moyenne exponentielle sur 7 jours du TRIMP quotidien',
  },
  tsb: {
    title: 'TSB (Training Stress Balance)',
    description:
      "Équilibre entre forme et fatigue. Positif = frais, Négatif = fatigué. Optimal entre -10 et +25.",
    formula: 'TSB = CTL - ATL',
  },
  zone1: {
    title: 'Zone 1 - Récupération active',
    description: '50-60% FCmax. Effort très léger, récupération et échauffement.',
  },
  zone2: {
    title: 'Zone 2 - Endurance de base',
    description:
      '60-70% FCmax. Effort facile, conversation possible. Développe la base aérobie.',
  },
  zone3: {
    title: 'Zone 3 - Tempo',
    description: '70-80% FCmax. Effort modéré, améliore l\'endurance aérobie.',
  },
  zone4: {
    title: 'Zone 4 - Seuil',
    description: '80-90% FCmax. Effort intense, améliore le seuil lactique.',
  },
  zone5: {
    title: 'Zone 5 - VO2max',
    description: '90-100% FCmax. Effort maximal, intervalles courts.',
  },
  avgHeartRate: {
    title: 'Fréquence cardiaque moyenne',
    description: 'Moyenne des battements cardiaques par minute durant l\'activité.',
  },
  maxHeartRate: {
    title: 'Fréquence cardiaque maximale',
    description: 'Pic de FC atteint pendant l\'activité.',
  },
  avgSpeed: {
    title: 'Vitesse moyenne',
    description: 'Vitesse moyenne incluant les pauses (km/h).',
  },
  maxSpeed: {
    title: 'Vitesse maximale',
    description: 'Pic de vitesse atteint pendant l\'activité.',
  },
  elevationGain: {
    title: 'Dénivelé positif',
    description: 'Total des mètres grimpés durant l\'activité.',
  },
  calories: {
    title: 'Calories brûlées',
    description: 'Estimation de l\'énergie dépensée basée sur FC et durée.',
  },
  intensity: {
    title: 'Intensité',
    description:
      'Pourcentage de votre FC moyenne par rapport à votre FCmax. Indique l\'effort relatif.',
  },
  efficiency: {
    title: 'Efficacité',
    description:
      'Ratio entre la performance (distance, dénivelé) et l\'effort cardiaque.',
  },
  rampRate: {
    title: 'Taux de progression',
    description:
      'Augmentation de la charge d\'entraînement. Idéalement entre 3-7 points/semaine pour éviter les blessures.',
  },
}

export default function MetricInfo({ metric, className = '' }: MetricInfoProps) {
  const info = metricDescriptions[metric]

  if (!info) return null

  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div className="font-semibold">{info.title}</div>
          <div className="text-xs opacity-90">{info.description}</div>
          {info.formula && (
            <div className="text-xs opacity-75 italic border-t border-white/20 dark:border-gray-900/20 pt-1 mt-1">
              {info.formula}
            </div>
          )}
        </div>
      }
      position="top"
    >
      <button
        type="button"
        className={`inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-text-muted/20 hover:bg-text-muted/30 text-text-muted dark:bg-dark-text-secondary/20 dark:hover:bg-dark-text-secondary/30 dark:text-dark-text-secondary transition-colors ${className}`}
        aria-label={`Information sur ${info.title}`}
      >
        ?
      </button>
    </Tooltip>
  )
}
