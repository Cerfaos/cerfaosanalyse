/**
 * Page Tableau de bord
 */

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
  ActivityTypeCard,
  ActivityRow,
  ActivityTimelineCard,
  WeightSummaryCard,
  EmptyState,
  FiltersSection,
  OverviewSection,
} from "../components/dashboard";
import { useDashboard } from "../hooks/useDashboard";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import { formatDuration, formatDistance } from "../utils/dashboardConfig";
import type { PeriodType, ActivityTypeStats, DashboardActivity } from "../types/dashboard";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { widgets } = useDashboardStore();
  const navigate = useNavigate();

  // États pour les filtres
  const [period, setPeriod] = useState<PeriodType>("30");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  // Hook personnalisé pour les données du dashboard
  const { stats, typeStats, typeTotals, activityTimeline, weightStats, weightEntries, recentActivities, availableTypes, loading, periodLabel } =
    useDashboard({ period, selectedMonth, selectedYear, selectedTypes });

  const isWidgetEnabled = (widgetId: string) => widgets.find((w) => w.id === widgetId)?.enabled ?? true;

  const toggleType = (type: string) => {
    setSelectedTypes(selectedTypes.includes(type) ? selectedTypes.filter((t) => t !== type) : [...selectedTypes, type]);
  };

  const resetFilters = () => {
    const now = new Date();
    setPeriod("30");
    setSelectedTypes([]);
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  const actions = <DashboardActions onConfigure={() => setShowConfig(true)} onNavigateActivities={() => navigate("/activities")} />;

  if (loading) {
    return (
      <AppLayout title="Tableau de bord" description={`Synthèse ${periodLabel}`} actions={actions}>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Tableau de bord" description={`Salut ${user?.fullName || user?.email}, voici tes ${periodLabel?.toLowerCase()}`} actions={actions}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Tableau de bord"
          title="Synthèse d'entraînement"
          description="Analysez vos performances, suivez votre charge d'entraînement et visualisez vos progrès."
          icon="dashboard"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
        />

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
            <OverviewSection stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 min-w-0">
                <ActivityTimelineCard data={activityTimeline} formatDuration={formatDuration} />
              </div>
              <div className="min-w-0 flex flex-col gap-6">
                <div className="h-[300px]">
                  <FatigueCard />
                </div>
                <div className="flex-1">
                  <WeightSummaryCard stats={weightStats} entries={weightEntries} onNavigate={() => navigate("/weight")} />
                </div>
              </div>
            </div>

            {/* Statistiques par type d'activité */}
            {typeStats.length > 0 && (
              <TypeStatsSection typeStats={typeStats} formatDistance={formatDistance} formatDuration={formatDuration} />
            )}

            {/* Widgets optionnels */}
            {isWidgetEnabled("heatmap") && <WidgetSection title="Calendrier d'activités" subtitle="Visualisez votre régularité d'entraînement"><ActivityHeatmap /></WidgetSection>}
            {isWidgetEnabled("year-comparison") && <WidgetSection title="Comparaison annuelle" subtitle="Comparez vos performances avec l'année précédente"><YearComparison /></WidgetSection>}
            {isWidgetEnabled("zone-progression") && <WidgetSection title="Distribution des zones d'effort" subtitle="Analysez la répartition de votre entraînement par zone cardiaque"><ZoneProgressionChart /></WidgetSection>}
            {isWidgetEnabled("gps-map") && <WidgetSection title="Carte des parcours" subtitle="Visualisez vos traces GPS superposées"><GPSTracesMap /></WidgetSection>}

            {/* Dernières activités */}
            {isWidgetEnabled("recent-activities") && (
              <RecentActivitiesSection
                activities={recentActivities}
                onNavigate={(id) => navigate(`/activities/${id}`)}
                onViewAll={() => navigate("/activities")}
                formatDistance={formatDistance}
                formatDuration={formatDuration}
              />
            )}
          </>
        ) : (
          <EmptyState onImport={() => navigate("/activities")} />
        )}
      </div>

      <DashboardConfig isOpen={showConfig} onClose={() => setShowConfig(false)} />
    </AppLayout>
  );
}

// Sous-composants

function DashboardActions({ onConfigure, onNavigateActivities }: { onConfigure: () => void; onNavigateActivities: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onConfigure} className="p-2 hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors" title="Personnaliser le dashboard">
        <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <button onClick={onNavigateActivities} className="btn-primary font-display">Importer une activité</button>
    </div>
  );
}

interface TypeStatsSectionProps {
  typeStats: ActivityTypeStats[];
  formatDistance: (m: number) => string;
  formatDuration: (s: number) => string;
}

function TypeStatsSection({ typeStats, formatDistance, formatDuration }: TypeStatsSectionProps) {
  return (
    <div className="glass-panel p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">📊</div>
          <h2 className="text-3xl font-bold text-white font-display">Statistiques par type d'activité</h2>
        </div>
        <p className="text-sm text-gray-400 ml-16">Détail de vos performances pour chaque discipline sur la période sélectionnée</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {typeStats.map((typeData) => (
          <ActivityTypeCard key={typeData.type} typeData={typeData} formatDistance={formatDistance} formatDuration={formatDuration} />
        ))}
      </div>
    </div>
  );
}

function WidgetSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

interface RecentActivitiesSectionProps {
  activities: DashboardActivity[];
  onNavigate: (id: number) => void;
  onViewAll: () => void;
  formatDistance: (m: number) => string;
  formatDuration: (s: number) => string;
}

function RecentActivitiesSection({ activities, onNavigate, onViewAll, formatDistance, formatDuration }: RecentActivitiesSectionProps) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Dernières activités</h3>
        <button onClick={onViewAll} className="text-sm text-[#8BC34A] hover:text-[#8BC34A]-dark dark:text-[#8BC34A] dark:hover:text-[#8BC34A]-light font-medium">
          Voir tout →
        </button>
      </div>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} onClick={() => onNavigate(activity.id)} formatDistance={formatDistance} formatDuration={formatDuration} />
          ))
        ) : (
          <p className="text-center text-gray-400 py-4">Aucune activité récente</p>
        )}
      </div>
    </div>
  );
}
