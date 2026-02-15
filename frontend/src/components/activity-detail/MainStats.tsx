/**
 * Grille uniforme des statistiques principales
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Distance */}
      {showMovementStats && (
        <StatCard
          label="Distance"
          value={formatDistance(activity.distance)}
          colorClass="text-[var(--accent-primary)]"
          dotColor="#f8712f"
          delay={0}
        />
      )}

      {/* Durée */}
      <StatCard
        label="Durée"
        value={formatDuration(activity.duration)}
        colorClass="text-[var(--accent-secondary)]"
        dotColor="#f59e0b"
        delay={50}
      />

      {/* Vitesse */}
      {showMovementStats && (
        <StatCard
          label="Vitesse moy"
          value={formatSpeed(activity.avgSpeed)}
          secondary={formatPace(activity.avgSpeed)}
          colorClass="text-[var(--status-info)]"
          dotColor="#3b82f6"
          delay={100}
        />
      )}

      {/* FC moyenne */}
      <StatCard
        label="FC moyenne"
        value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "-"}
        unit="bpm"
        secondary={activity.maxHeartRate ? `Max: ${activity.maxHeartRate} bpm` : undefined}
        colorClass="text-[var(--status-error)]"
        dotColor="#ef4444"
        delay={150}
      />

      {/* Dénivelé */}
      {showMovementStats && (
        <StatCard
          label="Dénivelé +"
          value={formatElevation(activity.elevationGain)}
          secondary={
            activity.elevationLoss
              ? `D- ${formatElevation(activity.elevationLoss)}`
              : undefined
          }
          colorClass="text-[var(--status-success)]"
          dotColor="#10b981"
          delay={200}
        />
      )}

      {/* TRIMP */}
      <StatCard
        label="TRIMP"
        value={activity.trimp || "-"}
        colorClass={getTrimpColor(activity.trimp)}
        dotColor="#a855f7"
        infoComponent={<MetricInfo metric="trimp" />}
        delay={250}
      />

      {/* RPE */}
      {activity.rpe && (
        <StatCard
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
          colorClass={getRpeColor(activity.rpe)}
          dotColor="#f59e0b"
          delay={300}
        />
      )}
    </div>
  );
}
