import { useState } from 'react'
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, Repeat, Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Card } from '../ui/Card'
import { SessionGraph, ZoneBadge } from './SessionGraph'
import type {
  CyclingBlock,
  PpgExercise,
  BlockType,
  SessionCategory,
  IntervalSet,
} from '../../types/training'
import {
  BLOCK_TYPE_LABELS,
  percentFtpToWatts,
  intervalSetToBlocks,
  calculateIntervalSetDuration,
  secondsToDuration,
} from '../../types/training'

interface BlockEditorProps {
  blocks: CyclingBlock[] | PpgExercise[]
  onChange: (blocks: CyclingBlock[] | PpgExercise[]) => void
  category: SessionCategory
  ftp: number
  weight: number
}

const BLOCK_TYPES: { id: BlockType; label: string }[] = [
  { id: 'warmup', label: BLOCK_TYPE_LABELS.warmup },
  { id: 'interval', label: BLOCK_TYPE_LABELS.interval },
  { id: 'effort', label: BLOCK_TYPE_LABELS.effort },
  { id: 'recovery', label: BLOCK_TYPE_LABELS.recovery },
  { id: 'cooldown', label: BLOCK_TYPE_LABELS.cooldown },
]

// Mode d'édition des intervalles
type EditorMode = 'simple' | 'interval'

// État initial pour un nouvel intervalle
const DEFAULT_INTERVAL: IntervalSet = {
  effortDuration: '02:00',
  effortPercentFtp: 110,
  recoveryDuration: '01:00',
  recoveryPercentFtp: 50,
  reps: 5,
  notes: '',
}

/**
 * Éditeur de blocs d'entraînement (cycling ou PPG)
 */
export function BlockEditor({ blocks, onChange, category, ftp, weight }: BlockEditorProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>('simple')
  const [intervalForm, setIntervalForm] = useState<IntervalSet>(DEFAULT_INTERVAL)

  // Calculer les stats de l'intervalle
  const intervalTotalSeconds = calculateIntervalSetDuration(intervalForm)
  const intervalTotalDuration = secondsToDuration(intervalTotalSeconds)

  // Estimer le TSS de l'intervalle (approximatif)
  const estimatedIntervalTss = Math.round(
    ((intervalForm.effortPercentFtp / 100) ** 2 * intervalForm.reps * parseInt(intervalForm.effortDuration.split(':')[0]) +
      (intervalForm.recoveryPercentFtp / 100) ** 2 * (intervalForm.reps - 1) * parseInt(intervalForm.recoveryDuration.split(':')[0])) *
      (100 / 60)
  )

  // Ajouter les blocs générés par l'intervalle
  const addIntervalBlocks = () => {
    if (category !== 'cycling') return

    const generatedBlocks = intervalSetToBlocks(intervalForm)
    onChange([...(blocks as CyclingBlock[]), ...generatedBlocks])

    // Reset le formulaire
    setIntervalForm(DEFAULT_INTERVAL)
  }

  const addBlock = () => {
    if (category === 'cycling') {
      const newBlock: CyclingBlock = {
        type: 'warmup',
        duration: '05:00',
        percentFtp: 50,
        reps: 1,
        notes: '',
      }
      onChange([...blocks, newBlock] as CyclingBlock[])
    } else {
      const newExercise: PpgExercise = {
        name: 'Exercice',
        duration: '00:30',
        reps: 10,
        sets: 3,
        rest: '00:30',
        hrTarget: '',
        notes: '',
      }
      onChange([...blocks, newExercise] as PpgExercise[])
    }
  }

  const updateCyclingBlock = (index: number, field: keyof CyclingBlock, value: CyclingBlock[keyof CyclingBlock]) => {
    const updated = [...blocks] as CyclingBlock[]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const updatePpgExercise = (index: number, field: keyof PpgExercise, value: PpgExercise[keyof PpgExercise]) => {
    const updated = [...blocks] as PpgExercise[]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeBlock = (index: number) => {
    if (category === 'cycling') {
      onChange((blocks as CyclingBlock[]).filter((_, i) => i !== index))
    } else {
      onChange((blocks as PpgExercise[]).filter((_, i) => i !== index))
    }
  }

  const duplicateBlock = (index: number) => {
    if (category === 'cycling') {
      const newBlocks = [...blocks] as CyclingBlock[]
      newBlocks.splice(index + 1, 0, { ...newBlocks[index] })
      onChange(newBlocks)
    } else {
      const newBlocks = [...blocks] as PpgExercise[]
      newBlocks.splice(index + 1, 0, { ...newBlocks[index] })
      onChange(newBlocks)
    }
  }

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === blocks.length - 1)
    ) {
      return
    }
    if (category === 'cycling') {
      const newBlocks = [...blocks] as CyclingBlock[]
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[index + direction]
      newBlocks[index + direction] = temp
      onChange(newBlocks)
    } else {
      const newBlocks = [...blocks] as PpgExercise[]
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[index + direction]
      newBlocks[index + direction] = temp
      onChange(newBlocks)
    }
  }

  // Éditeur PPG
  if (category === 'ppg') {
    const exercises = blocks as PpgExercise[]
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-text-primary">Exercices</h4>
          <Button type="button" variant="outline" size="sm" onClick={addBlock}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>

        {exercises.map((exercise, idx) => (
          <Card key={idx} className="p-3 sm:p-4">
            <div className="space-y-3">
              {/* Ligne 1 : Nom + Actions */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Nom de l'exercice
                  </label>
                  <Input
                    value={exercise.name}
                    onChange={(e) => updatePpgExercise(idx, 'name', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex items-end gap-0.5 pt-5 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => moveBlock(idx, -1)}
                    disabled={idx === 0}
                    title="Monter"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => moveBlock(idx, 1)}
                    disabled={idx === exercises.length - 1}
                    title="Descendre"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => duplicateBlock(idx)}
                    title="Dupliquer"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => removeBlock(idx)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Ligne 2 : Paramètres */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="w-16">
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Durée
                  </label>
                  <Input
                    value={exercise.duration}
                    onChange={(e) => updatePpgExercise(idx, 'duration', e.target.value)}
                    placeholder="00:30"
                    className="h-9"
                  />
                </div>
                <div className="w-14">
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Reps
                  </label>
                  <Input
                    type="number"
                    value={exercise.reps ?? ''}
                    onChange={(e) =>
                      updatePpgExercise(idx, 'reps', e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="h-9"
                  />
                </div>
                <div className="w-14">
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Séries
                  </label>
                  <Input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updatePpgExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                    className="h-9"
                  />
                </div>
                <div className="w-16">
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Repos
                  </label>
                  <Input
                    value={exercise.rest}
                    onChange={(e) => updatePpgExercise(idx, 'rest', e.target.value)}
                    placeholder="00:30"
                    className="h-9"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Notes
                  </label>
                  <Input
                    value={exercise.notes}
                    onChange={(e) => updatePpgExercise(idx, 'notes', e.target.value)}
                    placeholder="Instructions..."
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Éditeur Cycling
  const cyclingBlocks = blocks as CyclingBlock[]

  return (
    <div className="space-y-4">
      {/* Header avec toggle de mode */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="font-medium text-text-primary">Blocs d'entraînement</h4>
            <div className="text-sm text-text-secondary">
              FTP: <span className="font-semibold text-primary">{ftp}W</span>
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-border rounded-lg p-1">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                editorMode === 'simple'
                  ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setEditorMode('simple')}
            >
              <Plus className="h-4 w-4" />
              Simple
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                editorMode === 'interval'
                  ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setEditorMode('interval')}
            >
              <Repeat className="h-4 w-4" />
              Intervalle
            </button>
          </div>
        </div>

        {/* Mode Intervalle : Créateur d'intervalles */}
        {editorMode === 'interval' && (
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <h5 className="font-semibold text-orange-700 dark:text-orange-300 text-sm sm:text-base">
                Créateur d'intervalles rapide
              </h5>
            </div>

            <div className="space-y-4">
              {/* Effort + Récupération en flex wrap */}
              <div className="flex flex-wrap gap-4">
                {/* Effort */}
                <div className="flex-1 min-w-[200px] space-y-2 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg">
                  <div className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Effort
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="w-20">
                      <label className="block text-xs text-text-secondary mb-1">Durée</label>
                      <Input
                        value={intervalForm.effortDuration}
                        onChange={(e) =>
                          setIntervalForm({ ...intervalForm, effortDuration: e.target.value })
                        }
                        placeholder="02:00"
                        className="h-9 border-orange-200"
                      />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                      <label className="block text-xs text-text-secondary mb-1">% FTP</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={intervalForm.effortPercentFtp}
                          onChange={(e) =>
                            setIntervalForm({
                              ...intervalForm,
                              effortPercentFtp: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-9 w-16 border-orange-200"
                        />
                        <span className="text-sm font-semibold text-orange-600 whitespace-nowrap">
                          {percentFtpToWatts(intervalForm.effortPercentFtp, ftp)}W
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Récupération */}
                <div className="flex-1 min-w-[200px] space-y-2 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Récupération
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="w-20">
                      <label className="block text-xs text-text-secondary mb-1">Durée</label>
                      <Input
                        value={intervalForm.recoveryDuration}
                        onChange={(e) =>
                          setIntervalForm({ ...intervalForm, recoveryDuration: e.target.value })
                        }
                        placeholder="01:00"
                        className="h-9 border-blue-200"
                      />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                      <label className="block text-xs text-text-secondary mb-1">% FTP</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={intervalForm.recoveryPercentFtp}
                          onChange={(e) =>
                            setIntervalForm({
                              ...intervalForm,
                              recoveryPercentFtp: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-9 w-16 border-blue-200"
                        />
                        <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                          {percentFtpToWatts(intervalForm.recoveryPercentFtp, ftp)}W
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Répétitions + Notes + Bouton */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-20">
                  <label className="block text-xs text-text-secondary mb-1">Répétitions</label>
                  <Input
                    type="number"
                    value={intervalForm.reps}
                    onChange={(e) =>
                      setIntervalForm({ ...intervalForm, reps: parseInt(e.target.value) || 1 })
                    }
                    min={1}
                    max={20}
                    className="h-9"
                  />
                </div>

                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-text-secondary mb-1">Notes</label>
                  <Input
                    value={intervalForm.notes || ''}
                    onChange={(e) => setIntervalForm({ ...intervalForm, notes: e.target.value })}
                    placeholder="ex: Sprint, VO2max..."
                    className="h-9"
                  />
                </div>

                {/* Stats + Bouton */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-xs text-text-secondary hidden sm:block">
                    <div className="font-semibold text-text-primary">{intervalTotalDuration}</div>
                    <div>~{estimatedIntervalTss} TSS</div>
                  </div>
                  <Button
                    type="button"
                    className="h-9 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white whitespace-nowrap"
                    onClick={addIntervalBlocks}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ajouter </span>{intervalForm.reps * 2 - 1} blocs
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Mode Simple : Bouton d'ajout */}
        {editorMode === 'simple' && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={addBlock}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter un bloc
            </Button>
          </div>
        )}
      </div>

      {cyclingBlocks.length > 0 && (
        <SessionGraph blocks={cyclingBlocks} ftp={ftp} height="h-32" />
      )}

      {cyclingBlocks.map((block, idx) => {
        const watts = percentFtpToWatts(block.percentFtp, ftp)
        const wattsPerKg = weight > 0 ? (watts / weight).toFixed(2) : '0'

        return (
          <Card key={idx} className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Indicateur de zone coloré */}
              <div
                className="w-1.5 self-stretch rounded-full flex-shrink-0 min-h-[80px]"
                style={{ backgroundColor: `var(--color-zone-${block.percentFtp <= 55 ? 1 : block.percentFtp <= 75 ? 2 : block.percentFtp <= 90 ? 3 : block.percentFtp <= 105 ? 4 : block.percentFtp <= 120 ? 5 : 6})` }}
              />

              <div className="flex-1 min-w-0">
                {/* Ligne principale : Type, Durée, %FTP, Puissance */}
                <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                  {/* Type */}
                  <div className="w-28 sm:w-32">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Type
                    </label>
                    <Select
                      value={block.type}
                      onValueChange={(value) => updateCyclingBlock(idx, 'type', value as BlockType)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOCK_TYPES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Durée */}
                  <div className="w-20">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Durée
                    </label>
                    <Input
                      value={block.duration}
                      onChange={(e) => updateCyclingBlock(idx, 'duration', e.target.value)}
                      placeholder="05:00"
                      className="h-9"
                    />
                  </div>

                  {/* % FTP + Zone badge */}
                  <div className="w-24">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      % FTP
                    </label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={block.percentFtp}
                        onChange={(e) =>
                          updateCyclingBlock(idx, 'percentFtp', parseInt(e.target.value) || 0)
                        }
                        className="h-9 w-16"
                      />
                      <ZoneBadge percentFtp={block.percentFtp} />
                    </div>
                  </div>

                  {/* Puissance calculée */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Puissance
                    </label>
                    <div className="h-9 px-2.5 py-1.5 bg-primary/10 border border-primary/20 rounded-md flex items-center whitespace-nowrap">
                      <span className="font-bold text-primary text-sm">{watts}W</span>
                      <span className="text-xs text-primary/70 ml-1 hidden sm:inline">({wattsPerKg})</span>
                    </div>
                  </div>

                  {/* Répétitions */}
                  <div className="w-14">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Rép.
                    </label>
                    <Input
                      type="number"
                      value={block.reps}
                      onChange={(e) => updateCyclingBlock(idx, 'reps', parseInt(e.target.value) || 1)}
                      className="h-9"
                    />
                  </div>

                  {/* Spacer pour pousser les actions à droite */}
                  <div className="flex-1 min-w-0" />

                  {/* Actions - toujours visibles et bien espacées */}
                  <div className="flex items-end gap-0.5 flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => moveBlock(idx, -1)}
                      disabled={idx === 0}
                      title="Monter"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => moveBlock(idx, 1)}
                      disabled={idx === cyclingBlocks.length - 1}
                      title="Descendre"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => duplicateBlock(idx)}
                      title="Dupliquer"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeBlock(idx)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-2">
                  <Input
                    value={block.notes}
                    onChange={(e) => updateCyclingBlock(idx, 'notes', e.target.value)}
                    placeholder="Notes pour ce bloc..."
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default BlockEditor
