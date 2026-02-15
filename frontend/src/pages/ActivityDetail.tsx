/**
 * Page de détail d'une activité
 */

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimilarActivities from "../components/SimilarActivities";
import AppLayout from "../components/layout/AppLayout";
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

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Chargement..." description="Récupération des données">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !activity) {
    return (
      <AppLayout title="Erreur" description="Activité introuvable">
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <p className="text-sm font-semibold text-red-400">
            {error || "Activité non trouvée"}
          </p>
        </div>
        <button
          onClick={() => navigate("/activities")}
          className="mt-4 flex items-center gap-2 text-sm font-bold text-[var(--accent-primary)] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux activités
        </button>
      </AppLayout>
    );
  }

  const showMovementStats = !isStaticActivity(activity.type);

  // Date formatée pour le titre
  const formattedDate = new Date(activity.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header actions
  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate("/activities")}
        className="flex items-center gap-1.5 text-sm font-bold text-[#475569] hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e293b] transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>
      <div className="w-px h-5 bg-[#1e293b]" />
      {activity.gpsData !== null && (
        <button
          onClick={handleExportGpx}
          disabled={downloadingGpx}
          className="flex items-center gap-1.5 text-sm font-bold text-[#475569] hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e293b] transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloadingGpx ? "..." : "GPX"}
        </button>
      )}
      {activity.fileName && (
        <button
          onClick={() => fileReplacement.setIsOpen(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-[#475569] hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e293b] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Remplacer
        </button>
      )}
      <button
        onClick={startEditing}
        className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg text-white transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, #f8712f 0%, #ea580c 100%)",
          boxShadow: "0 4px 24px rgba(248,113,47,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Modifier
      </button>
      <div className="relative group">
        <button
          disabled={exportingImage}
          className="flex items-center gap-1.5 text-sm font-bold text-[#475569] hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e293b] transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {exportingImage ? "..." : "Image"}
        </button>
        <div className="absolute right-0 mt-1 w-40 rounded-xl border border-[#1e293b] bg-[#0f1520] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 overflow-hidden shadow-xl shadow-black/40">
          <button
            onClick={() => handleExportImage("png")}
            disabled={exportingImage}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
          >
            Exporter PNG
          </button>
          <button
            onClick={() => handleExportImage("pdf")}
            disabled={exportingImage}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
          >
            Exporter PDF
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout
      title={activity.type}
      description={formattedDate}
      actions={headerActions}
    >
      {/* Messages de succès/erreur */}
      {(success || fileReplacement.success) && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-sm font-semibold text-emerald-400">
            {success || fileReplacement.success}
          </p>
        </div>
      )}

      {fileReplacement.error && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <p className="text-sm font-semibold text-red-400">{fileReplacement.error}</p>
        </div>
      )}

      {/* En-tête de l'activité — Hero */}
      <ActivityHeader
        activity={activity}
        activityConfig={activityConfig}
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
      <div id="activity-content" className="space-y-5">
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

        {/* Séparateur gradient entre stats et sections visuelles */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1e293b] to-transparent" />

        {/* Vidéo YouTube */}
        {activity.youtubeUrl && <YoutubePlayer url={activity.youtubeUrl} />}

        {/* Météo + Notes côte à côte (adaptatif) */}
        {(activity.weather || activity.avgTemperature || activity.feelingNotes) && (
          <WeatherNotesRow
            weather={activity.weather}
            avgTemperature={activity.avgTemperature}
            maxTemperature={activity.maxTemperature}
            feelingNotes={activity.feelingNotes}
          />
        )}

        {/* Carte GPS */}
        {gpsData.length > 0 && (
          <GpsMapSection
            gpsData={gpsData}
            formatDistance={formatDistance}
            activityDistance={activity.distance}
          />
        )}

        {/* Élévation + Zones FC côte à côte sur grands écrans */}
        {(elevationChartData.length > 0 || hrZonesData) && (
          <div className={`grid gap-5 ${elevationChartData.length > 0 && hrZonesData ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
            {elevationChartData.length > 0 && (
              <ElevationChartSection
                data={elevationChartData}
                activity={activity}
                formatElevation={formatElevation}
              />
            )}
            {hrZonesData && <HRZonesSection hrZonesData={hrZonesData} activity={activity} />}
          </div>
        )}

        {/* Données supplémentaires */}
        <AdditionalDataSection
          activity={activity}
          formatSpeed={formatSpeed}
          formatPace={formatPace}
          getTrimpColor={getTrimpColor}
        />

        {/* Activités similaires */}
        {activity && <SimilarActivities activityId={activity.id} />}
      </div>
    </AppLayout>
  );
}

// Composant En-tête d'activité — Hero style
interface ActivityHeaderProps {
  activity: {
    type: string;
    subSport: string | null;
    date: string;
    fileName: string | null;
  };
  activityConfig: { icon: string; gradient: string } | null;
}

function ActivityHeader({
  activity,
  activityConfig,
}: ActivityHeaderProps) {
  return (
    <div
      className="relative rounded-xl border border-white/[0.06] p-5 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15,21,32,0.9) 0%, rgba(12,16,23,0.95) 60%, rgba(15,21,32,0.9) 100%)",
      }}
    >
      {/* Orbe décoratif flou */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{
          background: activityConfig
            ? "radial-gradient(circle, #f8712f 0%, transparent 70%)"
            : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-4">
        {activityConfig && (
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${activityConfig.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
            style={{
              boxShadow: "0 6px 24px rgba(248,113,47,0.2), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            {activityConfig.icon}
          </div>
        )}
        <div className="min-w-0">
          <span className="text-2xl font-display font-extrabold text-white leading-tight">
            {new Date(activity.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-sm font-bold text-[var(--accent-primary)]">
              {activity.type}
            </span>
            {activity.subSport && (
              <span className="px-3 py-1 rounded-lg bg-[#1e293b] text-xs font-bold text-[#64748b]">
                {activity.subSport}
              </span>
            )}
            <span className="text-sm font-mono text-[#475569]">
              {new Date(activity.date).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {activity.fileName && (
            <p className="text-xs text-[#475569] mt-2 flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {activity.fileName}
            </p>
          )}
        </div>
      </div>

      {/* Ligne gradient décorative en bas */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent" />
    </div>
  );
}

// Layout adaptatif Météo + Notes
function WeatherNotesRow({
  weather,
  avgTemperature,
  maxTemperature,
  feelingNotes,
}: {
  weather: string | null;
  avgTemperature?: number | null;
  maxTemperature?: number | null;
  feelingNotes?: string | null;
}) {
  const hasWeather = weather || avgTemperature;
  const hasNotes = !!feelingNotes;
  const bothPresent = hasWeather && hasNotes;

  return (
    <div className={`grid gap-5 ${bothPresent ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
      {hasWeather && (
        <WeatherCard
          weatherJson={weather}
          avgTemperature={avgTemperature}
          maxTemperature={maxTemperature}
        />
      )}
      {hasNotes && <FeelingNotes notes={feelingNotes} />}
    </div>
  );
}
