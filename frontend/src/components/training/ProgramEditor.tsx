import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
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
import trainingApi from '../../services/trainingApi'
import type {
  TrainingProgram,
  CreateProgramData,
  ProgramWeek,
  ProgramSession,
  ProgramObjective,
  ProgramLevel,
  TrainingTemplate,
} from '../../types/training'
import {
  PROGRAM_OBJECTIVE_LABELS,
  DIFFICULTY_LABELS,
  WEEK_THEME_LABELS,
  DAYS_OF_WEEK_SHORT,
} from '../../types/training'

interface ProgramEditorProps {
  program?: TrainingProgram
  onSave: (program: TrainingProgram) => void
  onCancel: () => void
}

const WEEK_THEMES = Object.keys(WEEK_THEME_LABELS)

/**
 * Éditeur de programme d'entraînement multi-semaines
 */
export function ProgramEditor({ program, onSave, onCancel }: ProgramEditorProps) {
  const [name, setName] = useState(program?.name || '')
  const [description, setDescription] = useState(program?.description || '')
  const [objective, setObjective] = useState<ProgramObjective | ''>(program?.objective || '')
  const [level, setLevel] = useState<ProgramLevel>(program?.level || 'intermediaire')
  const [weeks, setWeeks] = useState<ProgramWeek[]>(
    program?.weeklySchedule || [{ weekNumber: 1, theme: 'Fondation', sessions: [] }]
  )
  const [templates, setTemplates] = useState<TrainingTemplate[]>([])
  const [saving, setSaving] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await trainingApi.templates.list()
      setTemplates(data)
    } catch (error) {
      // Silencieux
    }
  }

  const toggleWeekExpanded = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber)
    } else {
      newExpanded.add(weekNumber)
    }
    setExpandedWeeks(newExpanded)
  }

  const addWeek = () => {
    const newWeekNumber = weeks.length + 1
    setWeeks([...weeks, { weekNumber: newWeekNumber, theme: 'Build', sessions: [] }])
    setExpandedWeeks(new Set([...expandedWeeks, newWeekNumber]))
  }

  const removeWeek = (weekNumber: number) => {
    if (weeks.length <= 1) return
    setWeeks(
      weeks
        .filter((w) => w.weekNumber !== weekNumber)
        .map((w, idx) => ({ ...w, weekNumber: idx + 1 }))
    )
  }

  const updateWeekTheme = (weekNumber: number, theme: string) => {
    setWeeks(weeks.map((w) => (w.weekNumber === weekNumber ? { ...w, theme } : w)))
  }

  const addSession = (weekNumber: number, dayOfWeek: number) => {
    if (templates.length === 0) return

    setWeeks(
      weeks.map((w) =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              sessions: [
                ...w.sessions,
                { dayOfWeek, templateId: templates[0].id, notes: '' },
              ],
            }
          : w
      )
    )
  }

  const updateSession = (
    weekNumber: number,
    dayOfWeek: number,
    field: keyof ProgramSession,
    value: any
  ) => {
    setWeeks(
      weeks.map((w) =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              sessions: w.sessions.map((s) =>
                s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
              ),
            }
          : w
      )
    )
  }

  const removeSession = (weekNumber: number, dayOfWeek: number) => {
    setWeeks(
      weeks.map((w) =>
        w.weekNumber === weekNumber
          ? { ...w, sessions: w.sessions.filter((s) => s.dayOfWeek !== dayOfWeek) }
          : w
      )
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Le nom du programme est requis')
      return
    }

    setSaving(true)
    try {
      const data: CreateProgramData = {
        name,
        description: description || undefined,
        objective: objective as ProgramObjective || undefined,
        level,
        weeklySchedule: weeks,
        durationWeeks: weeks.length,
      }

      let savedProgram: TrainingProgram
      if (program?.id) {
        savedProgram = await trainingApi.programs.update(program.id, data)
      } else {
        savedProgram = await trainingApi.programs.create(data)
      }

      onSave(savedProgram)
    } catch (error) {
      // Erreur gérée par toast
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // Calculer les stats du programme
  const totalSessions = weeks.reduce((sum, w) => sum + w.sessions.length, 0)
  const avgSessionsPerWeek = weeks.length > 0 ? (totalSessions / weeks.length).toFixed(1) : '0'

  // Calculer le TSS estimé par semaine
  const calculateWeekTss = (week: ProgramWeek) => {
    return week.sessions.reduce((sum, session) => {
      const template = templates.find((t) => t.id === session.templateId)
      return sum + (template?.tss || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          {program ? 'Modifier le programme' : 'Nouveau programme'}
        </h3>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Infos générales */}
      <Card className="p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Nom du programme *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Préparation Cyclosportive 8 semaines"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Objectif
            </label>
            <Select value={objective} onValueChange={(v) => setObjective(v as ProgramObjective)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROGRAM_OBJECTIVE_LABELS) as ProgramObjective[]).map((obj) => (
                  <SelectItem key={obj} value={obj}>
                    {PROGRAM_OBJECTIVE_LABELS[obj]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Niveau
            </label>
            <Select value={level} onValueChange={(v) => setLevel(v as ProgramLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DIFFICULTY_LABELS) as ProgramLevel[]).map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {DIFFICULTY_LABELS[lvl]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-12">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du programme..."
            />
          </div>
        </div>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{weeks.length}</div>
          <div className="text-sm text-text-secondary">Semaines</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{totalSessions}</div>
          <div className="text-sm text-text-secondary">Séances totales</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{avgSessionsPerWeek}</div>
          <div className="text-sm text-text-secondary">Séances/semaine</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">
            {weeks.reduce((sum, w) => sum + calculateWeekTss(w), 0)}
          </div>
          <div className="text-sm text-text-secondary">TSS total estimé</div>
        </Card>
      </div>

      {/* Planning par semaine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-text-primary">Planning hebdomadaire</h4>
          <Button type="button" variant="outline" size="sm" onClick={addWeek}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter une semaine
          </Button>
        </div>

        {weeks.map((week) => (
          <Card key={week.weekNumber} className="overflow-hidden">
            {/* En-tête de semaine */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border cursor-pointer"
              onClick={() => toggleWeekExpanded(week.weekNumber)}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary">S{week.weekNumber}</span>
                <Select
                  value={week.theme}
                  onValueChange={(v) => updateWeekTheme(week.weekNumber, v)}
                >
                  <SelectTrigger
                    className="w-40 h-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-text-secondary">
                  {week.sessions.length} séance(s) • ~{calculateWeekTss(week)} TSS
                </span>
              </div>

              <div className="flex items-center gap-2">
                {weeks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeWeek(week.weekNumber)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                {expandedWeeks.has(week.weekNumber) ? (
                  <ChevronUp className="h-5 w-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-secondary" />
                )}
              </div>
            </div>

            {/* Contenu de la semaine (jours) */}
            {expandedWeeks.has(week.weekNumber) && (
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                    const session = week.sessions.find((s) => s.dayOfWeek === dayOfWeek)
                    const template = session
                      ? templates.find((t) => t.id === session.templateId)
                      : null

                    return (
                      <div
                        key={dayOfWeek}
                        className="min-h-[100px] border border-border-base rounded-lg p-2"
                      >
                        <div className="text-xs font-medium text-text-secondary mb-2">
                          {DAYS_OF_WEEK_SHORT[dayOfWeek]}
                        </div>

                        {session ? (
                          <div className="space-y-2">
                            <Select
                              value={String(session.templateId)}
                              onValueChange={(v) =>
                                updateSession(week.weekNumber, dayOfWeek, 'templateId', parseInt(v))
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.map((t) => (
                                  <SelectItem key={t.id} value={String(t.id)}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {template && (
                              <div className="text-xs text-text-muted">
                                {template.duration}min • {template.tss || 0} TSS
                              </div>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full h-6 text-xs text-red-500"
                              onClick={() => removeSession(week.weekNumber, dayOfWeek)}
                            >
                              Retirer
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full h-8"
                            onClick={() => addSession(week.weekNumber, dayOfWeek)}
                            disabled={templates.length === 0}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProgramEditor
