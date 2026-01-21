/**
 * Section explicative du modèle PMC
 */

import { useState } from "react";

export function PmcExplanation() {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="glass-panel border overflow-hidden">
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <h3 className="font-semibold text-text-dark dark:text-dark-text-contrast">Comprendre le modèle PMC</h3>
            <p className="text-sm text-text-muted">Comment interpréter CTL, ATL et TSB ?</p>
          </div>
        </div>
        <span className={`text-xl transition-transform ${showExplanation ? "rotate-180" : ""}`}>▼</span>
      </button>

      {showExplanation && (
        <div className="p-6 pt-2 border-t border-border-base/30 space-y-6">
          {/* TRIMP */}
          <div className="space-y-2">
            <h4 className="font-semibold text-brand flex items-center gap-2">
              <span>⚡</span> TRIMP (Training Impulse)
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Le <strong>TRIMP</strong> mesure la charge de chaque séance en combinant la <strong>durée</strong> et l'
              <strong>intensité cardiaque</strong>. Plus vous vous entraînez longtemps et intensément, plus le TRIMP est élevé. C'est
              la "monnaie" qui alimente les calculs de CTL et ATL.
            </p>
            <div className="text-xs text-text-muted bg-bg-base/50 dark:bg-dark-bg-base/50 p-2 rounded font-mono">
              TRIMP = Durée (min) × Intensité relative × Coefficient de zone
            </div>
          </div>

          {/* CTL */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#5CE1E6] flex items-center gap-2">
              <span>📈</span> CTL - Chronic Training Load (Forme)
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              La <strong>CTL</strong> représente votre <strong>forme physique à long terme</strong>. C'est une moyenne mobile exponentielle
              de vos TRIMP sur <strong>42 jours</strong>. Elle reflète les adaptations physiologiques de votre corps à l'entraînement.
            </p>
            <ul className="text-sm text-text-secondary list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>CTL qui monte</strong> : vous progressez, votre forme s'améliore
              </li>
              <li>
                <strong>CTL stable</strong> : vous maintenez votre niveau actuel
              </li>
              <li>
                <strong>CTL qui descend</strong> : désentraînement, vous perdez en forme
              </li>
            </ul>
            <div className="text-xs text-text-muted bg-bg-base/50 dark:bg-dark-bg-base/50 p-2 rounded">
              💡 <strong>Conseil</strong> : Augmentez votre CTL de 3 à 7 points par semaine maximum pour progresser sans risque de
              blessure.
            </div>
          </div>

          {/* ATL */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#FF5252] flex items-center gap-2">
              <span>🔥</span> ATL - Acute Training Load (Fatigue)
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              L'<strong>ATL</strong> représente votre <strong>fatigue récente</strong>. C'est une moyenne mobile exponentielle de vos TRIMP
              sur <strong>7 jours</strong>. Elle monte rapidement après des efforts intenses et descend avec le repos.
            </p>
            <ul className="text-sm text-text-secondary list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>ATL élevée</strong> : vous accumulez de la fatigue
              </li>
              <li>
                <strong>ATL basse</strong> : vous êtes reposé
              </li>
              <li>
                <strong>ATL &gt; CTL</strong> : attention, vous vous fatiguez plus vite que vous ne progressez !
              </li>
            </ul>
          </div>

          {/* TSB */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#8BC34A] flex items-center gap-2">
              <span>⚖️</span> TSB - Training Stress Balance (Équilibre)
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Le <strong>TSB</strong> (= CTL - ATL) est l'indicateur clé. Il mesure l'
              <strong>équilibre entre votre forme et votre fatigue</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                <div className="font-semibold text-green-400 text-sm">TSB Positif (+)</div>
                <p className="text-xs text-text-secondary mt-1">
                  Vous êtes plus en forme que fatigué. Idéal avant une compétition ou pour un gros effort.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
                <div className="font-semibold text-red-400 text-sm">TSB Négatif (-)</div>
                <p className="text-xs text-text-secondary mt-1">
                  Votre fatigue dépasse votre forme. Normal en période d'entraînement, mais attention au surentraînement !
                </p>
              </div>
            </div>
          </div>

          {/* Tableau des zones TSB */}
          <div className="space-y-2">
            <h4 className="font-semibold text-text-dark dark:text-dark-text-contrast flex items-center gap-2">
              <span>🎯</span> Zones d'interprétation du TSB
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-base/30">
                    <th className="text-left py-2 text-text-muted font-medium">Plage TSB</th>
                    <th className="text-left py-2 text-text-muted font-medium">État</th>
                    <th className="text-left py-2 text-text-muted font-medium">Signification</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border-base/20">
                    <td className="py-2 font-mono text-cyan-400">&gt; +25</td>
                    <td className="py-2">💪 Très frais</td>
                    <td className="py-2">Pic de forme, prêt pour la compétition. Risque de perte de forme si trop long.</td>
                  </tr>
                  <tr className="border-b border-border-base/20">
                    <td className="py-2 font-mono text-blue-400">+5 à +25</td>
                    <td className="py-2">😊 Reposé</td>
                    <td className="py-2">Bon état de fraîcheur. Idéal pour des efforts importants.</td>
                  </tr>
                  <tr className="border-b border-border-base/20 bg-green-500/5">
                    <td className="py-2 font-mono text-green-400">-10 à +5</td>
                    <td className="py-2">🎯 Optimal</td>
                    <td className="py-2">
                      <strong>Zone idéale pour progresser</strong>. Léger déséquilibre productif.
                    </td>
                  </tr>
                  <tr className="border-b border-border-base/20">
                    <td className="py-2 font-mono text-orange-400">-30 à -10</td>
                    <td className="py-2">😓 Fatigué</td>
                    <td className="py-2">Fatigue accumulée. Récupération active conseillée.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-red-400">&lt; -30</td>
                    <td className="py-2">🚨 Critique</td>
                    <td className="py-2">Risque de surentraînement/blessure. Repos obligatoire !</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
