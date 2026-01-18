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
  TrainingSession,
  TrainingTemplate,
  CreateSessionData,
  CyclingBlock,
  PpgExercise,
  SessionCategory,
  SessionLevel,
  SessionLocation,
} from '../../types/training'
import { LEVEL_LABELS, LOCATION_LABELS } from '../../types/training'

interface SessionFormProps {
  session?: TrainingSession | null
  templateToUse?: TrainingTemplate | null
  onSave: (data: CreateSessionData) => void
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
 * Formulaire de création/édition de séance
 */
export function SessionForm({ session, templateToUse, onSave, onCancel }: SessionFormProps) {
  const { templates, profile } = useTrainingStore()

  const [formData, setFormData] = useState<{
    name: string
    category: SessionCategory
    level: SessionLevel
    location: SessionLocation
    intensityRef: string
    duration: number
    tss: number
    description: string
    blocks: CyclingBlock[]
    exercises: PpgExercise[]
    templateId?: number
    week?: number
    day?: number
  }>({
    name: '',
    category: 'cycling',
    level: 'intermediate',
    location: 'both',
    intensityRef: 'ftp',
    duration: 60,
    tss: 50,
    description: '',
    blocks: [],
    exercises: [],
    week: undefined,
    day: undefined,
  })

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  // Initialiser avec la session ou le template
  useEffect(() => {
    if (session) {
      setFormData({
        name: session.name,
        category: session.category,
        level: session.level,
        location: session.location || 'both',
        intensityRef: session.intensityRef || 'ftp',
        duration: session.duration,
        tss: session.tss || 0,
        description: session.description || '',
        blocks: session.blocks ? [...session.blocks] : [],
        exercises: session.exercises ? [...session.exercises] : [],
        templateId: session.templateId || undefined,
        week: session.week || undefined,
        day: session.day || undefined,
      })
    } else if (templateToUse) {
      setFormData({
        name: templateToUse.name,
        category: templateToUse.category,
        level: templateToUse.level,
        location: templateToUse.location || 'both',
        intensityRef: templateToUse.intensityRef || 'ftp',
        duration: templateToUse.duration,
        tss: templateToUse.tss || 0,
        description: templateToUse.description || '',
        blocks: templateToUse.blocks ? JSON.parse(JSON.stringify(templateToUse.blocks)) : [],
        exercises: templateToUse.exercises
          ? JSON.parse(JSON.stringify(templateToUse.exercises))
          : [],
        templateId: templateToUse.id,
        week: templateToUse.week || undefined,
        day: templateToUse.day || undefined,
      })
    }
  }, [session, templateToUse])

  // Filtrer les templates par catégorie
  const filteredTemplates = templates.filter((t) => t.category === formData.category)

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId || templateId === 'none') {
      setSelectedTemplateId('')
      return
    }

    const template = templates.find((t) => t.id === parseInt(templateId))
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        level: template.level,
        location: template.location || formData.location,
        intensityRef: template.intensityRef || formData.intensityRef,
        duration: template.duration,
        tss: template.tss || 0,
        description: template.description || '',
        blocks: template.blocks ? JSON.parse(JSON.stringify(template.blocks)) : [],
        exercises: template.exercises ? JSON.parse(JSON.stringify(template.exercises)) : [],
        templateId: template.id,
        week: template.week || undefined,
        day: template.day || undefined,
      })
    }
    setSelectedTemplateId(templateId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const ftp = profile.ftp || 200
  const weight = profile.weight || 75

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info FTP - Plus compact */}
      <div className="p-2.5 bg-primary/10 rounded-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="text-primary h-4 w-4 flex-shrink-0" />
          <span className="text-sm text-primary">
            FTP: <strong>{ftp}W</strong> • Poids: <strong>{weight}kg</strong>
          </span>
        </div>
        <span className="text-sm text-primary font-medium">
          {(ftp / weight).toFixed(2)} W/kg
        </span>
      </div>

      {/* Catégorie et Template - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Catégorie
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, category: 'cycling', blocks: [], exercises: [] })
                setSelectedTemplateId('')
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                formData.category === 'cycling'
                  ? 'border-[#8BC34A] bg-[#8BC34A]/10 text-[#8BC34A]'
                  : 'border-border hover:border-[#8BC34A]/50'
              }`}
            >
              <Bike className="h-4 w-4 flex-shrink-0" />
              <span>Cyclisme</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, category: 'ppg', blocks: [], exercises: [] })
                setSelectedTemplateId('')
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm ${
                formData.category === 'ppg'
                  ? 'border-[#5CE1E6] bg-[#5CE1E6]/10 text-[#5CE1E6]'
                  : 'border-border hover:border-[#5CE1E6]/50'
              }`}
            >
              <Dumbbell className="h-4 w-4 flex-shrink-0" />
              <span>PPG</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Partir d'un modèle
          </label>
          <Select value={selectedTemplateId || 'none'} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="-- Séance vierge --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Séance vierge --</SelectItem>
              {filteredTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name} ({LEVEL_LABELS[t.level]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Informations de base */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nom de la séance
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Niveau</label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData({ ...formData, level: value as SessionLevel })}
          >
            <SelectTrigger className="h-10">
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
      </div>

      {/* Semaine et Jour */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Semaine</label>
          <Input
            type="number"
            min="1"
            max="52"
            placeholder="S"
            value={formData.week || ''}
            onChange={(e) =>
              setFormData({ ...formData, week: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Jour</label>
          <Input
            type="number"
            min="1"
            max="7"
            placeholder="J"
            value={formData.day || ''}
            onChange={(e) =>
              setFormData({ ...formData, day: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="h-10"
          />
        </div>
      </div>

      {/* Options cycling */}
      {formData.category === 'cycling' && (
        <div className="flex flex-wrap gap-3">
          <div className="w-28 sm:w-32">
            <label className="block text-sm font-medium text-text-secondary mb-1">Lieu</label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                setFormData({ ...formData, location: value as SessionLocation })
              }
            >
              <SelectTrigger className="h-10">
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
          <div className="w-24">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Durée
            </label>
            <div className="relative">
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                }
                className="h-10 pr-10"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                min
              </span>
            </div>
          </div>
          <div className="w-20">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              TSS
            </label>
            <Input
              type="number"
              value={formData.tss}
              onChange={(e) => setFormData({ ...formData, tss: parseInt(e.target.value) || 0 })}
              className="h-10"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Description / Notes
        </label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-sm"
          rows={2}
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

export default SessionForm
