/**
 * Hook pour gérer l'import de fichiers MRC
 */

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import trainingApi, { type MrcPreviewData, type MrcBatchResult } from '../services/trainingApi'
import type { SessionLevel } from '../types/training'

export type ImportStep = 'upload' | 'preview' | 'importing' | 'done'
export type ImportAs = 'template' | 'session'

export interface MrcImportState {
  step: ImportStep
  files: File[]
  preview: MrcPreviewData | null
  importAs: ImportAs
  customName: string
  customLevel: SessionLevel | ''
  customWeek: number | ''
  customDay: number | ''
  loading: boolean
  batchResult: MrcBatchResult | null
  isDragging: boolean
}

export interface MrcImportActions {
  resetState: () => void
  setStep: (step: ImportStep) => void
  setFiles: (files: File[]) => void
  setImportAs: (importAs: ImportAs) => void
  setCustomName: (name: string) => void
  setCustomLevel: (level: SessionLevel | '') => void
  setCustomWeek: (week: number | '') => void
  setCustomDay: (day: number | '') => void
  setIsDragging: (isDragging: boolean) => void
  handleFileSelect: (files: File[]) => Promise<void>
  handleImport: () => Promise<void>
}

export function useMrcImport(
  defaultImportAs: ImportAs = 'template',
  onImportSuccess?: () => void
): MrcImportState & MrcImportActions {
  const [step, setStep] = useState<ImportStep>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<MrcPreviewData | null>(null)
  const [importAs, setImportAs] = useState<ImportAs>(defaultImportAs)
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

  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return

    setFiles(selectedFiles)

    if (selectedFiles.length === 1) {
      setLoading(true)
      try {
        const previewData = await trainingApi.mrcImport.preview(selectedFiles[0])
        setPreview(previewData)
        setCustomName(previewData.name)
        setStep('preview')
      } catch {
        toast.error('Erreur lors de la lecture du fichier MRC')
      } finally {
        setLoading(false)
      }
    } else {
      setStep('preview')
    }
  }, [])

  const handleImport = useCallback(async () => {
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
      onImportSuccess?.()
    } catch {
      toast.error("Erreur lors de l'importation")
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }, [files, preview, customName, customLevel, customWeek, customDay, importAs, onImportSuccess])

  return {
    // State
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
    // Actions
    resetState,
    setStep,
    setFiles,
    setImportAs,
    setCustomName,
    setCustomLevel,
    setCustomWeek,
    setCustomDay,
    setIsDragging,
    handleFileSelect,
    handleImport,
  }
}
