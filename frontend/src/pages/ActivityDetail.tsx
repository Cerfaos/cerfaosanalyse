import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SimilarActivities from "../components/SimilarActivities";
import { GlassCard } from "../components/ui/GlassCard";
import MetricInfo from "../components/ui/MetricInfo";
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
import { getYoutubeVideoId } from "../utils/videoUtils";
import { parseWeatherData, getWindDirection, getWeatherIconUrl } from "../utils/weatherUtils";

// Composant pour ajuster automatiquement les limites de la carte
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  }, [positions, map]);

  return null;
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { exportActivity } = useActivityExport();

  // Hooks personnalisés pour le chargement, l'édition et le remplacement de fichier
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

  // États locaux pour les messages et exports
  const [success, setSuccess] = React.useState("");
  const [downloadingGpx, setDownloadingGpx] = React.useState(false);
  const [exportingImage, setExportingImage] = React.useState(false);

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

  // Masquer certaines stats pour les activités statiques
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
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
        <GlassCard className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Section gauche : Type + Date */}
            <div className="flex items-center gap-6">
              {activityConfig && (
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activityConfig.gradient} flex items-center justify-center text-4xl shadow-lg shadow-[var(--accent-primary)]/20 transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-xl`}
                >
                  {activityConfig.icon}
                </div>
              )}
              <div>
                {/* Badge type */}
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

                {/* Date principale */}
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

                {/* Fichier source */}
                {activity.fileName && (
                  <p className="text-sm text-[var(--text-tertiary)] mt-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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

            {/* Section droite : Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {activity.gpsData && (
                <button
                  onClick={handleExportGpx}
                  disabled={downloadingGpx}
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="7 10 12 15 17 10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="15"
                      x2="12"
                      y2="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {downloadingGpx ? "Export..." : "GPX"}
                </button>
              )}
              {activity.fileName && (
                <button
                  onClick={() => fileReplacement.setIsOpen(true)}
                  className="btn-secondary"
                >
                  Remplacer
                </button>
              )}
              <button onClick={startEditing} className="btn-primary">
                Modifier
              </button>
              <div className="relative group">
                <button
                  disabled={exportingImage}
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {exportingImage ? "..." : "Image"}
                </button>
                <div className="absolute right-0 mt-2 w-40 glass-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExportImage("png")}
                    disabled={exportingImage}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] rounded-t-lg transition-colors"
                  >
                    Exporter PNG
                  </button>
                  <button
                    onClick={() => handleExportImage("pdf")}
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

        {/* Modal de remplacement de fichier */}
        {fileReplacement.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-panel p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Remplacer le fichier
              </h2>
              <p className="text-sm text-gray-300 mb-4">
                Le remplacement du fichier mettra à jour toutes les données de
                l'activité (durée, distance, GPS, etc.) avec les nouvelles données
                du fichier.
              </p>

              <form onSubmit={fileReplacement.handleReplaceFile} className="space-y-4">
                <div>
                  <label
                    htmlFor="replacement-file"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Nouveau fichier
                  </label>
                  <input
                    type="file"
                    id="replacement-file"
                    accept=".fit,.gpx,.csv"
                    onChange={fileReplacement.handleFileChange}
                    required
                    className="w-full px-4 py-3 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Formats acceptés: FIT, GPX, CSV
                  </p>
                </div>

                {fileReplacement.replacementFile && (
                  <div className="bg-[var(--accent-secondary-subtle)] border border-[var(--accent-secondary)]/30 p-3 rounded-md">
                    <p className="text-sm text-[var(--accent-secondary)]">
                      Fichier sélectionné: <strong>{fileReplacement.replacementFile.name}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Taille: {(fileReplacement.replacementFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      fileReplacement.setIsOpen(false);
                      fileReplacement.setReplacementFile(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={fileReplacement.uploadingFile || !fileReplacement.replacementFile}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fileReplacement.uploadingFile ? "Remplacement..." : "Remplacer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

          {/* Lecteur vidéo YouTube intégré */}
          {activity.youtubeUrl && (
            <YoutubeSection url={activity.youtubeUrl} />
          )}

          {/* Notes de sensations */}
          {activity.feelingNotes && (
            <FeelingNotesSection notes={activity.feelingNotes} />
          )}

          {/* Météo */}
          {activity.weather && (
            <WeatherSection weatherJson={activity.weather} />
          )}

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

          {/* Zones de FC */}
          {hrZonesData && (
            <HRZonesSection
              hrZonesData={hrZonesData}
              activity={activity}
            />
          )}

          {/* Données supplémentaires */}
          <AdditionalDataSection
            activity={activity}
            formatSpeed={formatSpeed}
            formatPace={formatPace}
            getTrimpColor={getTrimpColor}
          />
        </div>

        {/* Similar Activities Section */}
        {activity && <SimilarActivities activityId={activity.id} />}
      </div>
    </div>
  );
}

// Import React pour useState
import React from "react";
import type { Activity } from "../types/activity";
import type { ActivityEditForm } from "../types/activity";
import type { GpsPoint } from "../types/activity";
import type { HRZonesResult } from "../utils/heartRateCalculations";

// Composant pour les statistiques principales
interface MainStatsProps {
  activity: Activity;
  showMovementStats: boolean;
  formatDistance: (m: number) => string;
  formatDuration: (s: number) => string;
  formatSpeed: (kmh: number | null) => string;
  formatPace: (kmh: number | null) => string;
  formatElevation: (v: number | null | undefined) => string;
  getTrimpColor: (t: number | null) => string;
  getRpeColor: (r: number | null) => string;
}

function MainStats({
  activity,
  showMovementStats,
  formatDistance,
  formatDuration,
  formatSpeed,
  formatPace,
  formatElevation,
  getTrimpColor,
  getRpeColor,
}: MainStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Distance */}
      {showMovementStats && (
        <StatCard
          icon="🛣️"
          label="Distance"
          value={formatDistance(activity.distance)}
          bgColor="bg-[var(--accent-primary)]/10"
          textColor="text-[var(--accent-primary)]"
          delay={0}
        />
      )}

      {/* Durée */}
      <StatCard
        icon="⏱️"
        label="Durée"
        value={formatDuration(activity.duration)}
        bgColor="bg-[var(--accent-secondary)]/10"
        delay={50}
      />

      {/* Vitesse */}
      {showMovementStats && (
        <StatCard
          icon="🚀"
          label="Vitesse moy"
          value={formatSpeed(activity.avgSpeed)}
          secondary={formatPace(activity.avgSpeed)}
          bgColor="bg-[var(--status-info)]/10"
          delay={100}
        />
      )}

      {/* FC moyenne */}
      <StatCard
        icon="❤️"
        label="FC moyenne"
        value={activity.avgHeartRate ? `${activity.avgHeartRate}` : "-"}
        unit="bpm"
        secondary={activity.maxHeartRate ? `Max: ${activity.maxHeartRate} bpm` : undefined}
        bgColor="bg-[var(--status-error)]/10"
        textColor="text-[var(--status-error)]"
        delay={150}
      />

      {/* Dénivelé */}
      {showMovementStats && (
        <StatCard
          icon="⛰️"
          label="Dénivelé +"
          value={formatElevation(activity.elevationGain)}
          secondary={activity.elevationLoss ? `Descente: ${formatElevation(activity.elevationLoss)}` : undefined}
          bgColor="bg-[var(--status-success)]/10"
          textColor="text-[var(--status-success)]"
          delay={200}
        />
      )}

      {/* TRIMP */}
      <StatCard
        icon="💪"
        label="TRIMP"
        value={activity.trimp || "-"}
        bgColor="bg-purple-500/10"
        textColor={getTrimpColor(activity.trimp)}
        infoComponent={<MetricInfo metric="trimp" />}
        delay={250}
      />

      {/* RPE */}
      {activity.rpe && (
        <StatCard
          icon="🎯"
          label="RPE"
          value={`${activity.rpe}`}
          unit="/10"
          secondary={activity.rpe <= 3 ? "Facile" : activity.rpe <= 6 ? "Modéré" : activity.rpe <= 8 ? "Difficile" : "Extrême"}
          bgColor="bg-amber-500/10"
          textColor={getRpeColor(activity.rpe)}
          delay={300}
        />
      )}

      {/* Température */}
      {activity.avgTemperature && (
        <StatCard
          icon="🌡️"
          label="Température"
          value={`${activity.avgTemperature}°C`}
          secondary={activity.maxTemperature ? `Max: ${activity.maxTemperature}°C` : undefined}
          bgColor="bg-cyan-500/10"
          delay={350}
        />
      )}
    </div>
  );
}

// Composant StatCard réutilisable
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  secondary?: string;
  bgColor: string;
  textColor?: string;
  infoComponent?: React.ReactNode;
  delay: number;
}

function StatCard({
  icon,
  label,
  value,
  unit,
  secondary,
  bgColor,
  textColor = "text-[var(--text-primary)]",
  infoComponent,
  delay,
}: StatCardProps) {
  return (
    <GlassCard
      className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center text-xl mb-3 border border-current/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 mb-1">
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-semibold">
            {label}
          </p>
          {infoComponent}
        </div>
        <p className={`text-2xl font-display font-bold ${textColor}`}>
          {value}
          {unit && (
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">
              {unit}
            </span>
          )}
        </p>
        {secondary && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{secondary}</p>
        )}
      </div>
    </GlassCard>
  );
}

// Section YouTube
function YoutubeSection({ url }: { url: string }) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;

  return (
    <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Vidéo de la séance
            </h3>
          </div>

          <div className="relative w-full rounded-xl overflow-hidden bg-black/20" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Vidéo de la séance"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="mt-3 flex justify-end">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Ouvrir sur YouTube
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Section Notes de sensations
function FeelingNotesSection({ notes }: { notes: string }) {
  return (
    <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '450ms' }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-secondary)]/5 via-transparent to-[var(--accent-primary)]/5" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-secondary)]/10 flex items-center justify-center text-xl flex-shrink-0 border border-[var(--accent-secondary)]/20">
            📝
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">
              Notes sur les sensations
            </h3>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
              {notes}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Section Météo
function WeatherSection({ weatherJson }: { weatherJson: string }) {
  const weather = parseWeatherData(weatherJson);
  if (!weather) return null;

  return (
    <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms' }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5" />
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-2xl border border-sky-500/20">
              🌤️
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-400 font-semibold">Conditions</p>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Météo lors de l'activité
              </h3>
            </div>
          </div>

          {/* Grid météo 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Condition principale */}
            <div className="glass-panel p-6 text-center bg-gradient-to-br from-sky-500/5 to-blue-500/5 border border-sky-500/10 rounded-xl">
              <img
                src={getWeatherIconUrl(weather.icon)}
                alt={weather.description}
                className="w-20 h-20 mx-auto"
              />
              <p className="text-lg font-semibold text-[var(--text-primary)] capitalize">
                {weather.description}
              </p>
            </div>

            {/* Température */}
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent-secondary)]/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-secondary)]/10 flex items-center justify-center text-xl mb-3 border border-[var(--accent-secondary)]/20">
                  🌡️
                </div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-semibold mb-1">
                  Température
                </p>
                <p className="text-3xl font-display font-bold text-[var(--text-primary)]">
                  {weather.temperature}°C
                </p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  Ressenti <span className="font-semibold text-[var(--text-secondary)]">{weather.feelsLike}°C</span>
                </p>
              </div>
            </div>

            {/* Vent */}
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-xl mb-3 border border-cyan-500/20">
                  💨
                </div>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-semibold mb-1">
                  Vent
                </p>
                <p className="text-3xl font-display font-bold text-[var(--text-primary)]">
                  {weather.windSpeed} <span className="text-lg font-normal">km/h</span>
                </p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  Direction <span className="font-semibold text-[var(--text-secondary)]">{getWindDirection(weather.windDirection)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Infos secondaires */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl text-center bg-white/[0.02]">
              <div className="text-2xl mb-2">💧</div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Humidité</p>
              <p className="text-xl font-display font-bold text-[var(--text-primary)] mt-1">{weather.humidity}%</p>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center bg-white/[0.02]">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Pression</p>
              <p className="text-xl font-display font-bold text-[var(--text-primary)] mt-1">{weather.pressure} <span className="text-sm font-normal">hPa</span></p>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center bg-white/[0.02]">
              <div className="text-2xl mb-2">☁️</div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Nuages</p>
              <p className="text-xl font-display font-bold text-[var(--text-primary)] mt-1">{weather.clouds}%</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Section Carte GPS
interface GpsMapSectionProps {
  gpsData: GpsPoint[];
  formatDistance: (m: number) => string;
  activityDistance: number;
}

function GpsMapSection({ gpsData, formatDistance, activityDistance }: GpsMapSectionProps) {
  return (
    <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '550ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-2xl border border-[var(--accent-primary)]/20">
            📍
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-primary)] font-semibold">Parcours</p>
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              Tracé GPS
            </h3>
          </div>
        </div>
        <span className="text-sm text-[var(--text-tertiary)] bg-[var(--surface-hover)] px-3 py-1 rounded-full">
          {gpsData.length} points
        </span>
      </div>

      <div className="h-96 rounded-xl overflow-hidden border-2 border-[var(--border-default)] hover:border-[var(--accent-primary)]/30 hover:shadow-[0_0_30px_rgba(248,113,47,0.15)] transition-all duration-300">
        <MapContainer
          center={[gpsData[0].lat, gpsData[0].lon]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={gpsData.map((point) => [point.lat, point.lon])} />
          <Polyline
            positions={gpsData.map((point) => [point.lat, point.lon])}
            color="#000000"
            weight={8}
            opacity={0.3}
          />
          <Polyline
            positions={gpsData.map((point) => [point.lat, point.lon])}
            color="#f8712f"
            weight={5}
            opacity={0.9}
          />
        </MapContainer>
      </div>

      <div className="flex items-center gap-2 mt-4 text-sm text-[var(--text-tertiary)]">
        <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
        Distance totale: <span className="font-semibold text-[var(--text-secondary)]">{formatDistance(activityDistance)}</span>
      </div>
    </GlassCard>
  );
}

// Section Graphique d'élévation
interface ElevationChartSectionProps {
  data: { index: number; elevation: number | undefined }[];
  activity: Activity;
  formatElevation: (v: number | null | undefined) => string;
}

function ElevationChartSection({ data, activity, formatElevation }: ElevationChartSectionProps) {
  return (
    <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--status-success)]/10 flex items-center justify-center text-2xl border border-[var(--status-success)]/20">
          ⛰️
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--status-success)] font-semibold">Altitude</p>
          <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Profil d'élévation
          </h3>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="index" stroke="var(--text-tertiary)" hide />
            <YAxis
              stroke="var(--text-tertiary)"
              style={{ fontSize: "11px" }}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              }}
              labelStyle={{ color: "var(--text-tertiary)", fontSize: "11px" }}
              formatter={(value: number) => [
                <span key="val" style={{ color: "#10B981", fontWeight: 600 }}>{value} m</span>,
                "Altitude"
              ]}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#elevationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {activity.elevationGain && (
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--status-success)] rounded-full" />
            <span className="text-sm text-[var(--text-tertiary)]">Dénivelé +</span>
            <span className="font-semibold text-[var(--status-success)]">{formatElevation(activity.elevationGain)}</span>
          </div>
          {activity.elevationLoss && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--status-error)] rounded-full" />
              <span className="text-sm text-[var(--text-tertiary)]">Dénivelé -</span>
              <span className="font-semibold text-[var(--status-error)]">{formatElevation(activity.elevationLoss)}</span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// Section Zones FC
interface HRZonesSectionProps {
  hrZonesData: HRZonesResult;
  activity: Activity;
}

function HRZonesSection({ hrZonesData, activity }: HRZonesSectionProps) {
  return (
    <GlassCard className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '650ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--status-error)]/10 flex items-center justify-center text-2xl border border-[var(--status-error)]/20">
            ❤️
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--status-error)] font-semibold">Entraînement</p>
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              Analyse des zones FC
            </h3>
          </div>
        </div>
        <div
          className="px-4 py-2 rounded-xl border text-sm font-semibold"
          style={{
            backgroundColor: `${hrZonesData.currentZone.color}15`,
            borderColor: `${hrZonesData.currentZone.color}40`,
            color: hrZonesData.currentZone.color
          }}
        >
          {hrZonesData.currentZone.name}
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl mb-6 bg-gradient-to-r from-[var(--status-error)]/5 via-transparent to-[var(--accent-secondary)]/5 border border-[var(--status-error)]/10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[var(--status-error)] rounded-full animate-pulse" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-[var(--text-tertiary)]">
              Zone: <strong className="text-[var(--text-primary)]">{hrZonesData.currentZone.min}-{hrZonesData.currentZone.max} bpm</strong>
            </span>
            <span className="text-[var(--text-tertiary)]">
              FC moyenne: <strong className="text-[var(--status-error)]">{activity.avgHeartRate} bpm</strong>
            </span>
            <span className="text-[var(--text-tertiary)]">
              FC max: <strong className="text-[var(--text-secondary)]">{activity.maxHeartRate} bpm</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hrZonesData.zones} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis
              dataKey="name"
              stroke="var(--text-tertiary)"
              style={{ fontSize: "10px" }}
              tick={{ fill: 'var(--text-tertiary)' }}
            />
            <YAxis
              stroke="var(--text-tertiary)"
              style={{ fontSize: "10px" }}
              tick={{ fill: 'var(--text-tertiary)' }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              }}
              labelStyle={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600 }}
            />
            <Bar dataKey="min" fill="#3B82F6" name="Min BPM" radius={[4, 4, 0, 0]} />
            <Bar dataKey="max" fill="#f8712f" name="Max BPM" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
        {hrZonesData.zones.map((zone) => (
          <div
            key={zone.zone}
            className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${zone.color}10` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
            <span className="text-[var(--text-tertiary)]">{zone.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// Section Données supplémentaires
interface AdditionalDataSectionProps {
  activity: Activity;
  formatSpeed: (kmh: number | null) => string;
  formatPace: (kmh: number | null) => string;
  getTrimpColor: (t: number | null) => string;
}

function AdditionalDataSection({ activity, formatSpeed, formatPace, getTrimpColor }: AdditionalDataSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cardio */}
      {(activity.avgHeartRate || activity.maxHeartRate) && (
        <GlassCard className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-error)]/10 flex items-center justify-center text-lg border border-[var(--status-error)]/20 group-hover:scale-110 transition-transform duration-300">
              ❤️
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Cardio
            </h3>
          </div>
          <div className="space-y-3">
            {activity.avgHeartRate && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">FC moyenne</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {activity.avgHeartRate} <span className="text-xs text-[var(--text-tertiary)]">bpm</span>
                </span>
              </div>
            )}
            {activity.maxHeartRate && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">FC maximale</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {activity.maxHeartRate} <span className="text-xs text-[var(--text-tertiary)]">bpm</span>
                </span>
              </div>
            )}
            {activity.trimp && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--text-tertiary)]">TRIMP</span>
                <span className={`font-semibold ${getTrimpColor(activity.trimp)}`}>
                  {activity.trimp}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Vitesse */}
      {(activity.avgSpeed || activity.maxSpeed) && (
        <GlassCard className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '750ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-info)]/10 flex items-center justify-center text-lg border border-[var(--status-info)]/20 group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Vitesse
            </h3>
          </div>
          <div className="space-y-3">
            {activity.avgSpeed && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Vitesse moyenne</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatSpeed(activity.avgSpeed)}
                </span>
              </div>
            )}
            {activity.maxSpeed && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Vitesse maximale</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatSpeed(activity.maxSpeed)}
                </span>
              </div>
            )}
            {activity.avgSpeed && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--text-tertiary)]">Allure moyenne</span>
                <span className="font-semibold text-[var(--accent-primary)]">
                  {formatPace(activity.avgSpeed)}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Puissance */}
      {(activity.avgPower || activity.normalizedPower) && (
        <GlassCard className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 flex items-center justify-center text-lg border border-[var(--accent-secondary)]/20 group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Puissance
            </h3>
          </div>
          <div className="space-y-3">
            {activity.avgPower && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Puissance moyenne</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {activity.avgPower} <span className="text-xs text-[var(--text-tertiary)]">W</span>
                </span>
              </div>
            )}
            {activity.normalizedPower && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--text-tertiary)]">Puissance normalisée</span>
                <span className="font-semibold text-[var(--accent-secondary)]">
                  {activity.normalizedPower} <span className="text-xs text-[var(--text-tertiary)]">W</span>
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Autres */}
      {(activity.avgCadence || activity.calories) && (
        <GlassCard className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '850ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Autres données
            </h3>
          </div>
          <div className="space-y-3">
            {activity.avgCadence && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-tertiary)]">Cadence moyenne</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {activity.avgCadence} <span className="text-xs text-[var(--text-tertiary)]">rpm</span>
                </span>
              </div>
            )}
            {activity.calories && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--text-tertiary)]">Calories</span>
                <span className="font-semibold text-[var(--accent-primary)]">
                  {activity.calories} <span className="text-xs text-[var(--text-tertiary)]">kcal</span>
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// Composant Formulaire d'édition
interface EditFormProps {
  editForm: ActivityEditForm;
  setEditForm: React.Dispatch<React.SetStateAction<ActivityEditForm>>;
  handleSubmitEdit: (e: React.FormEvent) => Promise<void>;
  cancelEditing: () => void;
  formatDuration: (s: number) => string;
}

function EditForm({ editForm, setEditForm, handleSubmitEdit, cancelEditing, formatDuration }: EditFormProps) {
  return (
    <div className="mb-8 glass-panel p-6 rounded-lg shadow-lg border border-[var(--border-default)]">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Modifier l'activité
      </h2>
      <form onSubmit={handleSubmitEdit} className="space-y-6">
        {/* Section Informations générales */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Informations générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Type *
              </label>
              <select
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)] [&>option]:bg-[var(--surface-raised)] [&>option]:text-white"
                required
              >
                <option value="Course">Course</option>
                <option value="Cyclisme">Cyclisme</option>
                <option value="Marche">Marche</option>
                <option value="Musculation">Musculation</option>
                <option value="Natation">Natation</option>
                <option value="Rameur">Rameur</option>
                <option value="Randonnée">Randonnée</option>
                <option value="Yoga">Yoga</option>
                <option value="Mobilité">Mobilité</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Date *
              </label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Heure
              </label>
              <input
                type="time"
                value={editForm.time}
                onChange={(e) =>
                  setEditForm({ ...editForm, time: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Distance (km) *
              </label>
              <input
                type="number"
                step="0.01"
                value={editForm.distanceKm}
                onChange={(e) =>
                  setEditForm({ ...editForm, distanceKm: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                required
                min="0"
              />
              <p className="text-xs text-text-secondary mt-1">
                {Number(editForm.distanceKm).toFixed(2)} km ={" "}
                {(Number(editForm.distanceKm) * 1000).toFixed(0)} m
              </p>
            </div>
          </div>

          {/* Durée en 3 champs séparés */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-body mb-2">
              Durée (HH:MM:SS) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number"
                  value={editForm.durationHours}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      durationHours: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                  placeholder="HH"
                  min="0"
                  max="99"
                />
                <p className="text-xs text-text-secondary text-center mt-1">
                  Heures
                </p>
              </div>
              <div>
                <input
                  type="number"
                  value={editForm.durationMinutes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      durationMinutes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                  placeholder="MM"
                  min="0"
                  max="59"
                  required
                />
                <p className="text-xs text-text-secondary text-center mt-1">
                  Minutes
                </p>
              </div>
              <div>
                <input
                  type="number"
                  value={editForm.durationSeconds}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      durationSeconds: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                  placeholder="SS"
                  min="0"
                  max="59"
                  required
                />
                <p className="text-xs text-text-secondary text-center mt-1">
                  Secondes
                </p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Total:{" "}
              {formatDuration(
                (Number(editForm.durationHours) || 0) * 3600 +
                  (Number(editForm.durationMinutes) || 0) * 60 +
                  (Number(editForm.durationSeconds) || 0)
              )}
            </p>
          </div>
        </div>

        {/* Section Cardio */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Fréquence cardiaque
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                FC Moyenne (bpm)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.avgHeartRate}
                onChange={(e) =>
                  setEditForm({ ...editForm, avgHeartRate: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
                max="250"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                FC Maximale (bpm)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.maxHeartRate}
                onChange={(e) =>
                  setEditForm({ ...editForm, maxHeartRate: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
                max="250"
              />
            </div>
          </div>
        </div>

        {/* Section Vitesse */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Vitesse
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Vitesse Moyenne (km/h)
              </label>
              <input
                type="number"
                step="0.1"
                value={editForm.avgSpeed}
                onChange={(e) =>
                  setEditForm({ ...editForm, avgSpeed: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Vitesse Maximale (km/h)
              </label>
              <input
                type="number"
                step="0.1"
                value={editForm.maxSpeed}
                onChange={(e) =>
                  setEditForm({ ...editForm, maxSpeed: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section Puissance */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Puissance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Puissance Moyenne (W)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.avgPower}
                onChange={(e) =>
                  setEditForm({ ...editForm, avgPower: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Puissance Normalisée (W)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.normalizedPower}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    normalizedPower: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section Autres données */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Autres données
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Cadence Moyenne (rpm)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.avgCadence}
                onChange={(e) =>
                  setEditForm({ ...editForm, avgCadence: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Dénivelé (m)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.elevationGain}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    elevationGain: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Calories
              </label>
              <input
                type="number"
                step="any"
                value={editForm.calories}
                onChange={(e) =>
                  setEditForm({ ...editForm, calories: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section Météo */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Météo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Conditions météo
              </label>
              <select
                value={editForm.weatherCondition}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    weatherCondition: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)] [&>option]:bg-[var(--surface-raised)] [&>option]:text-white"
              >
                <option value="">-- Aucune modification --</option>
                <option value="ensoleille">Ensoleillé</option>
                <option value="partiellement-nuageux">Partiellement nuageux</option>
                <option value="nuageux">Nuageux</option>
                <option value="couvert">Couvert</option>
                <option value="pluie-legere">Pluie légère</option>
                <option value="pluie">Pluie</option>
                <option value="orage">Orage</option>
                <option value="neige">Neige</option>
                <option value="brouillard">Brouillard</option>
                <option value="vent">Venteux</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Température (°C)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.weatherTemperature}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    weatherTemperature: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                placeholder="ex: 18"
                min="-50"
                max="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Vitesse du vent (km/h)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.weatherWindSpeed}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    weatherWindSpeed: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                placeholder="ex: 15"
                min="0"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Direction du vent (°)
              </label>
              <input
                type="number"
                step="any"
                value={editForm.weatherWindDirection}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    weatherWindDirection: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                placeholder="ex: 180 (Nord=0, Est=90, Sud=180, Ouest=270)"
                min="0"
                max="359"
              />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            La modification des conditions météo remplacera les données
            météo existantes pour cette sortie.
          </p>
        </div>

        {/* Section RPE et Sensations */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            Ressenti / Sensations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                RPE - Effort Perçu (1-10)
              </label>
              <select
                value={editForm.rpe}
                onChange={(e) =>
                  setEditForm({ ...editForm, rpe: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)] [&>option]:bg-[var(--surface-raised)] [&>option]:text-white"
              >
                <option value="">-- Sélectionner --</option>
                <option value="1">1 - Très très facile</option>
                <option value="2">2 - Très facile</option>
                <option value="3">3 - Facile</option>
                <option value="4">4 - Modéré</option>
                <option value="5">5 - Assez dur</option>
                <option value="6">6 - Dur</option>
                <option value="7">7 - Très dur</option>
                <option value="8">8 - Très très dur</option>
                <option value="9">9 - Extrême</option>
                <option value="10">10 - Maximum</option>
              </select>
              <p className="text-xs text-text-secondary mt-1">
                Échelle de Borg modifiée : comment avez-vous perçu cet
                effort ?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">
                Notes sur les sensations
              </label>
              <textarea
                value={editForm.feelingNotes}
                onChange={(e) =>
                  setEditForm({ ...editForm, feelingNotes: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
                rows={3}
                placeholder="Ex: Jambes lourdes, bonne récupération, fatigue générale..."
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Note d'information */}
        <div className="bg-[var(--status-info-subtle)] p-4 rounded-lg border border-[var(--status-info)]/30">
          <p className="text-sm text-[var(--status-info)]">
            <strong>Note :</strong> Si vous modifiez la fréquence cardiaque
            moyenne ou la durée, le TRIMP sera automatiquement recalculé par
            le système.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <button type="submit" className="btn-primary font-display">
            Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
