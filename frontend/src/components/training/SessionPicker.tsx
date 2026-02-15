/**
 * Composant de sélection de séances pour le calendrier
 */

import { useState, useMemo } from 'react';
import { Bike, Dumbbell, Trash2, PlayCircle, Search } from 'lucide-react';
import { Button } from '../ui/button';
import type { PlannedSession, TrainingSession, TrainingTemplate, SessionCategory } from '../../types/training';
import { formatDuration, getCategoryColor } from './calendarConfig';

interface SessionPickerProps {
  plannedForDate: PlannedSession[];
  sessions: TrainingSession[];
  templates: TrainingTemplate[];
  onAdd: (sessionId: number) => void;
  onAddFromTemplate: (template: TrainingTemplate) => void;
  onRemove: (plannedId: number) => void;
  onPlay: (session: TrainingSession) => void;
}

type SourceTab = 'sessions' | 'templates';
type CategoryFilter = 'all' | SessionCategory;

export function SessionPicker({
  plannedForDate,
  sessions,
  templates,
  onAdd,
  onAddFromTemplate,
  onRemove,
  onPlay,
}: SessionPickerProps) {
  const [sourceTab, setSourceTab] = useState<SourceTab>('sessions');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const findFullSession = (planned: PlannedSession): TrainingSession | null => {
    const fromList = sessions.find((s) => Number(s.id) === Number(planned.sessionId));
    if (fromList && (fromList.blocks?.length || fromList.exercises?.length)) {
      return fromList;
    }
    if (planned.session) {
      return planned.session as TrainingSession;
    }
    return fromList || null;
  };

  const canPlay = (session: TrainingSession) => {
    if (session.category === 'cycling') {
      return session.blocks && session.blocks.length > 0;
    }
    return session.exercises && session.exercises.length > 0;
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (categoryFilter !== 'all' && session.category !== categoryFilter) return false;
      if (searchQuery && !session.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [sessions, categoryFilter, searchQuery]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (categoryFilter !== 'all' && template.category !== categoryFilter) return false;
      if (weekFilter !== null && template.week !== weekFilter) return false;
      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [templates, categoryFilter, weekFilter, searchQuery]);

  const availableWeeks = useMemo(() => {
    const weeks = new Set<number>();
    templates.forEach((t) => {
      if (t.week !== null) weeks.add(t.week);
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [templates]);

  return (
    <div className="space-y-4">
      {/* Séances planifiées */}
      {plannedForDate.length > 0 && (
        <PlannedSessionsList
          plannedForDate={plannedForDate}
          findFullSession={findFullSession}
          canPlay={canPlay}
          onPlay={onPlay}
          onRemove={onRemove}
        />
      )}

      {/* Ajouter une séance */}
      <div>
        <h4 className="font-medium text-gray-300 mb-3">Ajouter une séance</h4>

        {/* Onglets */}
        <div className="flex gap-2 mb-3">
          <TabButton
            active={sourceTab === 'sessions'}
            onClick={() => setSourceTab('sessions')}
            label={`Mes séances (${sessions.length})`}
          />
          <TabButton
            active={sourceTab === 'templates'}
            onClick={() => setSourceTab('templates')}
            label={`Modèles (${templates.length})`}
          />
        </div>

        {/* Filtres */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          weekFilter={weekFilter}
          onWeekChange={setWeekFilter}
          availableWeeks={availableWeeks}
          showWeekFilter={sourceTab === 'templates'}
        />

        {/* Liste */}
        {sourceTab === 'sessions' ? (
          <SessionsList
            sessions={filteredSessions}
            totalCount={sessions.length}
            onAdd={onAdd}
          />
        ) : (
          <TemplatesList
            templates={filteredTemplates}
            totalCount={templates.length}
            onAdd={onAddFromTemplate}
          />
        )}
      </div>
    </div>
  );
}

// Sous-composants

interface PlannedSessionsListProps {
  plannedForDate: PlannedSession[];
  findFullSession: (planned: PlannedSession) => TrainingSession | null;
  canPlay: (session: TrainingSession) => boolean | undefined | null;
  onPlay: (session: TrainingSession) => void;
  onRemove: (plannedId: number) => void;
}

function PlannedSessionsList({ plannedForDate, findFullSession, canPlay, onPlay, onRemove }: PlannedSessionsListProps) {
  return (
    <div>
      <h4 className="font-medium text-gray-300 mb-3">Séances planifiées</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {plannedForDate.map((planned) => {
          const session = findFullSession(planned);
          if (!session) return null;
          const color = getCategoryColor(session.category);
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
          );
        })}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#8BC34A] text-black'
          : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  );
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (filter: CategoryFilter) => void;
  weekFilter: number | null;
  onWeekChange: (week: number | null) => void;
  availableWeeks: number[];
  showWeekFilter: boolean;
}

function FilterBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  weekFilter,
  onWeekChange,
  availableWeeks,
  showWeekFilter,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <div className="relative flex-1 min-w-[150px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8BC34A]/50"
        />
      </div>

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8BC34A]/50"
      >
        <option value="all">Toutes catégories</option>
        <option value="cycling">🚴 Vélo</option>
        <option value="ppg">🏋️ PPG</option>
      </select>

      {showWeekFilter && availableWeeks.length > 0 && (
        <select
          value={weekFilter ?? ''}
          onChange={(e) => onWeekChange(e.target.value ? Number(e.target.value) : null)}
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
  );
}

interface SessionsListProps {
  sessions: TrainingSession[];
  totalCount: number;
  onAdd: (sessionId: number) => void;
}

function SessionsList({ sessions, totalCount, onAdd }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">
        {totalCount === 0
          ? 'Créez d\'abord des séances dans l\'onglet "Mes séances".'
          : 'Aucune séance ne correspond aux filtres.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onClick={() => onAdd(session.id)} />
      ))}
    </div>
  );
}

interface TemplatesListProps {
  templates: TrainingTemplate[];
  totalCount: number;
  onAdd: (template: TrainingTemplate) => void;
}

function TemplatesList({ templates, totalCount, onAdd }: TemplatesListProps) {
  if (templates.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">
        {totalCount === 0
          ? 'Aucun modèle disponible.'
          : 'Aucun modèle ne correspond aux filtres.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} onClick={() => onAdd(template)} />
      ))}
    </div>
  );
}

interface SessionCardProps {
  session: TrainingSession;
  onClick: () => void;
}

function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <div
      className="p-3 cursor-pointer bg-white/5 border border-white/10 rounded-lg hover:border-[#8BC34A]/50 transition-colors"
      onClick={onClick}
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
  );
}

interface TemplateCardProps {
  template: TrainingTemplate;
  onClick: () => void;
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <div
      className="p-3 cursor-pointer bg-white/5 border border-white/10 rounded-lg hover:border-[#8BC34A]/50 transition-colors"
      onClick={onClick}
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
  );
}

export default SessionPicker;
