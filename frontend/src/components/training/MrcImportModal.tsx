/**
 * Modal d'import de fichiers MRC
 */

import { Upload, X, Loader2 } from 'lucide-react'
import { useMrcImport } from '../../hooks/useMrcImport'
import { UploadStep, PreviewStep, ImportingStep, DoneStep } from './mrc-import'

interface MrcImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
  defaultImportAs?: 'template' | 'session'
}

export default function MrcImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  defaultImportAs = 'template',
}: MrcImportModalProps) {
  const {
    step,
    files,
    preview,
    importAs,
    customName,
    customLevel,
    customWeek,
    customDay,
    loading,
    batchResult,
    isDragging,
    resetState,
    setImportAs,
    setCustomName,
    setCustomLevel,
    setCustomWeek,
    setCustomDay,
    setIsDragging,
    handleFileSelect,
    handleImport,
  } = useMrcImport(defaultImportAs, onImportSuccess)

  const handleClose = () => {
    resetState()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0a191a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8BC34A]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#5CE1E6]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <ModalHeader onClose={handleClose} />

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-5">
          {step === 'upload' && (
            <UploadStep
              loading={loading}
              isDragging={isDragging}
              onDragging={setIsDragging}
              onFilesSelected={handleFileSelect}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              files={files}
              preview={preview}
              importAs={importAs}
              customName={customName}
              customLevel={customLevel}
              customWeek={customWeek}
              customDay={customDay}
              onImportAsChange={setImportAs}
              onCustomNameChange={setCustomName}
              onCustomLevelChange={setCustomLevel}
              onCustomWeekChange={setCustomWeek}
              onCustomDayChange={setCustomDay}
            />
          )}

          {step === 'importing' && <ImportingStep />}

          {step === 'done' && <DoneStep filesCount={files.length} batchResult={batchResult} />}
        </div>

        {/* Footer */}
        <ModalFooter
          step={step}
          loading={loading}
          filesCount={files.length}
          onClose={handleClose}
          onReset={resetState}
          onImport={handleImport}
        />
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative flex items-center justify-between p-5 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8BC34A] to-[#5CE1E6] flex items-center justify-center">
          <Upload className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Importer des fichiers MRC</h2>
          <p className="text-xs text-gray-400">Home trainer • Zwift • TrainerRoad</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

interface ModalFooterProps {
  step: 'upload' | 'preview' | 'importing' | 'done'
  loading: boolean
  filesCount: number
  onClose: () => void
  onReset: () => void
  onImport: () => void
}

function ModalFooter({ step, loading, filesCount, onClose, onReset, onImport }: ModalFooterProps) {
  return (
    <div className="relative flex items-center justify-end gap-3 p-5 border-t border-white/10 bg-black/20">
      {step === 'upload' && (
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
        >
          Annuler
        </button>
      )}

      {step === 'preview' && (
        <>
          <button
            onClick={onReset}
            className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
          >
            Retour
          </button>
          <button
            onClick={onImport}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#8BC34A]/25 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Importer{filesCount > 1 ? ` ${filesCount} fichiers` : ''}
          </button>
        </>
      )}

      {step === 'done' && (
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#8BC34A]/25 hover:scale-105 transition-all duration-200"
        >
          Fermer
        </button>
      )}
    </div>
  )
}
