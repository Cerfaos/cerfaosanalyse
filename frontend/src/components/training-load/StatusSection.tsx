/**
 * Section statut et recommandations
 */

import { STATUS_MAP } from "../../types/trainingLoad";
import type { CurrentLoad } from "../../types/trainingLoad";

interface StatusSectionProps {
  currentLoad: CurrentLoad;
}

export function StatusSection({ currentLoad }: StatusSectionProps) {
  const statusInfo = STATUS_MAP[currentLoad.status];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>{statusInfo?.emoji || "📊"}</span>
          Votre statut actuel
        </h3>
        <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo?.color || "bg-bg-gray-100"}`}>
          {statusInfo?.label || "Neutre"}
        </span>
        <p className="text-sm text-text-secondary mt-4">{statusInfo?.advice || currentLoad.recommendation}</p>
      </div>

      <div className="glass-panel p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>💡</span>
          Recommandation personnalisée
        </h3>
        <p className="text-text-secondary">{currentLoad.recommendation}</p>

        {/* Conseils rapides selon le TSB */}
        <div className="mt-4 pt-4 border-t border-border-base/30">
          <p className="text-xs text-text-muted mb-2">Actions suggérées :</p>
          <ul className="text-sm text-text-secondary space-y-1">
            {currentLoad.tsb > 25 && (
              <>
                <li>• Planifiez une compétition ou un défi</li>
                <li>• Reprenez l'entraînement pour ne pas perdre en forme</li>
              </>
            )}
            {currentLoad.tsb > 5 && currentLoad.tsb <= 25 && (
              <>
                <li>• Bon moment pour un effort intense</li>
                <li>• Augmentez progressivement la charge</li>
              </>
            )}
            {currentLoad.tsb >= -10 && currentLoad.tsb <= 5 && (
              <>
                <li>• Continuez votre programme actuel</li>
                <li>• Alternez efforts et récupération</li>
              </>
            )}
            {currentLoad.tsb >= -30 && currentLoad.tsb < -10 && (
              <>
                <li>• Réduisez l'intensité des séances</li>
                <li>• Privilégiez les sorties en Zone 1-2</li>
              </>
            )}
            {currentLoad.tsb < -30 && (
              <>
                <li>• Repos complet pendant 2-3 jours</li>
                <li>• Vérifiez votre sommeil et nutrition</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
