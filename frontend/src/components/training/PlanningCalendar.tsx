import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Bike, Dumbbell, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { useTrainingStore } from '../../store/trainingStore'
import type { PlannedSession, TrainingSession } from '../../types/training'

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
  onAdd: (sessionId: number) => void
  onRemove: (plannedId: number) => void
}

function SessionPicker({
  plannedForDate,
  sessions,
  onAdd,
  onRemove,
}: SessionPickerProps) {
  return (
    <div className="space-y-6">
      {/* Séances planifiées */}
      {plannedForDate.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-300 mb-3">Séances planifiées</h4>
          <div className="space-y-2">
            {plannedForDate.map((planned) => {
              const session = planned.session || sessions.find((s) => Number(s.id) === Number(planned.sessionId))
              if (!session) return null
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
                  <Button variant="ghost" size="icon" onClick={() => onRemove(planned.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ajouter une séance */}
      <div>
        <h4 className="font-medium text-gray-300 mb-3">Ajouter une séance</h4>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Créez d'abord des séances dans l'onglet "Mes séances".
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sessions.map((session) => (
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
                  <span className="font-medium text-sm text-white">{session.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDuration(session.duration)} • TSS {session.tss || 0}
                </p>
              </div>
            ))}
          </div>
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
    currentMonth,
    currentYear,
    setCurrentMonth,
    addToPlanning,
    removeFromPlanning,
  } = useTrainingStore()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const month = currentMonth - 1 // JS months are 0-indexed
  const year = currentYear
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Charger le planning et les sessions au montage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const { planningApi, sessionsApi } = await import('../../services/trainingApi')
        // Charger le planning et les sessions en parallèle
        const [planningResponse, sessionsData] = await Promise.all([
          planningApi.getByMonth(currentMonth, currentYear),
          sessionsApi.list(),
        ])
        useTrainingStore.setState({
          planning: planningResponse.planning,
          sessions: sessionsData,
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

  // Construire le calendrier
  const days = useMemo(() => {
    const result: React.ReactNode[] = []

    // Jours vides avant le premier jour
    for (let i = 0; i < firstDay; i++) {
      result.push(<div key={`empty-${i}`} className="h-24" />)
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = getSessionsForDate(day)
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString()
      const dayTss = daySessions.reduce((sum, p) => {
        const session = p.session || sessions.find((s) => Number(s.id) === Number(p.sessionId))
        return sum + (session?.tss || 0)
      }, 0)

      result.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-24 border border-border p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
            isToday ? 'bg-primary/10' : ''
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
              const session = planned.session || sessions.find((s) => Number(s.id) === Number(planned.sessionId))
              if (!session) return null
              const color = session.category === 'cycling' ? '#8BC34A' : '#5CE1E6'
              return (
                <div
                  key={planned.id}
                  className="px-1.5 py-0.5 rounded text-xs font-medium truncate"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {session.category === 'cycling' ? '🚴' : '🏋️'} {session.name}
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
  }, [planning, sessions, year, month, daysInMonth, firstDay])

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
              onAdd={handleAddSession}
              onRemove={handleRemoveSession}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PlanningCalendar
