import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityHeatmap from "../components/ActivityHeatmap";
import DashboardConfig from "../components/DashboardConfig";
import DashboardSkeleton from "../components/DashboardSkeleton";
import FatigueCard from "../components/FatigueCard";
import GPSTracesMap from "../components/GPSTracesMap";
import AppLayout from "../components/layout/AppLayout";
import { PageHeader } from "../components/ui/PageHeader";
import YearComparison from "../components/YearComparison";
import ZoneProgressionChart from "../components/ZoneProgressionChart";
import {
  StatCard,
  ActivityTypeCard,
  ActivityRow,
  ActivityTimelineCard,
  WeightSummaryCard,
  PeriodCard,
  TypeChip,
  EmptyState,
} from "../components/dashboard";
import { useDashboard } from "../hooks/useDashboard";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import {
  periodOptions,
  getActivityTypeConfigSafe,
  monthNames,
} from "../utils/dashboardConfig";
import type { PeriodType } from "../types/dashboard";

// Fonctions utilitaires de formatage
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const formatDistance = (meters: number): string => {
  return `${(meters / 1000).toFixed(2)} km`;
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { widgets } = useDashboardStore();
  const navigate = useNavigate();

  // États pour les filtres
  const [period, setPeriod] = useState<PeriodType>("30");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  // Hook personnalisé pour les données du dashboard
  const {
    stats,
    typeStats,
    typeTotals,
    activityTimeline,
    weightStats,
    weightEntries,
    recentActivities,
    availableTypes,
    loading,
    periodLabel,
  } = useDashboard({
    period,
    selectedMonth,
    selectedYear,
    selectedTypes,
  });

  // Helper pour vérifier si un widget est activé
  const isWidgetEnabled = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId);
    return widget?.enabled ?? true;
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const resetFilters = () => {
    const now = new Date();
    setPeriod("30");
    setSelectedTypes([]);
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  const actions = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowConfig(true)}
        className="p-2 hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
        title="Personnaliser le dashboard"
      >
        <svg
          className="w-5 h-5 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
      <button
        onClick={() => navigate("/activities")}
        className="btn-primary font-display"
      >
        Importer une activité
      </button>
    </div>
  );

  if (loading) {
    return (
      <AppLayout
        title="Tableau de bord"
        description={`Synthèse ${periodLabel}`}
        actions={actions}
      >
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Tableau de bord"
      description={`Salut ${
        user?.fullName || user?.email
      }, voici tes ${periodLabel?.toLowerCase()}`}
      actions={actions}
    >
      <div className="space-y-8">
        <PageHeader
          eyebrow="Tableau de bord"
          title="Synthèse d'entraînement"
          description="Analysez vos performances, suivez votre charge d'entraînement et visualisez vos progrès."
          icon="dashboard"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
        />

        {/* Filtres */}
        <FiltersSection
          period={period}
          setPeriod={setPeriod}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          availableTypes={availableTypes}
          typeTotals={typeTotals}
          toggleType={toggleType}
          resetFilters={resetFilters}
        />

        {stats && stats.totalActivities > 0 ? (
          <>
            {/* Vue d'ensemble de la période */}
            <OverviewSection stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 min-w-0">
                <ActivityTimelineCard
                  data={activityTimeline}
                  formatDuration={formatDuration}
                />
              </div>
              <div className="min-w-0 flex flex-col gap-6">
                <div className="h-[300px]">
                  <FatigueCard />
                </div>
                <div className="flex-1">
                  <WeightSummaryCard
                    stats={weightStats}
                    entries={weightEntries}
                    onNavigate={() => navigate("/weight")}
                  />
                </div>
              </div>
            </div>

            {/* Statistiques par type d'activité */}
            {typeStats.length > 0 && (
              <div className="glass-panel p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">📊</div>
                    <h2 className="text-3xl font-bold text-white font-display">
                      Statistiques par type d'activité
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-16">
                    Détail de vos performances pour chaque discipline sur la
                    période sélectionnée
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {typeStats.map((typeData) => (
                    <ActivityTypeCard
                      key={typeData.type}
                      typeData={typeData}
                      formatDistance={formatDistance}
                      formatDuration={formatDuration}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Heatmap calendrier */}
            {isWidgetEnabled("heatmap") && (
              <div className="glass-panel p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Calendrier d'activités
                  </h3>
                  <p className="text-sm text-text-muted">
                    Visualisez votre régularité d'entraînement
                  </p>
                </div>
                <ActivityHeatmap />
              </div>
            )}

            {/* Comparaison année vs année */}
            {isWidgetEnabled("year-comparison") && (
              <div className="glass-panel p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Comparaison annuelle
                  </h3>
                  <p className="text-sm text-text-muted">
                    Comparez vos performances avec l'année précédente
                  </p>
                </div>
                <YearComparison />
              </div>
            )}

            {/* Progression par zones d'effort */}
            {isWidgetEnabled("zone-progression") && (
              <div className="glass-panel p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Distribution des zones d'effort
                  </h3>
                  <p className="text-sm text-text-muted">
                    Analysez la répartition de votre entraînement par zone
                    cardiaque
                  </p>
                </div>
                <ZoneProgressionChart />
              </div>
            )}

            {/* Carte des traces GPS */}
            {isWidgetEnabled("gps-map") && (
              <div className="glass-panel p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Carte des parcours
                  </h3>
                  <p className="text-sm text-text-muted">
                    Visualisez vos traces GPS superposées
                  </p>
                </div>
                <GPSTracesMap />
              </div>
            )}

            {/* Dernières activités */}
            {isWidgetEnabled("recent-activities") && (
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Dernières activités
                  </h3>
                  <button
                    onClick={() => navigate("/activities")}
                    className="text-sm text-[#8BC34A] hover:text-[#8BC34A]-dark dark:text-[#8BC34A] dark:hover:text-[#8BC34A]-light font-medium"
                  >
                    Voir tout →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <ActivityRow
                        key={activity.id}
                        activity={activity}
                        onClick={() => navigate(`/activities/${activity.id}`)}
                        formatDistance={formatDistance}
                        formatDuration={formatDuration}
                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-4">
                      Aucune activité récente
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState onImport={() => navigate("/activities")} />
        )}
      </div>

      {/* Modal de configuration */}
      <DashboardConfig
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </AppLayout>
  );
}

// Composant Filtres
interface FiltersSectionProps {
  period: PeriodType;
  setPeriod: (period: PeriodType) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  availableTypes: string[];
  typeTotals: Record<string, number>;
  toggleType: (type: string) => void;
  resetFilters: () => void;
}

function FiltersSection({
  period,
  setPeriod,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedTypes,
  setSelectedTypes,
  availableTypes,
  typeTotals,
  toggleType,
  resetFilters,
}: FiltersSectionProps) {
  return (
    <div className="glass-panel p-6 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
            Filtres intelligents
          </p>
          <h3 className="text-xl font-semibold text-white">
            Affinez vos statistiques
          </h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm font-medium text-text-muted hover:text-text-dark dark:text-dark-text-secondary dark:hover:text-dark-text-contrast underline-offset-4 hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-4">Période</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {periodOptions.map((option) => (
            <PeriodCard
              key={option.value}
              option={option}
              isActive={period === option.value}
              onSelect={() => setPeriod(option.value)}
            />
          ))}
        </div>
      </div>

      {/* Sélecteurs de mois et année (mode personnalisé) */}
      {period === "custom" && (
        <div className="rounded-2xl border border-panel-border bg-bg-subtle/40 dark:bg-dark-border/20 p-4">
          <p className="text-sm font-semibold text-white mb-3">
            Sélectionner le mois et l'année
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl border-2 border-panel-border bg-white dark:bg-dark-surface text-white font-medium text-sm focus:outline-none focus:border-brand transition-colors"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl border-2 border-panel-border bg-white dark:bg-dark-surface text-white font-medium text-sm focus:outline-none focus:border-brand transition-colors"
            >
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filtres par type d'activité */}
      {availableTypes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Types d'activités
              </p>
              <p className="text-xs text-gray-400">
                Touchez pour afficher/masquer une discipline
              </p>
            </div>
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="text-xs text-[#8BC34A] hover:text-[#8BC34A]-dark dark:text-[#8BC34A] dark:hover:text-[#8BC34A]-light font-medium"
              >
                Tout afficher
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {availableTypes.map((type) => {
              const config = getActivityTypeConfigSafe(type);
              const isSelected =
                selectedTypes.length === 0 || selectedTypes.includes(type);
              return (
                <TypeChip
                  key={type}
                  label={type}
                  icon={config.icon}
                  count={typeTotals[type] || 0}
                  selected={isSelected}
                  onClick={() => toggleType(type)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Vue d'ensemble
interface OverviewSectionProps {
  stats: {
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    totalTrimp: number;
    averageHeartRate: number | null;
  };
}

function OverviewSection({ stats }: OverviewSectionProps) {
  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-green-500/5" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-gray-400">
              Période
            </p>
            <h2 className="text-3xl font-bold text-white">
              {stats.totalActivities} activité
              {stats.totalActivities > 1 ? "s" : ""}
            </h2>
          </div>
          <div className="text-4xl animate-pulse">🎯</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        <StatCard
          label="Distance totale"
          value={formatDistance(stats.totalDistance)}
          icon="🛣️"
          color="brand"
        />
        <StatCard
          label="Durée totale"
          value={formatDuration(stats.totalDuration)}
          icon="⏱️"
          color="orange"
        />
        <StatCard
          label="Charge TRIMP"
          value={stats.totalTrimp ? `${stats.totalTrimp}` : "-"}
          icon="💪"
          color="red"
        />
        <StatCard
          label="FC moyenne"
          value={
            stats.averageHeartRate ? `${stats.averageHeartRate} bpm` : "-"
          }
          icon="❤️"
          color="green"
        />
      </div>
    </div>
  );
}
