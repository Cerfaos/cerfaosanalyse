/**
 * Section statistiques des données
 */

import type { ExtendedStats } from '../../types/export'

interface DataStatisticsProps {
  stats: ExtendedStats
}

export function DataStatistics({ stats }: DataStatisticsProps) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4 font-display flex items-center gap-2">
        <span className="text-2xl">&#128202;</span>
        Vos données
      </h2>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MainStatBox value={stats.totalActivities} label="Activités" color="text-cta" />
        <MainStatBox value={stats.totalWeightEntries} label="Pesées" color="text-brand" />
        <MainStatBox value={stats.totalEquipment} label="Équipements" color="text-accent" />
        <MainStatBox value={stats.totalTrainingSessions} label="Séances" color="text-warning" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SecondaryStatBox value={stats.totalTrainingTemplates} label="Templates" />
        <SecondaryStatBox value={stats.totalTrainingPrograms} label="Programmes" />
        <SecondaryStatBox value={stats.totalPpgExercises} label="Exercices PPG" />
        <SecondaryStatBox value={stats.estimatedDataSize} label="Taille estimée" />
      </div>

      {/* Date info */}
      <div className="border-t border-border-base pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {stats.firstActivityDate && (
          <div>
            <span className="text-text-body">Première activité : </span>
            <span className="font-medium">{new Date(stats.firstActivityDate).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        {stats.lastActivityDate && (
          <div>
            <span className="text-text-body">Dernière activité : </span>
            <span className="font-medium">{new Date(stats.lastActivityDate).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        <div>
          <span className="text-text-body">Membre depuis : </span>
          <span className="font-medium">{new Date(stats.memberSince).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  )
}

function MainStatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="glass-panel p-4 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-text-body mt-1">{label}</div>
    </div>
  )
}

function SecondaryStatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
      <div className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">{value}</div>
      <div className="text-xs text-text-body">{label}</div>
    </div>
  )
}
