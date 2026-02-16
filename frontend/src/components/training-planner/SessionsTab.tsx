/**
 * Onglet des séances d'entraînement
 */

import { useMemo } from "react";
import { Plus, FolderOpen, Bike, Dumbbell } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SessionCard } from "../training";
import type { TrainingSession } from "../../types/training";

interface SessionsTabProps {
  sessions: TrainingSession[];
  profile: { ftp: number | null; weight: number | null };
  filterSessionWeek: string;
  setFilterSessionWeek: (week: string) => void;
  onCreateSession: () => void;
  onEditSession: (session: TrainingSession) => void;
  onDeleteSession: (id: number) => void;
  onPlaySession: (session: TrainingSession) => void;
  onShowTemplates: () => void;
}

export function SessionsTab({
  sessions,
  profile,
  filterSessionWeek,
  setFilterSessionWeek,
  onCreateSession,
  onEditSession,
  onDeleteSession,
  onPlaySession,
  onShowTemplates,
}: SessionsTabProps) {
  // Obtenir les semaines uniques des séances
  const sessionWeeks = useMemo(() => {
    const uniqueWeeks = [...new Set(sessions.map((s) => s.week).filter(Boolean) as number[])];
    return uniqueWeeks.sort((a, b) => a - b);
  }, [sessions]);

  // Filtrer les séances par semaine
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterSessionWeek !== "all" && s.week !== parseInt(filterSessionWeek)) return false;
      return true;
    });
  }, [sessions, filterSessionWeek]);

  const cyclingSessions = filteredSessions.filter((s) => s.category === "cycling");
  const ppgSessions = filteredSessions.filter((s) => s.category === "ppg");

  if (sessions.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="text-6xl mb-4">🚴</div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Aucune séance créée</h3>
        <p className="text-[var(--text-tertiary)] mb-6">Créez votre première séance d'entraînement ou utilisez un modèle.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onCreateSession}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une séance
          </Button>
          <Button variant="outline" onClick={onShowTemplates}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Voir les modèles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtre par semaine */}
      {sessionWeeks.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-text-secondary">Filtrer par semaine :</span>
          <Select value={filterSessionWeek} onValueChange={setFilterSessionWeek}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Toutes semaines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes semaines</SelectItem>
              {sessionWeeks.map((w) => (
                <SelectItem key={w} value={w.toString()}>
                  Semaine {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterSessionWeek !== "all" && (
            <span className="text-sm text-text-secondary">
              ({filteredSessions.length} séance{filteredSessions.length > 1 ? "s" : ""})
            </span>
          )}
        </div>
      )}

      {/* Séances Cyclisme */}
      {cyclingSessions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bike className="h-5 w-5 text-brand-primary" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Cyclisme ({cyclingSessions.length})</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {cyclingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                ftp={profile.ftp || 200}
                weight={profile.weight || 75}
                onEdit={onEditSession}
                onDelete={onDeleteSession}
                onPlay={onPlaySession}
              />
            ))}
          </div>
        </div>
      )}

      {/* Séances PPG */}
      {ppgSessions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="h-5 w-5 text-brand-secondary" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">PPG ({ppgSessions.length})</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {ppgSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                ftp={profile.ftp || 200}
                weight={profile.weight || 75}
                onEdit={onEditSession}
                onDelete={onDeleteSession}
                onPlay={onPlaySession}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
