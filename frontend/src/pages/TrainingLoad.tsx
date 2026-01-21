/**
 * Page Charge d'entraînement
 */

import AppLayout from "../components/layout/AppLayout";
import { PageHeader } from "../components/ui/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PmcExplanation, MetricCards, TsbScale, StatusSection, LoadChart } from "../components/training-load";
import { useTrainingLoad } from "../hooks/useTrainingLoad";
import { PERIOD_OPTIONS } from "../types/trainingLoad";

export default function TrainingLoad() {
  const { period, setPeriod, currentLoad, history, loading } = useTrainingLoad("90");

  if (loading) {
    return (
      <AppLayout title="Charge d'entraînement" description="Suivi CTL / ATL / TSB">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Charge d'entraînement" description="Comprenez votre forme et votre fatigue">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Performance"
          title="Charge d'entraînement"
          description="Le modèle PMC (Performance Management Chart) analyse l'équilibre entre votre forme physique et votre fatigue pour optimiser votre entraînement."
          icon="trainingLoad"
          gradient="from-[#8BC34A] to-[#FF5252]"
          accentColor="#8BC34A"
        />

        <PmcExplanation />

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Période :</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionnez une période" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentLoad && (
          <>
            <MetricCards currentLoad={currentLoad} />
            <TsbScale tsb={currentLoad.tsb} />
            <StatusSection currentLoad={currentLoad} />
          </>
        )}

        <LoadChart history={history} period={period} />
      </div>
    </AppLayout>
  );
}
