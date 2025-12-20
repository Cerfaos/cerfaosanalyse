import { useState, useEffect } from 'react'
import { Bike, Dumbbell, Zap, Save } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { BlockEditor } from './BlockEditor'
import { useTrainingStore } from '../../store/trainingStore'
import type {
  TrainingTemplate,
  CreateTemplateData,
  CyclingBlock,
  PpgExercise,
  SessionCategory,
  SessionLevel,
  SessionLocation,
} from '../../types/training'
import { LEVEL_LABELS, LOCATION_LABELS } from '../../types/training'

interface TemplateFormProps {
  template?: TrainingTemplate | null
  onSave: (data: CreateTemplateData) => void
  onCancel: () => void
}

const LEVEL_OPTIONS: { id: SessionLevel; label: string }[] = [
  { id: 'beginner', label: LEVEL_LABELS.beginner },
  { id: 'intermediate', label: LEVEL_LABELS.intermediate },
  { id: 'expert', label: LEVEL_LABELS.expert },
]

const LOCATION_OPTIONS: { id: SessionLocation; label: string }[] = [
  { id: 'indoor', label: LOCATION_LABELS.indoor },
  { id: 'outdoor', label: LOCATION_LABELS.outdoor },
  { id: 'both', label: LOCATION_LABELS.both },
]

/**
 * Formulaire de création/édition de template
 */
export function TemplateForm({ template, onSave, onCancel }: TemplateFormProps) {
  const { profile } = useTrainingStore()

  const [formData, setFormData] = useState<{
    name: string
    category: SessionCategory
    level: SessionLevel
    location: SessionLocation
    intensityRef: string
    week: number
    duration: number
    tss: number
    description: string
    blocks: CyclingBlock[]
    exercises: PpgExercise[]
  }>({
    name: '',
    category: 'cycling',
    level: 'intermediate',
    location: 'both',
    intensityRef: 'ftp',
    week: 1,
    duration: 60,
    tss: 50,
    description: '',
    blocks: [],
    exercises: [],
  })

  // Initialiser avec le template existant
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        level: template.level,
        location: template.location || 'both',
        intensityRef: template.intensityRef || 'ftp',
        week: template.week || 1,
        duration: template.duration,
        tss: template.tss || 0,
        description: template.description || '',
        blocks: template.blocks ? [...template.blocks] : [],
        exercises: template.exercises ? [...template.exercises] : [],
      })
    }
  }, [template])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const ftp = profile.ftp || 200
  const weight = profile.weight || 75

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info */}
      <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2">
        <Zap className="text-primary h-5 w-5" />
        <span className="text-sm text-primary">
          Les intensités sont stockées en <strong>% FTP</strong>. Elles s'adapteront
          automatiquement à chaque utilisateur.
        </span>
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Catégorie</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, category: 'cycling', blocks: [], exercises: [] })
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              formData.category === 'cycling'
                ? 'border-[#8BC34A] bg-[#8BC34A]/10 text-[#8BC34A]'
                : 'border-border hover:border-[#8BC34A]/50'
            }`}
          >
            <Bike className="h-5 w-5" />
            Cyclisme
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, category: 'ppg', blocks: [], exercises: [] })
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              formData.category === 'ppg'
                ? 'border-[#5CE1E6] bg-[#5CE1E6]/10 text-[#5CE1E6]'
                : 'border-border hover:border-[#5CE1E6]/50'
            }`}
          >
            <Dumbbell className="h-5 w-5" />
            PPG
          </button>
        </div>
      </div>

      {/* Nom et semaine */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nom du modèle
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Semaine</label>
          <Input
            type="number"
            min="1"
            max="52"
            value={formData.week}
            onChange={(e) =>
              setFormData({ ...formData, week: parseInt(e.target.value) || 1 })
            }
          />
        </div>
      </div>

      {/* Niveau et lieu */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Niveau</label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({ ...formData, level: value as SessionLevel })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formData.category === 'cycling' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Lieu</label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                setFormData({ ...formData, location: value as SessionLocation })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Durée et TSS pour cycling */}
      {formData.category === 'cycling' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Durée estimée
            </label>
            <div className="relative">
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                min
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              TSS estimé
            </label>
            <Input
              type="number"
              value={formData.tss}
              onChange={(e) => setFormData({ ...formData, tss: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Éditeur de blocs */}
      <BlockEditor
        blocks={formData.category === 'cycling' ? formData.blocks : formData.exercises}
        onChange={(data) =>
          setFormData({
            ...formData,
            [formData.category === 'cycling' ? 'blocks' : 'exercises']: data,
          })
        }
        category={formData.category}
        ftp={ftp}
        weight={weight}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </form>
  )
}

export default TemplateForm
