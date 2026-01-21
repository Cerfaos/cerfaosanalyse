/**
 * Page de détail d'une activité
 */

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimilarActivities from "../components/SimilarActivities";
import { GlassCard } from "../components/ui/GlassCard";
import {
  MainStats,
  GpsMapSection,
  ElevationChartSection,
  HRZonesSection,
  AdditionalDataSection,
  EditForm,
  FileReplacementModal,
  YoutubePlayer,
  FeelingNotes,
  WeatherCard,
} from "../components/activity-detail";
import { useActivityExport } from "../hooks/useActivityExport";
import { useActivityDetail } from "../hooks/useActivityDetail";
import { useActivityEdit } from "../hooks/useActivityEdit";
import { useFileReplacement } from "../hooks/useFileReplacement";
import { useAuthStore } from "../store/authStore";
import {
  formatDuration,
  formatDistance,
  formatElevation,
  formatSpeed,
  formatPace,
} from "../utils/activityFormatters";
import { getActivityTypeConfig, isStaticActivity } from "../utils/activityConfig";
import { getTrimpColor, getRpeColor } from "../utils/colorUtils";
import { calculateHRZones } from "../utils/heartRateCalculations";

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { exportActivity } = useActivityExport();

  // Hooks personnalisés
  const { activity, gpsData, loading, error, loadActivity } = useActivityDetail(id);
  const {
    editForm,
    setEditForm,
    isEditing,
    startEditing,
    cancelEditing,
    handleSubmitEdit,
  } = useActivityEdit(activity, id, loadActivity);
  const fileReplacement = useFileReplacement(id, loadActivity);

  // États locaux
  const [success, setSuccess] = useState("");
  const [downloadingGpx, setDownloadingGpx] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);

  // Calcul des zones FC
  const hrZonesData = useMemo(() => {
    return calculateHRZones(
      user ? { fcMax: user.fcMax ?? null, fcRepos: user.fcRepos ?? null } : null,
      activity?.avgHeartRate ?? null
    );
  }, [user, activity?.avgHeartRate]);

  // Configuration du type d'activité
  const activityConfig = activity ? getActivityTypeConfig(activity.type) : null;

  // Données pour le graphique d'élévation
  const elevationChartData = useMemo(() => {
    return gpsData
      .filter((point) => point.ele !== undefined)
      .map((point, index) => ({
        index,
        elevation: point.ele,
      }));
  }, [gpsData]);

  const handleExportGpx = async () => {
    if (!activity || !activity.gpsData) {
      setSuccess("");
      return;
    }

    try {
      setDownloadingGpx(true);
      const response = await import("../services/api").then((m) =>
        m.default.get(`/api/exports/activities/${id}/gpx`, {
          responseType: "blob",
        })
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `${activity.type.toLowerCase()}-${activity.date}.gpx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("Fichier GPX téléchargé avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      // Erreur gérée silencieusement
    } finally {
      setDownloadingGpx(false);
    }
  };

  const handleExportImage = async (format: "png" | "pdf") => {
    if (!activity) return;

    try {
      setExportingImage(true);
      const dateStr = new Date(activity.date).toISOString().split("T")[0];
      const fileName = `${activity.type.toLowerCase()}-${dateStr}`;
      await exportActivity("activity-content", { fileName, format });
      setSuccess(`Export ${format.toUpperCase()} réussi !`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      // Erreur gérée silencieusement
    } finally {
      setExportingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-center text-text-secondary py-8">Chargement...</p>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || "Activité non trouvée"}
        </div>
        <button
          onClick={() => navigate("/activities")}
          className="mt-4 px-4 py-2 text-accent-500 hover:text-accent-600"
        >
          ← Retour aux activités
        </button>
      </div>
    );
  }

  const showMovementStats = !isStaticActivity(activity.type);

  return (
    <div className="relative min-h-screen">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute top-0 -left-64 h-[800px] w-[800px] rounded-full bg-[var(--accent-primary)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 -right-64 h-[600px] w-[600px] rounded-full bg-[var(--accent-secondary)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-slate-900/30 blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Bouton retour */}
        <button
          onClick={() => navigate("/activities")}
          className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] mb-6 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux activités
        </button>

        {/* Messages de succès/erreur */}
        {(success || fileReplacement.success) && (
          <div className="glass-panel border border-[var(--status-success)]/40 text-[var(--status-success)] px-4 py-3 mb-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--status-success)] rounded-full animate-pulse" />
              {success || fileReplacement.success}
            </div>
          </div>
        )}

        {fileReplacement.error && (
          <div className="glass-panel border border-[var(--status-error)]/40 text-[var(--status-error)] px-4 py-3 mb-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--status-error)] rounded-full" />
              {fileReplacement.error}
            </div>
          </div>
        )}

        {/* En-tête de l'activité */}
        <ActivityHeader
          activity={activity}
          activityConfig={activityConfig}
          downloadingGpx={downloadingGpx}
          exportingImage={exportingImage}
          onExportGpx={handleExportGpx}
          onExportImage={handleExportImage}
          onReplace={() => fileReplacement.setIsOpen(true)}
          onEdit={startEditing}
        />

        {/* Modal de remplacement */}
        <FileReplacementModal
          isOpen={fileReplacement.isOpen}
          onClose={() => {
            fileReplacement.setIsOpen(false);
            fileReplacement.setReplacementFile(null);
          }}
          replacementFile={fileReplacement.replacementFile}
          onFileChange={fileReplacement.handleFileChange}
          onSubmit={fileReplacement.handleReplaceFile}
          uploading={fileReplacement.uploadingFile}
        />

        {/* Formulaire d'édition */}
        {isEditing && (
          <EditForm
            editForm={editForm}
            setEditForm={setEditForm}
            handleSubmitEdit={handleSubmitEdit}
            cancelEditing={cancelEditing}
            formatDuration={formatDuration}
          />
        )}

        {/* Contenu exportable */}
        <div id="activity-content" className="space-y-6">
          {/* Statistiques principales */}
          <MainStats
            activity={activity}
            showMovementStats={showMovementStats}
            formatDistance={formatDistance}
            formatDuration={formatDuration}
            formatSpeed={formatSpeed}
            formatPace={formatPace}
            formatElevation={formatElevation}
            getTrimpColor={getTrimpColor}
            getRpeColor={getRpeColor}
          />

          {/* Vidéo YouTube */}
          {activity.youtubeUrl && <YoutubePlayer url={activity.youtubeUrl} />}

          {/* Notes de sensations */}
          {activity.feelingNotes && <FeelingNotes notes={activity.feelingNotes} />}

          {/* Météo */}
          {activity.weather && <WeatherCard weatherJson={activity.weather} />}

          {/* Carte GPS */}
          {gpsData.length > 0 && (
            <GpsMapSection
              gpsData={gpsData}
              formatDistance={formatDistance}
              activityDistance={activity.distance}
            />
          )}

          {/* Graphique d'élévation */}
          {elevationChartData.length > 0 && (
            <ElevationChartSection
              data={elevationChartData}
              activity={activity}
              formatElevation={formatElevation}
            />
          )}

          {/* Zones FC */}
          {hrZonesData && <HRZonesSection hrZonesData={hrZonesData} activity={activity} />}

          {/* Données supplémentaires */}
          <AdditionalDataSection
            activity={activity}
            formatSpeed={formatSpeed}
            formatPace={formatPace}
            getTrimpColor={getTrimpColor}
          />
        </div>

        {/* Activités similaires */}
        {activity && <SimilarActivities activityId={activity.id} />}
      </div>
    </div>
  );
}

// Composant En-tête d'activité
interface ActivityHeaderProps {
  activity: {
    type: string;
    subSport: string | null;
    date: string;
    fileName: string | null;
    gpsData: string | null;
  };
  activityConfig: { icon: string; gradient: string } | null;
  downloadingGpx: boolean;
  exportingImage: boolean;
  onExportGpx: () => void;
  onExportImage: (format: "png" | "pdf") => void;
  onReplace: () => void;
  onEdit: () => void;
}

function ActivityHeader({
  activity,
  activityConfig,
  downloadingGpx,
  exportingImage,
  onExportGpx,
  onExportImage,
  onReplace,
  onEdit,
}: ActivityHeaderProps) {
  return (
    <GlassCard className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Info */}
        <div className="flex items-center gap-6">
          {activityConfig && (
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activityConfig.gradient} flex items-center justify-center text-4xl shadow-lg shadow-[var(--accent-primary)]/20 transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-xl`}
            >
              {activityConfig.icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                <span className="text-sm font-medium text-[var(--accent-primary)]">
                  {activity.type}
                </span>
              </div>
              {activity.subSport && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {activity.subSport}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
              {new Date(activity.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {new Date(activity.date).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {activity.fileName && (
              <p className="text-sm text-[var(--text-tertiary)] mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {activity.fileName}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {activity.gpsData !== null && (
            <button onClick={onExportGpx} disabled={downloadingGpx} className="btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {downloadingGpx ? "Export..." : "GPX"}
            </button>
          )}
          {activity.fileName && (
            <button onClick={onReplace} className="btn-secondary">
              Remplacer
            </button>
          )}
          <button onClick={onEdit} className="btn-primary">
            Modifier
          </button>
          <div className="relative group">
            <button disabled={exportingImage} className="btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {exportingImage ? "..." : "Image"}
            </button>
            <div className="absolute right-0 mt-2 w-40 glass-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => onExportImage("png")}
                disabled={exportingImage}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] rounded-t-lg transition-colors"
              >
                Exporter PNG
              </button>
              <button
                onClick={() => onExportImage("pdf")}
                disabled={exportingImage}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] rounded-b-lg transition-colors"
              >
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
