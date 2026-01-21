/**
 * Grille des statistiques principales d'une activité
 */

import MetricInfo from "../ui/MetricInfo";
import { StatCard } from "./index";
import type { Activity } from "../../types/activity";

interface MainStatsProps {
  activity: Activity;
  showMovementStats: boolean;
  formatDistance: (m: number) => string;
  formatDuration: (s: number) => string;
  formatSpeed: (kmh: number | null) => string;
  formatPace: (kmh: number | null) => string;
  formatElevation: (v: number | null | undefined) => string;
  getTrimpColor: (t: number | null) => string;
  getRpeColor: (r: number | null) => string;
}

export default function MainStats({
  activity,
  showMovementStats,
  formatDistance,
  formatDuration,
  formatSpeed,
  formatPace,
  formatElevation,
  getTrimpColor,
  getRpeColor,
}: MainStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Distance */}
      {showMovementStats && (
        <StatCard
          icon="🛣️"
          label="Distance"
          value={formatDistance(activity.distance)}
          bgColorClass="bg-[var(--accent-primary)]/10"
          colorClass="text-[var(--accent-primary)]"
          delay={0}
        />
      )}

      {/* Durée */}
      <StatCard
        icon="⏱️"
        label="Durée"
        value={formatDuration(activity.duration)}
        bgColorClass="bg-[var(--accent-secondary)]/10"
        delay={50}
      />

      {/* Vitesse */}
      {showMovementStats && (
        <StatCard
          icon="🚀"
          label="Vitesse moy"
          value={formatSpeed(activity.avgSpeed)}
          secondary={formatPace(activity.avgSpeed)}
          bgColorClass="bg-[var(--status-info)]/10"
          delay={100}
        />
      )}

      {/* FC moyenne */}
      <StatCard
        icon="❤️"
        label="FC moyenne"
        value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "-"}
        unit="bpm"
        secondary={activity.maxHeartRate ? `Max: ${activity.maxHeartRate} bpm` : undefined}
        bgColorClass="bg-[var(--status-error)]/10"
        colorClass="text-[var(--status-error)]"
        delay={150}
      />

      {/* Dénivelé */}
      {showMovementStats && (
        <StatCard
          icon="⛰️"
          label="Dénivelé +"
          value={formatElevation(activity.elevationGain)}
          secondary={
            activity.elevationLoss
              ? `Descente: ${formatElevation(activity.elevationLoss)}`
              : undefined
          }
          bgColorClass="bg-[var(--status-success)]/10"
          colorClass="text-[var(--status-success)]"
          delay={200}
        />
      )}

      {/* TRIMP */}
      <StatCard
        icon="💪"
        label="TRIMP"
        value={activity.trimp || "-"}
        bgColorClass="bg-purple-500/10"
        colorClass={getTrimpColor(activity.trimp)}
        infoComponent={<MetricInfo metric="trimp" />}
        delay={250}
      />

      {/* RPE */}
      {activity.rpe && (
        <StatCard
          icon="🎯"
          label="RPE"
          value={`${activity.rpe}`}
          unit="/10"
          secondary={
            activity.rpe <= 3
              ? "Facile"
              : activity.rpe <= 6
              ? "Modéré"
              : activity.rpe <= 8
              ? "Difficile"
              : "Extrême"
          }
          bgColorClass="bg-amber-500/10"
          colorClass={getRpeColor(activity.rpe)}
          delay={300}
        />
      )}

      {/* Température */}
      {activity.avgTemperature && (
        <StatCard
          icon="🌡️"
          label="Température"
          value={`${activity.avgTemperature}°C`}
          secondary={
            activity.maxTemperature ? `Max: ${activity.maxTemperature}°C` : undefined
          }
          bgColorClass="bg-cyan-500/10"
          delay={350}
        />
      )}
    </div>
  );
}
