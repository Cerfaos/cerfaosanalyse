import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Bike, Dumbbell, Loader2, PlayCircle, GripVertical, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { SessionPlayer } from './SessionPlayer'
import { PpgSessionPlayer } from './PpgSessionPlayer'
import { useTrainingStore } from '../../store/trainingStore'
import type { PlannedSession, TrainingSession, TrainingTemplate, SessionCategory } from '../../types/training'

// Type pour le drag and drop
interface DragData {
  plannedId: number
  sessionName: string
  sourceDate: string
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

interface SessionPickerProps {
  plannedForDate: PlannedSession[]
  sessions: TrainingSession[]
  templates: TrainingTemplate[]
  onAdd: (sessionId: number) => void
  onAddFromTemplate: (template: TrainingTemplate) => void
  onRemove: (plannedId: number) => void
  onPlay: (session: TrainingSession) => void
}

type SourceTab = 'sessions' | 'templates'
type CategoryFilter = 'all' | SessionCategory

function SessionPicker({
  plannedForDate,
  sessions,
  templates,
  onAdd,
  onAddFromTemplate,
  onRemove,
  onPlay,
}: SessionPickerProps) {
  const [sourceTab, setSourceTab] = useState<SourceTab>('sessions')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Trouver la session complète (avec blocks/exercises)
  const findFullSession = (planned: PlannedSession): TrainingSession | null => {
    // Chercher d'abord dans la liste des sessions (données complètes)
    const fromList = sessions.find((s) => Number(s.id) === Number(planned.sessionId))
    if (fromList && (fromList.blocks?.length || fromList.exercises?.length)) {
      return fromList
    }
    // Sinon utiliser la session preloaded
    if (planned.session) {
      return planned.session as TrainingSession
    }
    return fromList || null
  }

  // Vérifier si une séance peut être jouée
  const canPlay = (session: TrainingSession) => {
    if (session.category === 'cycling') {
      return session.blocks && session.blocks.length > 0
    }
    return session.exercises && session.exercises.length > 0
  }

  // Filtrer les séances
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (categoryFilter !== 'all' && session.category !== categoryFilter) return false
      if (searchQuery && !session.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [sessions, categoryFilter, searchQuery])

  // Filtrer les templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (categoryFilter !== 'all' && template.category !== categoryFilter) return false
      if (weekFilter !== null && template.week !== weekFilter) return false
      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [templates, categoryFilter, weekFilter, searchQuery])

  // Extraire les semaines disponibles des templates
  const availableWeeks = useMemo(() => {
    const weeks = new Set<number>()
    templates.forEach((t) => {
      if (t.week !== null) weeks.add(t.week)
    })
    return Array.from(weeks).sort((a, b) => a - b)
  }, [templates])

  return (
    <div className="space-y-4">
      {/* Séances planifiées */}
      {plannedForDate.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-300 mb-3">Séances planifiées</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {plannedForDate.map((planned) => {
              const session = findFullSession(planned)
              if (!session) return null
              const color = session.category === 'cycling' ? '#8BC34A' : '#5CE1E6'
              return (
                <div
                  key={planned.id}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {session.category === 'cycling' ? (
                      <Bike className="h-4 w-4 text-[#8BC34A]" />
                    ) : (
                      <Dumbbell className="h-4 w-4 text-[#5CE1E6]" />
                    )}
                    <span className="font-medium text-white">{session.name}</span>
                    {planned.completed && (
                      <span className="text-xs text-green-500 font-medium">✓ Fait</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {canPlay(session) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPlay(session)}
                        title="Lancer la séance"
                        style={{ color }}
                        className="hover:bg-white/10"
                      >
                        <PlayCircle className="h-5 w-5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onRemove(planned.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ajouter une séance */}
      <div>
        <h4 className="font-medium text-gray-300 mb-3">Ajouter une séance</h4>

        {/* Onglets Séances / Modèles */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSourceTab('sessions')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sourceTab === 'sessions'
                ? 'bg-[#8BC34A] text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Mes séances ({sessions.length})
          </button>
          <button
            onClick={() => setSourceTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sourceTab === 'templates'
                ? 'bg-[#8BC34A] text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Modèles ({templates.length})
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8BC34A]/50"
            />
          </div>

          {/* Filtre catégorie */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8BC34A]/50"
          >
            <option value="all">Toutes catégories</option>
            <option value="cycling">🚴 Vélo</option>
            <option value="ppg">🏋️ PPG</option>
          </select>

          {/* Filtre semaine (uniquement pour templates) */}
          {sourceTab === 'templates' && availableWeeks.length > 0 && (
            <select
              value={weekFilter ?? ''}
              onChange={(e) => setWeekFilter(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8BC34A]/50"
            >
              <option value="">Toutes semaines</option>
              {availableWeeks.map((week) => (
                <option key={week} value={week}>
                  Semaine {week}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Liste des séances */}
        {sourceTab === 'sessions' && (
          <>
            {filteredSessions.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                {sessions.length === 0
                  ? 'Créez d\'abord des séances dans l\'onglet "Mes séances".'
                  : 'Aucune séance ne correspond aux filtres.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 cursor-pointer bg-white/5 border border-white/10 rounded-lg hover:border-[#8BC34A]/50 transition-colors"
                    onClick={() => onAdd(session.id)}
                  >
                    <div className="flex items-center gap-2">
                      {session.category === 'cycling' ? (
                        <Bike className="h-4 w-4 text-[#8BC34A]" />
                      ) : (
                        <Dumbbell className="h-4 w-4 text-[#5CE1E6]" />
                      )}
                      <span className="font-medium text-sm text-white truncate">{session.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDuration(session.duration)} • TSS {session.tss || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Liste des templates */}
        {sourceTab === 'templates' && (
          <>
            {filteredTemplates.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                {templates.length === 0
                  ? 'Aucun modèle disponible.'
                  : 'Aucun modèle ne correspond aux filtres.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 cursor-pointer bg-white/5 border border-white/10 rounded-lg hover:border-[#8BC34A]/50 transition-colors"
                    onClick={() => onAddFromTemplate(template)}
                  >
                    <div className="flex items-center gap-2">
                      {template.category === 'cycling' ? (
                        <Bike className="h-4 w-4 text-[#8BC34A]" />
                      ) : (
                        <Dumbbell className="h-4 w-4 text-[#5CE1E6]" />
                      )}
                      <span className="font-medium text-sm text-white truncate">{template.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {formatDuration(template.duration)} • TSS {template.tss || 0}
                      </p>
                      {template.week && (
                        <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-gray-300">
                          S{template.week}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Calendrier mensuel de planification
 */
export function PlanningCalendar() {
  const {
    planning,
    sessions,
    templates,
    profile,
    currentMonth,
    currentYear,
    setCurrentMonth,
    addToPlanning,
    removeFromPlanning,
    moveSession,
    createSession,
  } = useTrainingStore()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [playingSession, setPlayingSession] = useState<TrainingSession | null>(null)
  const [dragData, setDragData] = useState<DragData | null>(null)
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null)
  const dragImageRef = useRef<HTMLDivElement>(null)

  const month = currentMonth - 1 // JS months are 0-indexed
  const year = currentYear
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Charger le planning, les sessions et les templates au montage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const { planningApi, sessionsApi, templatesApi } = await import('../../services/trainingApi')
        // Charger le planning, les sessions et les templates en parallèle
        const [planningResponse, sessionsData, templatesData] = await Promise.all([
          planningApi.getByMonth(currentMonth, currentYear),
          sessionsApi.list(),
          templatesApi.list(),
        ])
        useTrainingStore.setState({
          planning: planningResponse.planning,
          sessions: sessionsData,
          templates: templatesData,
        })
      } catch (error) {
        console.error('Erreur chargement planning:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [currentMonth, currentYear])

  // Navigation
  const goToPrevMonth = () => {
    if (month === 0) {
      setCurrentMonth(12, year - 1)
    } else {
      setCurrentMonth(month, year)
    }
  }

  const goToNextMonth = () => {
    if (month === 11) {
      setCurrentMonth(1, year + 1)
    } else {
      setCurrentMonth(month + 2, year)
    }
  }

  // Obtenir les séances pour une date
  const getSessionsForDate = (day: number): PlannedSession[] => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return planning[dateKey] || []
  }

  const handleDateClick = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateKey)
    setShowPicker(true)
  }

  const handleAddSession = async (sessionId: number) => {
    if (selectedDate) {
      try {
        await addToPlanning(sessionId, selectedDate)
        toast.success('Séance ajoutée au planning')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de l\'ajout'
        toast.error(message)
      }
    }
  }

  const handleRemoveSession = async (plannedId: number) => {
    try {
      await removeFromPlanning(plannedId)
      toast.success('Séance retirée du planning')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  // Ajouter une séance à partir d'un template
  const handleAddFromTemplate = async (template: TrainingTemplate) => {
    if (selectedDate) {
      try {
        // Créer une nouvelle séance à partir du template
        const newSession = await createSession({
          name: template.name,
          category: template.category,
          level: template.level,
          location: template.location || undefined,
          intensityRef: template.intensityRef,
          duration: template.duration,
          tss: template.tss || undefined,
          description: template.description || undefined,
          blocks: template.blocks || undefined,
          exercises: template.exercises || undefined,
          templateId: template.id,
        })
        // Ajouter la nouvelle séance au planning
        await addToPlanning(newSession.id, selectedDate)
        toast.success('Séance créée et ajoutée au planning')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de la création'
        toast.error(message)
      }
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, planned: PlannedSession, dateKey: string, sessionName: string) => {
    const data: DragData = {
      plannedId: planned.id,
      sessionName,
      sourceDate: dateKey,
    }
    setDragData(data)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(data))

    // Custom drag image
    if (dragImageRef.current) {
      dragImageRef.current.textContent = sessionName
      e.dataTransfer.setDragImage(dragImageRef.current, 0, 0)
    }
  }

  const handleDragEnd = () => {
    setDragData(null)
    setDropTargetDate(null)
  }

  const handleDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dropTargetDate !== dateKey) {
      setDropTargetDate(dateKey)
    }
  }

  const handleDragLeave = () => {
    setDropTargetDate(null)
  }

  const handleDrop = async (e: React.DragEvent, targetDateKey: string) => {
    e.preventDefault()
    setDropTargetDate(null)

    if (!dragData) return
    if (dragData.sourceDate === targetDateKey) {
      setDragData(null)
      return
    }

    try {
      await moveSession(dragData.plannedId, targetDateKey)
      toast.success(`Séance déplacée au ${new Date(targetDateKey).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`)
    } catch (error) {
      toast.error('Erreur lors du déplacement')
    }
    setDragData(null)
  }

  // Construire le calendrier
  const days = useMemo(() => {
    const result: React.ReactNode[] = []

    // Jours vides avant le premier jour
    for (let i = 0; i < firstDay; i++) {
      result.push(<div key={`empty-${i}`} className="h-24" />)
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const daySessions = getSessionsForDate(day)
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString()
      const dayTss = daySessions.reduce((sum, p) => {
        const session = sessions.find((s) => Number(s.id) === Number(p.sessionId)) || p.session
        return sum + (session?.tss || 0)
      }, 0)
      const isDropTarget = dropTargetDate === dateKey
      const isDragging = dragData !== null

      result.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          onDragOver={(e) => handleDragOver(e, dateKey)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, dateKey)}
          className={`h-24 border border-border p-1 cursor-pointer transition-all ${
            isToday ? 'bg-primary/10' : ''
          } ${isDropTarget ? 'bg-primary/20 border-primary border-2' : 'hover:bg-muted/50'} ${
            isDragging && !isDropTarget ? 'opacity-70' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-text-primary'}`}
            >
              {day}
            </span>
            {dayTss > 0 && (
              <span className="text-xs text-primary font-medium">TSS {dayTss}</span>
            )}
          </div>
          <div className="space-y-1 mt-1 overflow-hidden">
            {daySessions.slice(0, 2).map((planned) => {
              const session = sessions.find((s) => Number(s.id) === Number(planned.sessionId)) || planned.session
              if (!session) return null
              const color = session.category === 'cycling' ? '#8BC34A' : '#5CE1E6'
              return (
                <div
                  key={planned.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, planned, dateKey, session.name)}
                  onDragEnd={handleDragEnd}
                  className="group flex items-center gap-0.5 px-1 py-0.5 rounded text-xs font-medium truncate cursor-grab active:cursor-grabbing"
                  style={{ backgroundColor: `${color}20`, color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                  <span className="truncate">
                    {session.category === 'cycling' ? '🚴' : '🏋️'} {session.name}
                  </span>
                </div>
              )
            })}
            {daySessions.length > 2 && (
              <div className="text-xs text-text-muted">+{daySessions.length - 2}</div>
            )}
          </div>
        </div>
      )
    }

    return result
  }, [planning, sessions, year, month, daysInMonth, firstDay, dragData, dropTargetDate, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop, handleDateClick])

  const plannedForSelectedDate = selectedDate ? planning[selectedDate] || [] : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {MONTHS_FR[month]} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendrier */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#8BC34A] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* En-têtes jours */}
          {DAYS_FR.map((day) => (
            <div
              key={day}
              className="bg-muted py-2 text-center text-sm font-medium text-text-secondary"
            >
              {day}
            </div>
          ))}

          {/* Grille des jours */}
          <div className="col-span-7 grid grid-cols-7 gap-px bg-border">
            {days.map((day, idx) => (
              <div key={idx} className="bg-background">
                {day}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog pour ajouter/gérer les séances */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Planifier -{' '}
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <SessionPicker
              plannedForDate={plannedForSelectedDate}
              sessions={sessions}
              templates={templates}
              onAdd={handleAddSession}
              onAddFromTemplate={handleAddFromTemplate}
              onRemove={handleRemoveSession}
              onPlay={(session) => {
                setShowPicker(false)
                setPlayingSession(session)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Session Player - Cycling */}
      {playingSession && playingSession.category === 'cycling' && (
        <SessionPlayer
          session={playingSession}
          ftp={profile.ftp || 200}
          open={!!playingSession}
          onOpenChange={(open) => !open && setPlayingSession(null)}
        />
      )}

      {/* Session Player - PPG */}
      {playingSession && playingSession.category === 'ppg' && (
        <PpgSessionPlayer
          session={playingSession}
          open={!!playingSession}
          onOpenChange={(open) => !open && setPlayingSession(null)}
        />
      )}

      {/* Hidden drag image */}
      <div
        ref={dragImageRef}
        className="fixed -top-96 left-0 px-3 py-1.5 bg-primary text-black text-sm font-medium rounded-lg shadow-lg pointer-events-none"
      />
    </div>
  )
}

export default PlanningCalendar
