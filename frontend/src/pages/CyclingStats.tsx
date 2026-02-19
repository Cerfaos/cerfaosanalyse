/**
 * Page de statistiques cardio/cyclisme
 */

import { useState } from 'react';
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

  const [guideOpen, setGuideOpen] = useState(false);

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

      {/* Bloc pédagogique pliable */}
      <div className="mb-6 rounded-2xl border border-border-base bg-surface-deep/60">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left cursor-pointer"
        >
          <span className="text-sm font-semibold text-text-secondary">
            Comment lire cette page ?
          </span>
          <svg
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${guideOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {guideOpen && (
          <div className="px-5 pb-5 space-y-4 text-sm text-text-secondary leading-relaxed border-t border-border-base pt-4">
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Zones cardiaques et méthode Karvonen</h4>
              <p>
                Les zones sont calculées avec la méthode de <strong>Karvonen</strong>, qui utilise votre
                fréquence cardiaque de réserve (FC max − FC repos). Contrairement à un simple pourcentage
                de la FC max, cette approche reflète mieux l'effort réel car elle prend en compte votre
                condition de repos. Chaque zone correspond à un niveau d'intensité : de la récupération
                active (Z1) à l'effort maximal (Z5).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">TRIMP (Training Impulse)</h4>
              <p>
                Le TRIMP est un score de charge d'entraînement qui combine la durée de l'effort et
                son intensité cardiaque. Plus la séance est longue et intense, plus le score est élevé.
                Il permet de comparer des séances de natures différentes sur une échelle commune et
                de suivre l'évolution de votre charge au fil du temps.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">Index de polarisation 80/10/10</h4>
              <p>
                La polarisation mesure la répartition de votre temps d'entraînement entre les différentes
                intensités. Le modèle <strong>80/10/10</strong> recommande de passer 80% du temps en
                endurance fondamentale (Z1-Z2), 10% en tempo (Z3) et 10% en haute intensité (Z4-Z5).
                Un score de 100% signifie que votre répartition est parfaitement alignée avec ce modèle ;
                plus le score est bas, plus votre entraînement s'écarte de cette distribution idéale.
              </p>
            </div>
          </div>
        )}
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
