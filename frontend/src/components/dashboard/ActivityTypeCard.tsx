import type { ActivityTypeStats } from "../../types/dashboard";

interface ActivityTypeCardProps {
  typeData: ActivityTypeStats;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-[var(--text-tertiary)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function ActivityTypeCard({
  typeData,
  formatDistance,
  formatDuration,
}: ActivityTypeCardProps) {
  return (
    <div className="glass-panel p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-default">
      <div className="flex items-center gap-3 mb-5">
        <div className="text-5xl">{typeData.icon}</div>
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">{typeData.type}</h3>
          <p className="text-sm font-medium text-[var(--text-tertiary)]">
            {typeData.count} sortie{typeData.count > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <StatRow
          label="Distance"
          value={formatDistance(typeData.totalDistance)}
        />
        <StatRow label="Durée" value={formatDuration(typeData.totalDuration)} />
        {typeData.totalElevation > 0 && (
          <StatRow
            label="Dénivelé +"
            value={`${Math.round(typeData.totalElevation)} m`}
          />
        )}
        {typeData.averageSpeed && (
          <StatRow
            label="Vitesse moy."
            value={`${typeData.averageSpeed.toFixed(1)} km/h`}
          />
        )}
        {typeData.averageHeartRate && (
          <StatRow
            label="FC moyenne"
            value={`${typeData.averageHeartRate} bpm`}
          />
        )}
        {typeData.totalTrimp > 0 && (
          <StatRow
            label="TRIMP total"
            value={`${Math.round(typeData.totalTrimp)}`}
          />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Moy./sortie</p>
            <p className="font-semibold text-[var(--text-primary)]">
              {formatDistance(typeData.averageDistance)}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Durée moy.</p>
            <p className="font-semibold text-[var(--text-primary)]">
              {formatDuration(typeData.averageDuration)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
