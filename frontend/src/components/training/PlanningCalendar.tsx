import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { SessionPlayer } from './SessionPlayer';
import { PpgSessionPlayer } from './PpgSessionPlayer';
import { SessionPicker } from './SessionPicker';
import { useTrainingStore } from '../../store/trainingStore';
import type { PlannedSession, TrainingSession, TrainingTemplate } from '../../types/training';
import {
  DAYS_FR,
  MONTHS_FR,
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDateKey,
  formatDateDisplay,
  formatShortDate,
  getCategoryColor,
  type DragData,
} from './calendarConfig';

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
  } = useTrainingStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playingSession, setPlayingSession] = useState<TrainingSession | null>(null);
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const dragImageRef = useRef<HTMLDivElement>(null);

  const month = currentMonth - 1;
  const year = currentYear;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { planningApi, sessionsApi, templatesApi } = await import('../../services/trainingApi');
        const [planningResponse, sessionsData, templatesData] = await Promise.all([
          planningApi.getByMonth(currentMonth, currentYear),
          sessionsApi.list(),
          templatesApi.list(),
        ]);
        useTrainingStore.setState({
          planning: planningResponse.planning,
          sessions: sessionsData,
          templates: templatesData,
        });
      } catch {
        // Silencieux
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentMonth, currentYear]);

  // Navigation
  const goToPrevMonth = () => {
    if (month === 0) {
      setCurrentMonth(12, year - 1);
    } else {
      setCurrentMonth(month, year);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setCurrentMonth(1, year + 1);
    } else {
      setCurrentMonth(month + 2, year);
    }
  };

  const getSessionsForDate = (day: number): PlannedSession[] => {
    const dateKey = formatDateKey(year, month, day);
    return planning[dateKey] || [];
  };

  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(year, month, day);
    setSelectedDate(dateKey);
    setShowPicker(true);
  };

  const handleAddSession = async (sessionId: number) => {
    if (selectedDate) {
      try {
        await addToPlanning(sessionId, selectedDate);
        toast.success('Séance ajoutée au planning');
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur lors de l'ajout";
        toast.error(message);
      }
    }
  };

  const handleRemoveSession = async (plannedId: number) => {
    try {
      await removeFromPlanning(plannedId);
      toast.success('Séance retirée du planning');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAddFromTemplate = async (template: TrainingTemplate) => {
    if (selectedDate) {
      try {
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
          week: template.week || undefined,
          day: template.day || undefined,
        });
        await addToPlanning(newSession.id, selectedDate);
        toast.success('Séance créée et ajoutée au planning');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur lors de la création';
        toast.error(message);
      }
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, planned: PlannedSession, dateKey: string, sessionName: string) => {
    const data: DragData = { plannedId: planned.id, sessionName, sourceDate: dateKey };
    setDragData(data);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(data));

    if (dragImageRef.current) {
      dragImageRef.current.textContent = sessionName;
      e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }
  };

  const handleDragEnd = () => {
    setDragData(null);
    setDropTargetDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetDate !== dateKey) {
      setDropTargetDate(dateKey);
    }
  };

  const handleDragLeave = () => {
    setDropTargetDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDateKey: string) => {
    e.preventDefault();
    setDropTargetDate(null);

    if (!dragData) return;
    if (dragData.sourceDate === targetDateKey) {
      setDragData(null);
      return;
    }

    try {
      await moveSession(dragData.plannedId, targetDateKey);
      toast.success(`Séance déplacée au ${formatShortDate(targetDateKey)}`);
    } catch {
      toast.error('Erreur lors du déplacement');
    }
    setDragData(null);
  };

  // Construction du calendrier
  const days = useMemo(() => {
    const result: React.ReactNode[] = [];

    // Jours vides
    for (let i = 0; i < firstDay; i++) {
      result.push(<div key={`empty-${i}`} className="h-24" />);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const daySessions = getSessionsForDate(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const dayTss = daySessions.reduce((sum, p) => {
        const session = sessions.find((s) => Number(s.id) === Number(p.sessionId)) || p.session;
        return sum + (session?.tss || 0);
      }, 0);
      const isDropTarget = dropTargetDate === dateKey;
      const isDragging = dragData !== null;

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
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-text-primary'}`}>
              {day}
            </span>
            {dayTss > 0 && <span className="text-xs text-primary font-medium">TSS {dayTss}</span>}
          </div>
          <div className="space-y-1 mt-1 overflow-hidden">
            {daySessions.slice(0, 2).map((planned) => {
              const session = sessions.find((s) => Number(s.id) === Number(planned.sessionId)) || planned.session;
              if (!session) return null;
              const color = getCategoryColor(session.category);
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
              );
            })}
            {daySessions.length > 2 && (
              <div className="text-xs text-text-muted">+{daySessions.length - 2}</div>
            )}
          </div>
        </div>
      );
    }

    return result;
  }, [planning, sessions, year, month, daysInMonth, firstDay, dragData, dropTargetDate]);

  const plannedForSelectedDate = selectedDate ? planning[selectedDate] || [] : [];

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
          <Loader2 className="h-8 w-8 text-[var(--brand-primary)] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {DAYS_FR.map((day) => (
            <div key={day} className="bg-muted py-2 text-center text-sm font-medium text-text-secondary">
              {day}
            </div>
          ))}
          <div className="col-span-7 grid grid-cols-7 gap-px bg-border">
            {days.map((day, idx) => (
              <div key={idx} className="bg-background">
                {day}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Planifier - {selectedDate && formatDateDisplay(selectedDate)}
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
                setShowPicker(false);
                setPlayingSession(session);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Players */}
      {playingSession && playingSession.category === 'cycling' && (
        <SessionPlayer
          session={playingSession}
          ftp={profile.ftp || 200}
          open={!!playingSession}
          onOpenChange={(open) => !open && setPlayingSession(null)}
        />
      )}

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
  );
}

export default PlanningCalendar;
