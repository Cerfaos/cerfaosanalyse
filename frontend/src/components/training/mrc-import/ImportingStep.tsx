/**
 * Étape importation en cours pour l'import MRC
 */

import { Upload } from 'lucide-react'

export function ImportingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-brand-primary/20" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-brand-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Upload className="w-8 h-8 text-brand-primary animate-pulse" />
        </div>
      </div>
      <p className="text-[var(--text-primary)] font-medium text-lg">Importation en cours...</p>
      <p className="text-[var(--text-disabled)] text-sm mt-2">Veuillez patienter</p>
    </div>
  )
}
