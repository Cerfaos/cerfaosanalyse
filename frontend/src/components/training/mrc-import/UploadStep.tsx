/**
 * Étape upload pour l'import MRC
 */

import { Upload, FileText, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadStepProps {
  loading: boolean
  isDragging: boolean
  onDragging: (isDragging: boolean) => void
  onFilesSelected: (files: File[]) => void
}

export function UploadStep({ loading, isDragging, onDragging, onFilesSelected }: UploadStepProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith('.mrc')
    )
    if (droppedFiles.length === 0) {
      toast.error('Veuillez déposer des fichiers .mrc')
      return
    }
    onFilesSelected(droppedFiles)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
    }
  }

  return (
    <div
      className={`relative rounded-2xl p-8 text-center transition-all duration-300 ${
        isDragging ? 'scale-[1.02]' : ''
      }`}
      onDragOver={(e) => { e.preventDefault(); onDragging(true) }}
      onDragLeave={() => onDragging(false)}
      onDrop={handleDrop}
    >
      {/* Animated border */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-50'}`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#8BC34A] via-[#5CE1E6] to-[#8BC34A] p-[2px] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]">
          <div className="w-full h-full rounded-2xl bg-[#0a191a]" />
        </div>
      </div>

      {/* Inner content */}
      <div className="relative z-10 py-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#8BC34A]/20 border-t-[#8BC34A] animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#8BC34A]" />
            </div>
            <p className="text-gray-300 font-medium">Analyse du fichier...</p>
          </div>
        ) : (
          <>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8BC34A]/20 to-[#5CE1E6]/20 flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110 rotate-3' : ''}`}>
              <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-[#8BC34A]' : 'text-gray-400'}`} />
            </div>
            <p className="text-white font-medium text-lg mb-2">
              {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers .mrc'}
            </p>
            <p className="text-gray-500 text-sm mb-6">ou</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black font-semibold rounded-xl cursor-pointer hover:shadow-lg hover:shadow-[#8BC34A]/25 hover:scale-105 transition-all duration-200">
              <FileText className="w-5 h-5" />
              Parcourir les fichiers
              <input
                type="file"
                accept=".mrc"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-gray-500 text-xs mt-6">
              Format MRC compatible avec les principales applications de home trainer
            </p>
          </>
        )}
      </div>
    </div>
  )
}
