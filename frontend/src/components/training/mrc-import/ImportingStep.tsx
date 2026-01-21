/**
 * Étape importation en cours pour l'import MRC
 */

import { Upload } from 'lucide-react'

export function ImportingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-[#8BC34A]/20" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[#8BC34A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Upload className="w-8 h-8 text-[#8BC34A] animate-pulse" />
        </div>
      </div>
      <p className="text-white font-medium text-lg">Importation en cours...</p>
      <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
    </div>
  )
}
