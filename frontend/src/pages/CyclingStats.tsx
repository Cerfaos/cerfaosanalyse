/**
 * Page de statistiques cardio/cyclisme
 */

import AppLayout from '../components/layout/AppLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { useCyclingStats } from '../hooks/useCyclingStats';
import {
  CyclingStatsFilters,
  CyclingStatsSummary,
  HeartRateZonesCard,
  ZoneDistributionCard,
  PolarizationCard,
  ActivityZoneList,
} from '../components/cycling-stats';

export default function CyclingStats() {
  const {
    stats,
    loading,
    error,
    period,
    setPeriod,
    selectedTypes,
    toggleType,
    resetTypes,
    indoorFilter,
    setIndoorFilter,
    durationHours,
    analysisRangeLabel,
  } = useCyclingStats();

  return (
    <AppLayout
      title="Cartographie FC"
      description="Analyse cardio, zones d'intensité et polarisation de toutes vos activités"
    >
      <div className="mb-6">
        <PageHeader
          eyebrow="Analyse cardio"
          title="Cartographie FC"
          description="Zones d'intensité, polarisation et répartition de toutes vos activités (cyclisme, rameur, course, etc.)"
          icon="cyclingStats"
          gradient="from-[#FF5252] to-[#5CE1E6]"
          accentColor="#FF5252"
        />
      </div>

      <section className="glass-panel p-6 space-y-6">
        <CyclingStatsFilters
          stats={stats}
          period={period}
          onPeriodChange={setPeriod}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          onResetTypes={resetTypes}
          indoorFilter={indoorFilter}
          onIndoorFilterChange={setIndoorFilter}
          analysisRangeLabel={analysisRangeLabel}
        />

        {error && (
          <div className="p-4 border border-danger/40 bg-danger/5 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <CyclingStatsSummary stats={stats} durationHours={durationHours} />
      </section>

      {loading ? (
        <div className="glass-panel p-6">
          <p className="text-center text-text-secondary">Chargement des insights cyclisme...</p>
        </div>
      ) : !stats ? (
        <div className="glass-panel p-6">
          <p className="text-center text-text-secondary">Aucune donnée cyclisme disponible.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <HeartRateZonesCard zones={stats.heartRateZones} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ZoneDistributionCard zones={stats.zoneDistribution} />
            <PolarizationCard polarization={stats.polarization} sampling={stats.sampling} />
          </div>

          <ActivityZoneList activities={stats.activities} />
        </div>
      )}
    </AppLayout>
  );
}
