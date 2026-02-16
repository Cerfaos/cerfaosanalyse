/**
 * Étape terminée pour l'import MRC
 */

import { Check, AlertCircle } from 'lucide-react'
import type { MrcBatchResult } from '../../../services/trainingApi'

interface DoneStepProps {
  filesCount: number
  batchResult: MrcBatchResult | null
}

export function DoneStep({ filesCount, batchResult }: DoneStepProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-brand-primary" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-brand-primary/20 animate-ping" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">Importation terminée</h3>
        <p className="text-[var(--text-tertiary)] mt-2">
          {filesCount === 1
            ? 'Votre fichier a été importé avec succès'
            : `${batchResult?.success.length || filesCount} fichier(s) importé(s)`}
        </p>
      </div>

      {/* Résultats batch */}
      {batchResult && <BatchResultDisplay batchResult={batchResult} />}
    </div>
  )
}

function BatchResultDisplay({ batchResult }: { batchResult: MrcBatchResult }) {
  return (
    <div className="space-y-3">
      {batchResult.success.length > 0 && (
        <div className="rounded-xl bg-brand-primary/10 border border-brand-primary/30 p-4">
          <p className="text-sm font-medium text-brand-primary mb-3 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {batchResult.success.length} fichier{batchResult.success.length > 1 ? 's' : ''} importé
            {batchResult.success.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {batchResult.success.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-brand-primary/80">
                <Check className="w-3.5 h-3.5" />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {batchResult.errors.length > 0 && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {batchResult.errors.length} erreur{batchResult.errors.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {batchResult.errors.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-400/80">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-medium">{item.fileName}:</span> {item.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
