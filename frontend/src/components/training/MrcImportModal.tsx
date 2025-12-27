import { useState, useCallback } from 'react'
import { Upload, FileText, X, Check, AlertCircle, Loader2, Bike, Dumbbell, Sparkles, Clock, Zap, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import trainingApi, { type MrcPreviewData, type MrcBatchResult } from '../../services/trainingApi'
import {
  LEVEL_LABELS,
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_COLORS,
  type SessionLevel,
} from '../../types/training'

interface MrcImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
  defaultImportAs?: 'template' | 'session'
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'done'

export default function MrcImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  defaultImportAs = 'template',
}: MrcImportModalProps) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<MrcPreviewData | null>(null)
  const [importAs, setImportAs] = useState<'template' | 'session'>(defaultImportAs)
  const [customName, setCustomName] = useState('')
  const [customLevel, setCustomLevel] = useState<SessionLevel | ''>('')
  const [customWeek, setCustomWeek] = useState<number | ''>('')
  const [customDay, setCustomDay] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [batchResult, setBatchResult] = useState<MrcBatchResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const resetState = useCallback(() => {
    setStep('upload')
    setFiles([])
    setPreview(null)
    setCustomName('')
    setCustomLevel('')
    setCustomWeek('')
    setCustomDay('')
    setLoading(false)
    setBatchResult(null)
    setIsDragging(false)
  }, [])

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setFiles(selectedFiles)

    if (selectedFiles.length === 1) {
      setLoading(true)
      try {
        const previewData = await trainingApi.mrcImport.preview(selectedFiles[0])
        setPreview(previewData)
        setCustomName(previewData.name)
        setStep('preview')
      } catch (error) {
        console.error('Erreur preview:', error)
        toast.error('Erreur lors de la lecture du fichier MRC')
      } finally {
        setLoading(false)
      }
    } else {
      setStep('preview')
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith('.mrc')
    )
    if (droppedFiles.length === 0) {
      toast.error('Veuillez déposer des fichiers .mrc')
      return
    }

    setFiles(droppedFiles)

    if (droppedFiles.length === 1) {
      setLoading(true)
      try {
        const previewData = await trainingApi.mrcImport.preview(droppedFiles[0])
        setPreview(previewData)
        setCustomName(previewData.name)
        setStep('preview')
      } catch (error) {
        console.error('Erreur preview:', error)
        toast.error('Erreur lors de la lecture du fichier MRC')
      } finally {
        setLoading(false)
      }
    } else {
      setStep('preview')
    }
  }

  const handleImport = async () => {
    setStep('importing')
    setLoading(true)

    try {
      if (files.length === 1 && preview) {
        const options = {
          name: customName || undefined,
          level: (customLevel || undefined) as SessionLevel | undefined,
          week: customWeek ? Number(customWeek) : undefined,
          day: customDay ? Number(customDay) : undefined,
        }

        if (importAs === 'template') {
          await trainingApi.mrcImport.importAsTemplate(files[0], options)
          toast.success('Template importé avec succès')
        } else {
          await trainingApi.mrcImport.importAsSession(files[0], options)
          toast.success('Séance importée avec succès')
        }
      } else {
        const result = await trainingApi.mrcImport.importBatch(files, importAs)
        setBatchResult(result)

        if (result.success.length > 0) {
          toast.success(`${result.success.length} fichier(s) importé(s)`)
        }
        if (result.errors.length > 0) {
          toast.error(`${result.errors.length} erreur(s) lors de l'import`)
        }
      }

      setStep('done')
      onImportSuccess()
    } catch (error) {
      console.error('Erreur import:', error)
      toast.error("Erreur lors de l'importation")
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0a191a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8BC34A]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#5CE1E6]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8BC34A] to-[#5CE1E6] flex items-center justify-center">
              <Upload className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Importer des fichiers MRC
              </h2>
              <p className="text-xs text-gray-400">Home trainer • Zwift • TrainerRoad</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-5">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div
              className={`relative rounded-2xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? 'scale-[1.02]'
                  : ''
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
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
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-6">
                      Format MRC compatible avec les principales applications de home trainer
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div className="space-y-5">
              {/* Fichiers sélectionnés */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5CE1E6]" />
                  {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8BC34A]/10 border border-[#8BC34A]/30 rounded-lg text-sm text-[#8BC34A]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview d'un fichier unique */}
              {preview && files.length === 1 && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-5">
                  {/* Header avec icône */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                        preview.category === 'cycling'
                          ? 'bg-gradient-to-br from-[#8BC34A]/20 to-[#8BC34A]/5 border border-[#8BC34A]/30'
                          : 'bg-gradient-to-br from-[#5CE1E6]/20 to-[#5CE1E6]/5 border border-[#5CE1E6]/30'
                      }`}
                    >
                      {preview.category === 'cycling' ? (
                        <Bike className="w-7 h-7 text-[#8BC34A]" />
                      ) : (
                        <Dumbbell className="w-7 h-7 text-[#5CE1E6]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate">{preview.name}</h3>
                      {preview.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {preview.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-center">
                      <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Durée</p>
                      <p className="font-bold text-white text-lg">{preview.duration} <span className="text-sm font-normal text-gray-400">min</span></p>
                    </div>
                    {preview.tss && (
                      <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-center">
                        <Zap className="w-4 h-4 text-[#FFAB40] mx-auto mb-1" />
                        <p className="text-xs text-gray-500 uppercase tracking-wider">TSS</p>
                        <p className="font-bold text-[#FFAB40] text-lg">{preview.tss}</p>
                      </div>
                    )}
                    <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-[#5CE1E6] mx-auto mb-1" />
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Intensité</p>
                      <p className="font-bold text-[#5CE1E6] text-lg">{preview.averageIntensity}%</p>
                    </div>
                    <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-center">
                      <Sparkles className="w-4 h-4 text-[#8BC34A] mx-auto mb-1" />
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Niveau</p>
                      <p className="font-bold text-[#8BC34A] text-lg text-sm">{LEVEL_LABELS[preview.level]}</p>
                    </div>
                  </div>

                  {/* Blocs (cycling) */}
                  {preview.blocks && preview.blocks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-3">
                        Structure de l'entraînement
                      </p>
                      <div className="flex gap-0.5 h-12 rounded-xl overflow-hidden bg-black/30 p-1">
                        {preview.blocks.map((block, index) => {
                          const durationParts = block.duration.split(':')
                          const durationMinutes =
                            parseInt(durationParts[0]) + parseInt(durationParts[1]) / 60
                          const widthPercent = (durationMinutes / preview.duration) * 100
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-center text-xs text-white font-medium rounded-lg transition-all hover:scale-y-110 cursor-default"
                              style={{
                                backgroundColor: BLOCK_TYPE_COLORS[block.type],
                                width: `${Math.max(widthPercent, 1.5)}%`,
                              }}
                              title={`${BLOCK_TYPE_LABELS[block.type]} - ${block.percentFtp}% FTP - ${block.duration}`}
                            >
                              {widthPercent > 10 && <span className="drop-shadow-md">{block.percentFtp}%</span>}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                        {Object.entries(BLOCK_TYPE_LABELS).map(([type, label]) => (
                          <span key={type} className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-sm"
                              style={{
                                backgroundColor:
                                  BLOCK_TYPE_COLORS[type as keyof typeof BLOCK_TYPE_COLORS],
                              }}
                            />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercices (PPG) */}
                  {preview.exercises && preview.exercises.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-3">
                        Exercices ({preview.exercises.length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {preview.exercises.map((exercise, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-2.5 border border-white/5"
                          >
                            <span className="font-medium text-white">{exercise.name}</span>
                            <span className="text-[#5CE1E6] font-mono text-sm">
                              {exercise.sets}x {exercise.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Options d'import */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-5">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8BC34A]" />
                  Options d'import
                </h4>

                {/* Type d'import - Style toggle */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">
                    Importer comme
                  </label>
                  <div className="flex gap-2 p-1 bg-black/30 rounded-xl">
                    <button
                      onClick={() => setImportAs('template')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        importAs === 'template'
                          ? 'bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Template
                    </button>
                    <button
                      onClick={() => setImportAs('session')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        importAs === 'session'
                          ? 'bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Séance
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {importAs === 'template'
                      ? 'Modèle réutilisable pour créer plusieurs séances'
                      : 'Utilisation unique, prêt à planifier'}
                  </p>
                </div>

                {/* Options pour fichier unique */}
                {files.length === 1 && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Nom personnalisé
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8BC34A]/50 focus:ring-1 focus:ring-[#8BC34A]/50 transition-all"
                        placeholder="Nom de la séance"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Niveau
                        </label>
                        <select
                          value={customLevel}
                          onChange={(e) => setCustomLevel(e.target.value as SessionLevel | '')}
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#8BC34A]/50 focus:ring-1 focus:ring-[#8BC34A]/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Auto</option>
                          <option value="beginner">Débutant</option>
                          <option value="intermediate">Intermédiaire</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>

                      {importAs === 'template' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Semaine
                            </label>
                            <select
                              value={customWeek}
                              onChange={(e) =>
                                setCustomWeek(e.target.value ? parseInt(e.target.value) : '')
                              }
                              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#8BC34A]/50 focus:ring-1 focus:ring-[#8BC34A]/50 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">—</option>
                              {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  S{String(i + 1).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Jour
                            </label>
                            <select
                              value={customDay}
                              onChange={(e) =>
                                setCustomDay(e.target.value ? parseInt(e.target.value) : '')
                              }
                              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#8BC34A]/50 focus:ring-1 focus:ring-[#8BC34A]/50 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">—</option>
                              {[...Array(7)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  J{String(i + 1).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
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
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center py-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8BC34A]/20 to-[#5CE1E6]/20 flex items-center justify-center">
                    <Check className="w-10 h-10 text-[#8BC34A]" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#8BC34A]/20 animate-ping" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Importation terminée
                </h3>
                <p className="text-gray-400 mt-2">
                  {files.length === 1
                    ? 'Votre fichier a été importé avec succès'
                    : `${batchResult?.success.length || files.length} fichier(s) importé(s)`}
                </p>
              </div>

              {/* Résultats batch */}
              {batchResult && (
                <div className="space-y-3">
                  {batchResult.success.length > 0 && (
                    <div className="rounded-xl bg-[#8BC34A]/10 border border-[#8BC34A]/30 p-4">
                      <p className="text-sm font-medium text-[#8BC34A] mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {batchResult.success.length} fichier{batchResult.success.length > 1 ? 's' : ''} importé{batchResult.success.length > 1 ? 's' : ''}
                      </p>
                      <div className="space-y-1.5">
                        {batchResult.success.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-[#8BC34A]/80"
                          >
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
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-red-400/80"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="font-medium">{item.fileName}:</span> {item.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-end gap-3 p-5 border-t border-white/10 bg-black/20">
          {step === 'upload' && (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={resetState}
                className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
              >
                Retour
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#8BC34A]/25 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Importer{files.length > 1 ? ` ${files.length} fichiers` : ''}
              </button>
            </>
          )}

          {step === 'done' && (
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#8BC34A]/25 hover:scale-105 transition-all duration-200"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Shimmer animation keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
