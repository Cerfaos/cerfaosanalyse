/**
 * Page Planification d'entraînement
 */

import { useState, useEffect } from "react";
import { Plus, Zap, Upload } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { PageHeader } from "../components/ui/PageHeader";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  SessionForm,
  TemplateLibrary,
  PlanningCalendar,
  ProfilePanel,
  MrcImportModal,
  SessionPlayer,
  PpgSessionPlayer,
} from "../components/training";
import {
  TABS,
  type TabId,
  LoadingSkeleton,
  ErrorDisplay,
  WeekStatsSection,
  SessionsTab,
} from "../components/training-planner";
import { useTrainingStore } from "../store/trainingStore";
import type { TrainingSession, TrainingTemplate, CreateSessionData } from "../types/training";

export default function TrainingPlanner() {
  const {
    sessions,
    weekStats,
    profile,
    loading,
    error,
    fetchSessions,
    fetchTemplates,
    fetchWeekStats,
    createSession,
    updateSession,
    deleteSession,
  } = useTrainingStore();

  const [activeTab, setActiveTab] = useState<TabId>("sessions");
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showMrcImport, setShowMrcImport] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [templateToUse, setTemplateToUse] = useState<TrainingTemplate | null>(null);
  const [playingSession, setPlayingSession] = useState<TrainingSession | null>(null);
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [filterSessionWeek, setFilterSessionWeek] = useState<string>("all");

  useEffect(() => {
    fetchSessions();
    fetchTemplates();
    fetchWeekStats();
  }, [fetchSessions, fetchTemplates, fetchWeekStats]);

  const handleCreateSession = () => {
    setEditingSession(null);
    setTemplateToUse(null);
    setShowSessionForm(true);
  };

  const handleEditSession = (session: TrainingSession) => {
    setEditingSession(session);
    setTemplateToUse(null);
    setShowSessionForm(true);
  };

  const handleDeleteSessionClick = (id: number) => {
    setDeleteSessionConfirm({ isOpen: true, id });
  };

  const handleDeleteSessionConfirm = async () => {
    if (!deleteSessionConfirm.id) return;
    try {
      await deleteSession(deleteSessionConfirm.id);
      toast.success("Séance supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteSessionConfirm({ isOpen: false, id: null });
    }
  };

  const handleUseTemplate = (template: TrainingTemplate) => {
    setEditingSession(null);
    setTemplateToUse(template);
    setShowSessionForm(true);
    setActiveTab("sessions");
  };

  const handleSaveSession = async (data: CreateSessionData) => {
    try {
      if (editingSession) {
        await updateSession(editingSession.id, data);
        toast.success("Séance mise à jour");
      } else {
        await createSession(data);
        toast.success("Séance créée");
      }
      setShowSessionForm(false);
      setEditingSession(null);
      setTemplateToUse(null);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleRetry = () => {
    fetchSessions();
    fetchTemplates();
    fetchWeekStats();
  };

  const handleMrcImportSuccess = () => {
    fetchSessions();
    fetchTemplates();
  };

  const actions = (
    <div className="flex items-center gap-2 md:gap-3">
      <Button
        variant="outline"
        onClick={() => setShowProfilePanel(true)}
        className="flex items-center gap-2"
        title="Modifier le profil FTP"
      >
        <Zap className="h-4 w-4 text-[#8BC34A]" />
        <span className="font-semibold hidden sm:inline">{profile.ftp || 200}W</span>
        <span className="font-semibold sm:hidden">{profile.ftp || 200}</span>
      </Button>
      {(activeTab === "sessions" || activeTab === "templates") && (
        <Button variant="outline" onClick={() => setShowMrcImport(true)} title="Importer des fichiers MRC">
          <Upload className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Importer MRC</span>
        </Button>
      )}
      {activeTab === "sessions" && (
        <Button onClick={handleCreateSession}>
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Nouvelle séance</span>
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout title="Planification" description="Planifiez et gérez vos séances d'entraînement cycliste" actions={actions}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Entraînement"
          title="Planification"
          description="Créez des séances structurées, gérez vos modèles et planifiez votre semaine d'entraînement."
          icon="trainingPlanner"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
        />

        {weekStats && <WeekStatsSection weekStats={weekStats} />}

        {/* Onglets */}
        <div className="glass-panel p-1 inline-flex rounded-xl overflow-x-auto w-full md:w-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? "bg-[#8BC34A] text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {error && <ErrorDisplay message={error} onRetry={handleRetry} />}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === "sessions" && (
              <SessionsTab
                sessions={sessions}
                profile={profile}
                filterSessionWeek={filterSessionWeek}
                setFilterSessionWeek={setFilterSessionWeek}
                onCreateSession={handleCreateSession}
                onEditSession={handleEditSession}
                onDeleteSession={handleDeleteSessionClick}
                onPlaySession={setPlayingSession}
                onShowTemplates={() => setActiveTab("templates")}
              />
            )}

            {activeTab === "templates" && (
              <div className="glass-panel p-4 md:p-6">
                <TemplateLibrary onCreateSession={handleUseTemplate} />
              </div>
            )}

            {activeTab === "planning" && (
              <div className="glass-panel p-4 md:p-6 overflow-x-auto">
                <PlanningCalendar />
              </div>
            )}
          </>
        )}

        {/* Modal de création/édition de séance */}
        <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSession
                  ? "Modifier la séance"
                  : templateToUse
                    ? `Nouvelle séance (depuis "${templateToUse.name}")`
                    : "Nouvelle séance"}
              </DialogTitle>
            </DialogHeader>
            <SessionForm
              session={editingSession}
              templateToUse={templateToUse}
              onSave={handleSaveSession}
              onCancel={() => {
                setShowSessionForm(false);
                setEditingSession(null);
                setTemplateToUse(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <ProfilePanel isOpen={showProfilePanel} onClose={() => setShowProfilePanel(false)} />

        <MrcImportModal
          isOpen={showMrcImport}
          onClose={() => setShowMrcImport(false)}
          onImportSuccess={handleMrcImportSuccess}
          defaultImportAs={activeTab === "templates" ? "template" : "session"}
        />

        {playingSession && playingSession.category === "cycling" && (
          <SessionPlayer
            session={playingSession}
            ftp={profile.ftp || 200}
            open={!!playingSession}
            onOpenChange={(open) => !open && setPlayingSession(null)}
          />
        )}

        {playingSession && playingSession.category === "ppg" && (
          <PpgSessionPlayer
            session={playingSession}
            open={!!playingSession}
            onOpenChange={(open) => !open && setPlayingSession(null)}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteSessionConfirm.isOpen}
        onClose={() => setDeleteSessionConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteSessionConfirm}
        title="Supprimer la séance"
        message="Voulez-vous vraiment supprimer cette séance ?"
        confirmLabel="Supprimer"
        variant="danger"
      />
    </AppLayout>
  );
}
