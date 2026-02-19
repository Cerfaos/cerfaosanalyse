/**
 * Liste des activités avec détail des zones cardio
 */

import { Card } from '../ui/Card';
import type { CyclingActivity } from '../../types/cyclingStats';
import {
  formatDuration,
  formatDistance,
  formatDate,
  formatTime,
  TYPE_COLORS,
  DATA_SOURCE_LABELS,
} from '../../utils/cyclingStatsConfig';

interface ActivityZoneListProps {
  activities: CyclingActivity[];
}

export function ActivityZoneList({ activities }: ActivityZoneListProps) {
  return (
    <Card
      title="Analyse par sortie"
      description="Détail individuel de chaque activité avec répartition des zones cardiaques."
    >
      <p className="text-xs text-text-muted leading-relaxed mb-4">
        La barre colorée représente le temps passé dans chaque zone (Z1 à Z5). Les données proviennent
        soit d'un enregistrement cardio continu (trace complète), soit d'une estimation à partir de la
        FC moyenne lorsque la trace n'est pas disponible. Le badge "Source" indique la fiabilité des données
        pour chaque sortie.
      </p>
      {activities.length === 0 ? (
        <p className="text-center text-text-secondary py-6">Aucune activité sur cette période.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityZoneCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </Card>
  );
}

interface ActivityZoneCardProps {
  activity: CyclingActivity;
}

function ActivityZoneCard({ activity }: ActivityZoneCardProps) {
  return (
    <div className="rounded-2xl border border-border-base p-4 hover:border-brand/40 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: TYPE_COLORS[activity.type] || '#6B7280' }}
            >
              {activity.type}
            </span>
            {activity.subSport && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-input)] text-[var(--text-secondary)]">
                {activity.subSport}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activity.isIndoor
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {activity.isIndoor ? 'Intérieur' : 'Extérieur'}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {formatDate(activity.date)} • {formatTime(activity.date)}
          </p>
          <p className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast">
            {formatDistance(activity.distance)} • {formatDuration(activity.duration)}
          </p>
          <p className="text-xs text-text-muted">Source: {DATA_SOURCE_LABELS[activity.dataSource]}</p>
          {activity.dataSource === 'average' && (
            <p className="text-xs text-warning mt-1">
              Estimation via FC moyenne : répartition estimée avec {activity.dominantZoneLabel} comme
              zone dominante (60%), zones adjacentes (35%), reste dispersé.
            </p>
          )}
          {activity.dataSource === 'none' && (
            <p className="text-xs text-warning mt-1">
              Pas de trace cardio: la répartition reste indicative.
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-display">
            {activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : '--'}
          </p>
          <p className="text-xs text-text-secondary">Zone dominante: {activity.dominantZoneLabel}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex h-3 rounded-full overflow-hidden bg-border-base/40">
          {activity.zoneDurations.map((zone) => (
            <div
              key={zone.zone}
              className="h-full"
              style={{
                flex: Math.max(zone.seconds, 0.5),
                backgroundColor: zone.color,
              }}
              title={`${zone.label} • ${zone.percentage.toFixed(1)}% (${formatDuration(zone.seconds)})`}
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-text-secondary">
          <p>FC max: {activity.maxHeartRate ? `${activity.maxHeartRate} bpm` : '--'}</p>
          <p>TRIMP: {activity.trimp ?? '--'}</p>
          <p>Zone dominante: {activity.dominantZone}</p>
          <p>Données: {DATA_SOURCE_LABELS[activity.dataSource]}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {activity.zoneDurations.map((zone) => (
            <div key={zone.zone} className="rounded-lg border border-border-base p-2 flex flex-col">
              <span className="font-semibold text-text-dark dark:text-dark-text-contrast">
                {zone.label}
              </span>
              <span className="text-text-secondary">
                {zone.percentage.toFixed(1)}% • {formatDuration(zone.seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityZoneList;
