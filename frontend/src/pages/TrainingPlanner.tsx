import { useState, useEffect, useMemo } from 'react'
import { Bike, Dumbbell, Plus, Zap, Calendar, FolderOpen, TrendingUp, TrendingDown, Loader2, AlertCircle, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  SessionCard,
  SessionForm,
  TemplateLibrary,
  PlanningCalendar,
  ProfilePanel,
  MrcImportModal,
  SessionPlayer,
  PpgSessionPlayer,
} from '../components/training'
import { useTrainingStore } from '../store/trainingStore'
import type { TrainingSession, TrainingTemplate, CreateSessionData } from '../types/training'

type TabId = 'sessions' | 'templates' | 'planning'

const TABS: { id: TabId; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: 'sessions', label: 'Mes séances', shortLabel: 'Séances', icon: <Bike className="h-4 w-4" /> },
  { id: 'templates', label: 'Modèles', shortLabel: 'Modèles', icon: <FolderOpen className="h-4 w-4" /> },
  { id: 'planning', label: 'Planification', shortLabel: 'Planning', icon: <Calendar className="h-4 w-4" /> },
]

/**
 * Composant de chargement stylisé
 */
function LoadingSkeleton() {
  return (
    <div className="glass-panel p-8 md:p-12">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-[#8BC34A] animate-spin" />
        <p className="text-gray-400 animate-pulse">Chargement des données...</p>
      </div>
    </div>
  )
}

/**
 * Composant d'erreur stylisé
 */
function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-panel p-6 border-red-500/30">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-red-500/10">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-red-400 mb-1">Une erreur s'est produite</h4>
          <p className="text-sm text-gray-400">{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
              Réessayer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

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
  } = useTrainingStore()

  const [activeTab, setActiveTab] = useState<TabId>('sessions')
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [showMrcImport, setShowMrcImport] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)
  const [templateToUse, setTemplateToUse] = useState<TrainingTemplate | null>(null)
  const [playingSession, setPlayingSession] = useState<TrainingSession | null>(null)
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  })
  const [filterSessionWeek, setFilterSessionWeek] = useState<string>('all')

  // Charger les données au montage
  useEffect(() => {
    fetchSessions()
    fetchTemplates()
    fetchWeekStats()
  }, [fetchSessions, fetchTemplates, fetchWeekStats])

  // Handlers
  const handleCreateSession = () => {
    setEditingSession(null)
    setTemplateToUse(null)
    setShowSessionForm(true)
  }

  const handleEditSession = (session: TrainingSession) => {
    setEditingSession(session)
    setTemplateToUse(null)
    setShowSessionForm(true)
  }

  const handleDeleteSessionClick = (id: number) => {
    setDeleteSessionConfirm({ isOpen: true, id })
  }

  const handleDeleteSessionConfirm = async () => {
    if (!deleteSessionConfirm.id) return
    try {
      await deleteSession(deleteSessionConfirm.id)
      toast.success('Séance supprimée')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleteSessionConfirm({ isOpen: false, id: null })
    }
  }

  const handleUseTemplate = (template: TrainingTemplate) => {
    setEditingSession(null)
    setTemplateToUse(template)
    setShowSessionForm(true)
    setActiveTab('sessions')
  }

  const handleSaveSession = async (data: CreateSessionData) => {
    try {
      if (editingSession) {
        await updateSession(editingSession.id, data)
        toast.success('Séance mise à jour')
      } else {
        await createSession(data)
        toast.success('Séance créée')
      }
      setShowSessionForm(false)
      setEditingSession(null)
      setTemplateToUse(null)
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  // Stats de la semaine - Calcul TSB simplifié basé sur le taux de complétion
  const completionStatus = weekStats
    ? weekStats.completionRate >= 80
      ? { label: 'Excellent', color: 'text-green-500', icon: TrendingUp }
      : weekStats.completionRate >= 50
      ? { label: 'En cours', color: 'text-yellow-500', icon: TrendingUp }
      : { label: 'À améliorer', color: 'text-red-500', icon: TrendingDown }
    : null

  // Obtenir les semaines uniques des séances
  const sessionWeeks = useMemo(() => {
    const uniqueWeeks = [...new Set(sessions.map((s) => s.week).filter(Boolean) as number[])]
    return uniqueWeeks.sort((a, b) => a - b)
  }, [sessions])

  // Filtrer les séances par catégorie et semaine
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterSessionWeek !== 'all' && s.week !== parseInt(filterSessionWeek)) return false
      return true
    })
  }, [sessions, filterSessionWeek])

  const cyclingSessions = filteredSessions.filter((s) => s.category === 'cycling')
  const ppgSessions = filteredSessions.filter((s) => s.category === 'ppg')

  // Handler pour recharger les données
  const handleRetry = () => {
    fetchSessions()
    fetchTemplates()
    fetchWeekStats()
  }

  // Handler pour l'import MRC réussi
  const handleMrcImportSuccess = () => {
    fetchSessions()
    fetchTemplates()
  }

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
      {(activeTab === 'sessions' || activeTab === 'templates') && (
        <Button
          variant="outline"
          onClick={() => setShowMrcImport(true)}
          title="Importer des fichiers MRC"
        >
          <Upload className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Importer MRC</span>
        </Button>
      )}
      {activeTab === 'sessions' && (
        <Button onClick={handleCreateSession}>
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Nouvelle séance</span>
        </Button>
      )}
    </div>
  )

  return (
    <AppLayout
      title="Planification"
      description="Planifiez et gérez vos séances d'entraînement cycliste"
      actions={actions}
    >
      <div className="space-y-8">
        <PageHeader
          eyebrow="Entraînement"
          title="Planification"
          description="Créez des séances structurées, gérez vos modèles et planifiez votre semaine d'entraînement."
          icon="trainingPlanner"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
        />

        {/* Stats de la semaine */}
        {weekStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Séances</p>
              <p className="text-xl md:text-2xl font-bold text-white">{weekStats.sessionCount}</p>
            </div>
            <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Complétées</p>
              <p className="text-xl md:text-2xl font-bold text-[#8BC34A]">{weekStats.completedCount}</p>
            </div>
            <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">TSS Total</p>
              <p className="text-xl md:text-2xl font-bold text-[#5CE1E6]">{weekStats.totalTss}</p>
            </div>
            <div className="glass-panel p-3 md:p-4 text-center hover:scale-[1.02] transition-transform">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Durée</p>
              <p className="text-xl md:text-2xl font-bold text-[#FFAB40]">{Math.round(weekStats.totalDuration / 60)}h</p>
            </div>
            <div className="glass-panel p-3 md:p-4 text-center col-span-2 sm:col-span-1 hover:scale-[1.02] transition-transform">
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 mb-1">Complétion</p>
              <div className="flex items-center justify-center gap-2">
                {completionStatus && <completionStatus.icon className={`h-4 w-4 md:h-5 md:w-5 ${completionStatus.color}`} />}
                <p className={`text-xl md:text-2xl font-bold ${completionStatus?.color || 'text-white'}`}>
                  {weekStats.completionRate}%
                </p>
              </div>
              {completionStatus && (
                <p className={`text-xs ${completionStatus.color}`}>{completionStatus.label}</p>
              )}
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="glass-panel p-1 inline-flex rounded-xl overflow-x-auto w-full md:w-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-[#8BC34A] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        {error && (
          <ErrorDisplay message={error} onRetry={handleRetry} />
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Onglet Mes séances */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                {sessions.length === 0 ? (
                  <div className="glass-panel p-12 text-center">
                    <div className="text-6xl mb-4">🚴</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Aucune séance créée
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Créez votre première séance d'entraînement ou utilisez un modèle.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={handleCreateSession}>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une séance
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('templates')}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Voir les modèles
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
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
                        {filterSessionWeek !== 'all' && (
                          <span className="text-sm text-text-secondary">
                            ({filteredSessions.length} séance{filteredSessions.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Séances Cyclisme */}
                    {cyclingSessions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Bike className="h-5 w-5 text-[#8BC34A]" />
                          <h3 className="text-lg font-semibold text-white">
                            Cyclisme ({cyclingSessions.length})
                          </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                          {cyclingSessions.map((session) => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              ftp={profile.ftp || 200}
                              weight={profile.weight || 75}
                              onEdit={handleEditSession}
                              onDelete={handleDeleteSessionClick}
                              onPlay={setPlayingSession}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Séances PPG */}
                    {ppgSessions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Dumbbell className="h-5 w-5 text-[#5CE1E6]" />
                          <h3 className="text-lg font-semibold text-white">
                            PPG ({ppgSessions.length})
                          </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                          {ppgSessions.map((session) => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              ftp={profile.ftp || 200}
                              weight={profile.weight || 75}
                              onEdit={handleEditSession}
                              onDelete={handleDeleteSessionClick}
                              onPlay={setPlayingSession}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Onglet Modèles */}
            {activeTab === 'templates' && (
              <div className="glass-panel p-4 md:p-6">
                <TemplateLibrary onCreateSession={handleUseTemplate} />
              </div>
            )}

            {/* Onglet Planification */}
            {activeTab === 'planning' && (
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
                  ? 'Modifier la séance'
                  : templateToUse
                  ? `Nouvelle séance (depuis "${templateToUse.name}")`
                  : 'Nouvelle séance'}
              </DialogTitle>
            </DialogHeader>
            <SessionForm
              session={editingSession}
              templateToUse={templateToUse}
              onSave={handleSaveSession}
              onCancel={() => {
                setShowSessionForm(false)
                setEditingSession(null)
                setTemplateToUse(null)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Modal Profil */}
        <ProfilePanel
          isOpen={showProfilePanel}
          onClose={() => setShowProfilePanel(false)}
        />

        {/* Modal Import MRC */}
        <MrcImportModal
          isOpen={showMrcImport}
          onClose={() => setShowMrcImport(false)}
          onImportSuccess={handleMrcImportSuccess}
          defaultImportAs={activeTab === 'templates' ? 'template' : 'session'}
        />

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
  )
}
