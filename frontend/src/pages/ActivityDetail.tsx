import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SimilarActivities from "../components/SimilarActivities";
import MetricInfo from "../components/ui/MetricInfo";
import { useActivityExport } from "../hooks/useActivityExport";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  clouds: number;
  visibility: number;
}

interface Activity {
  id: number;
  date: string;
  type: string;
  duration: number;
  movingTime: number | null;
  distance: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  elevationGain: number | null;
  elevationLoss: number | null;
  calories: number | null;
  avgCadence: number | null;
  avgPower: number | null;
  normalizedPower: number | null;
  avgTemperature: number | null;
  maxTemperature: number | null;
  subSport: string | null;
  trimp: number | null;
  rpe: number | null;
  feelingNotes: string | null;
  fileName: string | null;
  gpsData: string | null;
  weather: string | null;
  createdAt: string;
}

interface GpsPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

// Composant pour ajuster automatiquement les limites de la carte
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);

      // Ajuster la carte pour afficher tous les points
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16, // Limite le zoom pour ne pas être trop rapproché
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
  const [activity, setActivity] = useState<Activity | null>(null);
  const [gpsData, setGpsData] = useState<GpsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [downloadingGpx, setDownloadingGpx] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    type: "",
    date: "",
    durationHours: "",
    durationMinutes: "",
    durationSeconds: "",
    distanceKm: "",
    avgHeartRate: "",
    maxHeartRate: "",
    avgSpeed: "",
    maxSpeed: "",
    avgPower: "",
    normalizedPower: "",
    avgCadence: "",
    elevationGain: "",
    calories: "",
    rpe: "",
    feelingNotes: "",
    weatherCondition: "",
    weatherTemperature: "",
    weatherWindSpeed: "",
    weatherWindDirection: "",
  });

  useEffect(() => {
    loadActivity();
  }, [id]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/activities/${id}`);
      const activityData = response.data.data;

      setActivity(activityData);

      // Parser les données GPS si disponibles
      if (activityData.gpsData) {
        try {
          const parsed = JSON.parse(activityData.gpsData);
          // Filtrer les points GPS invalides (lat/lon à 0 ou undefined)
          const validPoints = parsed.filter(
            (point: GpsPoint) =>
              point.lat &&
              point.lon &&
              point.lat !== 0 &&
              point.lon !== 0 &&
              Math.abs(point.lat) <= 90 &&
              Math.abs(point.lon) <= 180
          );
          setGpsData(validPoints);
        } catch (err) {
          console.error("Erreur parsing GPS:", err);
        }
      }
    } catch (err: any) {
      console.error("Erreur chargement activité:", err);
      setError("Impossible de charger l'activité");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (!activity) return;

    // Convertir la durée en secondes vers HH:MM:SS
    const hours = Math.floor(activity.duration / 3600);
    const minutes = Math.floor((activity.duration % 3600) / 60);
    const seconds = activity.duration % 60;

    // Convertir la distance en mètres vers km
    const distanceInKm = (activity.distance / 1000).toFixed(2);

    // Extraire les données météo actuelles si disponibles
    let currentTemp = "";
    let currentWindSpeed = "";
    let currentWindDirection = "";
    if (activity.weather) {
      try {
        const weatherData = JSON.parse(activity.weather);
        currentTemp = weatherData.temperature?.toString() || "";
        currentWindSpeed = weatherData.windSpeed?.toString() || "";
        currentWindDirection = weatherData.windDirection?.toString() || "";
      } catch (e) {
        // Ignore parsing errors
      }
    }

    setEditForm({
      type: activity.type,
      date: new Date(activity.date).toISOString().split("T")[0],
      durationHours: hours.toString(),
      durationMinutes: minutes.toString(),
      durationSeconds: seconds.toString(),
      distanceKm: distanceInKm,
      avgHeartRate: activity.avgHeartRate?.toString() || "",
      maxHeartRate: activity.maxHeartRate?.toString() || "",
      avgSpeed: activity.avgSpeed?.toString() || "",
      maxSpeed: activity.maxSpeed?.toString() || "",
      avgPower: activity.avgPower?.toString() || "",
      normalizedPower: activity.normalizedPower?.toString() || "",
      avgCadence: activity.avgCadence?.toString() || "",
      elevationGain: activity.elevationGain?.toString() || "",
      calories: activity.calories?.toString() || "",
      rpe: activity.rpe?.toString() || "",
      feelingNotes: activity.feelingNotes || "",
      weatherCondition: "",
      weatherTemperature: currentTemp,
      weatherWindSpeed: currentWindSpeed,
      weatherWindDirection: currentWindDirection,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convertir HH:MM:SS en secondes
      const hours = Number(editForm.durationHours) || 0;
      const minutes = Number(editForm.durationMinutes) || 0;
      const seconds = Number(editForm.durationSeconds) || 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      // Convertir km en mètres
      const distanceInMeters = Math.round(Number(editForm.distanceKm) * 1000);

      const updateData: any = {
        type: editForm.type,
        date: editForm.date,
        duration: totalSeconds,
        distance: distanceInMeters,
      };

      // Ajouter les champs optionnels seulement s'ils sont renseignés
      if (editForm.avgHeartRate)
        updateData.avgHeartRate = Number(editForm.avgHeartRate);
      if (editForm.maxHeartRate)
        updateData.maxHeartRate = Number(editForm.maxHeartRate);
      if (editForm.avgSpeed) updateData.avgSpeed = Number(editForm.avgSpeed);
      if (editForm.maxSpeed) updateData.maxSpeed = Number(editForm.maxSpeed);
      if (editForm.avgPower) updateData.avgPower = Number(editForm.avgPower);
      if (editForm.normalizedPower)
        updateData.normalizedPower = Number(editForm.normalizedPower);
      if (editForm.avgCadence)
        updateData.avgCadence = Number(editForm.avgCadence);
      if (editForm.elevationGain)
        updateData.elevationGain = Number(editForm.elevationGain);
      if (editForm.calories) updateData.calories = Number(editForm.calories);

      // Ajouter RPE et notes de sensations
      if (editForm.rpe) updateData.rpe = Number(editForm.rpe);
      else updateData.rpe = null;
      if (editForm.feelingNotes)
        updateData.feelingNotes = editForm.feelingNotes;
      else updateData.feelingNotes = null;

      // Ajouter les champs météo si renseignés
      if (editForm.weatherCondition) {
        updateData.weatherCondition = editForm.weatherCondition;
        if (editForm.weatherTemperature) {
          updateData.weatherTemperature = Number(editForm.weatherTemperature);
        }
        if (editForm.weatherWindSpeed) {
          updateData.weatherWindSpeed = Number(editForm.weatherWindSpeed);
        }
        if (editForm.weatherWindDirection) {
          updateData.weatherWindDirection = Number(
            editForm.weatherWindDirection
          );
        }
      }

      await api.patch(`/api/activities/${id}`, updateData);

      setIsEditing(false);
      loadActivity(); // Recharger l'activité mise à jour
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      alert("Erreur lors de la mise à jour de l'activité");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReplacementFile(e.target.files[0]);
    }
  };

  const handleReplaceFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementFile) return;

    setError("");
    setSuccess("");
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", replacementFile);

      await api.post(`/api/activities/${id}/replace-file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Fichier remplacé avec succès !");
      setReplacementFile(null);
      setIsReplacingFile(false);

      // Reset file input
      const fileInput = document.getElementById(
        "replacement-file"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Recharger l'activité
      loadActivity();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erreur lors du remplacement du fichier"
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const handleExportGpx = async () => {
    if (!activity || !activity.gpsData) {
      setError("Cette activité ne contient pas de données GPS");
      return;
    }

    try {
      setDownloadingGpx(true);
      const response = await api.get(`/api/exports/activities/${id}/gpx`, {
        responseType: "blob",
      });

      // Créer un lien de téléchargement
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'export GPX");
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
    } catch (err: any) {
      setError(
        err.message || `Erreur lors de l'export ${format.toUpperCase()}`
      );
    } finally {
      setExportingImage(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.round(seconds);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let secs = totalSeconds % 60;

    if (secs === 60) {
      secs = 0;
      minutes += 1;
    }

    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}min ${secs
        .toString()
        .padStart(2, "0")}s`;
    }
    return `${minutes}min ${secs.toString().padStart(2, "0")}s`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  };

  const formatElevation = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return `${value.toFixed(2)} m`;
  };

  const formatSpeed = (kmh: number | null) => {
    if (!kmh) return "-";
    return `${kmh.toFixed(1)} km/h`;
  };

  const formatPace = (kmh: number | null) => {
    if (!kmh || kmh === 0) return "-";
    const minPerKm = 60 / kmh;
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
  };

  const calculateHRZones = () => {
    if (!user?.fcMax || !user?.fcRepos || !activity?.avgHeartRate) {
      return null;
    }

    const fcReserve = user.fcMax - user.fcRepos;

    const zones = [
      {
        zone: 1,
        name: "Z1 - Récup",
        min: Math.round(user.fcRepos + 0.5 * fcReserve),
        max: Math.round(user.fcRepos + 0.6 * fcReserve),
        color: "#3B82F6",
      },
      {
        zone: 2,
        name: "Z2 - Endurance",
        min: Math.round(user.fcRepos + 0.6 * fcReserve),
        max: Math.round(user.fcRepos + 0.7 * fcReserve),
        color: "#10B981",
      },
      {
        zone: 3,
        name: "Z3 - Tempo",
        min: Math.round(user.fcRepos + 0.7 * fcReserve),
        max: Math.round(user.fcRepos + 0.8 * fcReserve),
        color: "#F59E0B",
      },
      {
        zone: 4,
        name: "Z4 - Seuil",
        min: Math.round(user.fcRepos + 0.8 * fcReserve),
        max: Math.round(user.fcRepos + 0.9 * fcReserve),
        color: "#F97316",
      },
      {
        zone: 5,
        name: "Z5 - VO2max",
        min: Math.round(user.fcRepos + 0.9 * fcReserve),
        max: user.fcMax,
        color: "#EF4444",
      },
    ];

    // Déterminer la zone de la FC moyenne
    let currentZone = zones[0];
    for (const zone of zones) {
      if (
        activity.avgHeartRate >= zone.min &&
        activity.avgHeartRate <= zone.max
      ) {
        currentZone = zone;
        break;
      }
    }

    return { zones, currentZone };
  };

  const hrZonesData = calculateHRZones();

  // Configuration des couleurs par type d'activité
  const getActivityTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { icon: string; gradient: string; badge: string }
    > = {
      Cyclisme: {
        icon: "🚴",
        gradient: "from-orange-500 to-amber-600",
        badge:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      },
      Course: {
        icon: "🏃",
        gradient: "from-blue-500 to-indigo-600",
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      Natation: {
        icon: "🏊",
        gradient: "from-cyan-500 to-teal-600",
        badge:
          "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      },
      Randonnée: {
        icon: "🥾",
        gradient: "from-green-500 to-emerald-600",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
      Marche: {
        icon: "🚶",
        gradient: "from-lime-500 to-green-600",
        badge:
          "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
      },
      Rameur: {
        icon: "🚣",
        gradient: "from-sky-500 to-blue-600",
        badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
      },
      Fitness: {
        icon: "💪",
        gradient: "from-purple-500 to-violet-600",
        badge:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      },
      Entraînement: {
        icon: "🏋️",
        gradient: "from-indigo-500 to-purple-600",
        badge:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
      },
    };
    return (
      configs[type] || {
        icon: "🏆",
        gradient: "from-gray-500 to-slate-600",
        badge:
          "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
      }
    );
  };

  const getTrimpColor = (trimp: number | null) => {
    if (!trimp) return "text-text-muted";
    if (trimp < 50) return "text-green-600 dark:text-green-400";
    if (trimp < 100) return "text-yellow-600 dark:text-yellow-400";
    if (trimp < 200) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return "text-green-600 dark:text-green-400";
    if (rpe <= 6) return "text-yellow-600 dark:text-yellow-400";
    if (rpe <= 8) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const activityConfig = activity ? getActivityTypeConfig(activity.type) : null;

  // Préparer les données pour le graphique d'élévation
  const elevationChartData = gpsData
    .filter((point) => point.ele !== undefined)
    .map((point, index) => ({
      index,
      elevation: point.ele,
    }));

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/activities")}
          className="text-cta hover:text-cta/80 mb-4 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
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

        {success && (
          <div className="glass-panel border border-success/40 text-success px-4 py-3 mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="glass-panel border border-danger/40 text-danger px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {activityConfig && (
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activityConfig.gradient} flex items-center justify-center text-4xl shadow-lg transform hover:scale-110 transition-transform duration-300`}
              >
                {activityConfig.icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast">
                  {activity.type}
                </h1>
                {activity.subSport && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${activityConfig?.badge}`}
                  >
                    {activity.subSport}
                  </span>
                )}
              </div>
              <p className="text-text-body dark:text-dark-text-secondary text-lg">
                {new Date(activity.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" à "}
                {new Date(activity.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {activity.fileName && (
                <p className="text-sm text-text-secondary dark:text-dark-text-muted mt-1 flex items-center gap-2">
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
          <div className="flex items-center gap-3">
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
                {downloadingGpx ? "Export GPX..." : "Exporter GPX"}
              </button>
            )}
            {activity.fileName && (
              <button
                onClick={() => setIsReplacingFile(true)}
                className="btn-secondary"
              >
                Remplacer le fichier
              </button>
            )}
            <button onClick={startEditing} className="btn-primary">
              Modifier l'activité
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
                {exportingImage ? "Export..." : "Exporter"}
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-border-base dark:border-dark-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleExportImage("png")}
                  disabled={exportingImage}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded-t-lg"
                >
                  Exporter en PNG
                </button>
                <button
                  onClick={() => handleExportImage("pdf")}
                  disabled={exportingImage}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded-b-lg"
                >
                  Exporter en PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de remplacement de fichier */}
      {isReplacingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-panel p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-text-dark mb-4">
              Remplacer le fichier
            </h2>
            <p className="text-sm text-text-body mb-4">
              Le remplacement du fichier mettra à jour toutes les données de
              l'activité (durée, distance, GPS, etc.) avec les nouvelles données
              du fichier.
            </p>

            <form onSubmit={handleReplaceFile} className="space-y-4">
              <div>
                <label
                  htmlFor="replacement-file"
                  className="block text-sm font-medium text-text-body mb-2"
                >
                  Nouveau fichier
                </label>
                <input
                  type="file"
                  id="replacement-file"
                  accept=".fit,.gpx,.csv"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-3 border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
                />
                <p className="text-sm text-text-secondary mt-2">
                  Formats acceptés: FIT, GPX, CSV
                </p>
              </div>

              {replacementFile && (
                <div className="bg-info-light border border-info p-3 rounded-md">
                  <p className="text-sm text-info-dark">
                    Fichier sélectionné: <strong>{replacementFile.name}</strong>
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Taille: {(replacementFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplacingFile(false);
                    setReplacementFile(null);
                  }}
                  className="flex-1 px-4 py-2 bg-bg-gray-100 text-text-body rounded-lg hover:bg-bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile || !replacementFile}
                  className="flex-1 px-4 py-2 bg-gradient-sport text-white dark:text-white rounded-lg hover:shadow-glow-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile ? "Remplacement..." : "Remplacer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire d'édition */}
      {isEditing && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-info">
          <h2 className="text-2xl font-bold mb-4 text-text-dark">
            Modifier l'activité
          </h2>
          <form onSubmit={handleSubmitEdit} className="space-y-6">
            {/* Section Informations générales */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Type *
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    required
                  >
                    <option value="Cyclisme">Cyclisme</option>
                    <option value="Course">Course</option>
                    <option value="Marche">Marche</option>
                    <option value="Rameur">Rameur</option>
                    <option value="Randonnée">Randonnée</option>
                    <option value="Natation">Natation</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Entraînement">Entraînement</option>
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    required
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                      className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                      className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                      className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
                Fréquence cardiaque
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    FC Moyenne (bpm)
                  </label>
                  <input
                    type="number"
                    value={editForm.avgHeartRate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, avgHeartRate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                    value={editForm.maxHeartRate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, maxHeartRate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                    max="250"
                  />
                </div>
              </div>
            </div>

            {/* Section Vitesse */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section Puissance */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
                Puissance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Puissance Moyenne (W)
                  </label>
                  <input
                    type="number"
                    value={editForm.avgPower}
                    onChange={(e) =>
                      setEditForm({ ...editForm, avgPower: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Puissance Normalisée (W)
                  </label>
                  <input
                    type="number"
                    value={editForm.normalizedPower}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        normalizedPower: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section Autres données */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
                Autres données
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Cadence Moyenne (rpm)
                  </label>
                  <input
                    type="number"
                    value={editForm.avgCadence}
                    onChange={(e) =>
                      setEditForm({ ...editForm, avgCadence: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Dénivelé (m)
                  </label>
                  <input
                    type="number"
                    value={editForm.elevationGain}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        elevationGain: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={editForm.calories}
                    onChange={(e) =>
                      setEditForm({ ...editForm, calories: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Section Météo */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                  >
                    <option value="">-- Aucune modification --</option>
                    <option value="ensoleille">☀️ Ensoleillé</option>
                    <option value="partiellement-nuageux">
                      ⛅ Partiellement nuageux
                    </option>
                    <option value="nuageux">☁️ Nuageux</option>
                    <option value="couvert">☁️ Couvert</option>
                    <option value="pluie-legere">🌦️ Pluie légère</option>
                    <option value="pluie">🌧️ Pluie</option>
                    <option value="orage">⛈️ Orage</option>
                    <option value="neige">❄️ Neige</option>
                    <option value="brouillard">🌫️ Brouillard</option>
                    <option value="vent">💨 Venteux</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Température (°C)
                  </label>
                  <input
                    type="number"
                    value={editForm.weatherTemperature}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        weatherTemperature: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                    value={editForm.weatherWindSpeed}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        weatherWindSpeed: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                    value={editForm.weatherWindDirection}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        weatherWindDirection: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    placeholder="ex: 180 (Nord=0, Est=90, Sud=180, Ouest=270)"
                    min="0"
                    max="359"
                  />
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                💡 La modification des conditions météo remplacera les données
                météo existantes pour cette sortie.
              </p>
            </div>

            {/* Section RPE et Sensations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-text-dark">
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
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
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    rows={3}
                    placeholder="Ex: Jambes lourdes, bonne récupération, fatigue générale..."
                    maxLength={500}
                  />
                </div>
              </div>
            </div>

            {/* Note d'information */}
            <div className="bg-info-light p-4 rounded-lg border border-info">
              <p className="text-sm text-info-dark">
                <strong>Note :</strong> Si vous modifiez la fréquence cardiaque
                moyenne ou la durée, le TRIMP sera automatiquement recalculé par
                le système.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t border-border-base">
              <button type="submit" className="btn-primary font-display">
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="btn-secondary text-text-dark"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenu exportable */}
      <div
        id="activity-content"
        className="bg-white dark:bg-dark-bg p-4 rounded-xl"
      >
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">🛣️</div>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                Distance
              </p>
              <p className="text-2xl font-bold text-brand">
                {formatDistance(activity.distance)}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">⏱️</div>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                Durée
              </p>
              <p className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">
                {formatDuration(activity.duration)}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">🚀</div>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                Vitesse moy
              </p>
              <p className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">
                {formatSpeed(activity.avgSpeed)}
              </p>
              <p className="text-xs text-text-tertiary dark:text-dark-text-muted">
                {formatPace(activity.avgSpeed)}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">❤️</div>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                FC moyenne
              </p>
              <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                {activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : "-"}
              </p>
              <p className="text-xs text-text-tertiary dark:text-dark-text-muted">
                Max:{" "}
                {activity.maxHeartRate ? `${activity.maxHeartRate} bpm` : "-"}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">⛰️</div>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                Dénivelé
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatElevation(activity.elevationGain)}
              </p>
              {activity.elevationLoss && (
                <p className="text-xs text-text-tertiary dark:text-dark-text-muted">
                  Descente: {formatElevation(activity.elevationLoss)}
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="text-2xl mb-2">💪</div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  TRIMP
                </p>
                <MetricInfo metric="trimp" />
              </div>
              <p
                className={`text-2xl font-bold ${getTrimpColor(
                  activity.trimp
                )}`}
              >
                {activity.trimp || "-"}
              </p>
            </div>
          </div>

          {activity.rpe && (
            <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                  RPE (Effort Perçu)
                </p>
                <p
                  className={`text-2xl font-bold ${getRpeColor(activity.rpe)}`}
                >
                  {activity.rpe}/10
                </p>
                <p className="text-xs text-text-tertiary dark:text-dark-text-muted">
                  {activity.rpe <= 3
                    ? "Facile"
                    : activity.rpe <= 6
                    ? "Modéré"
                    : activity.rpe <= 8
                    ? "Difficile"
                    : "Extrême"}
                </p>
              </div>
            </div>
          )}

          {activity.avgTemperature && (
            <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="text-2xl mb-2">🌡️</div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                  Température
                </p>
                <p className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">
                  {activity.avgTemperature}°C
                </p>
                {activity.maxTemperature && (
                  <p className="text-xs text-text-tertiary dark:text-dark-text-muted">
                    Max: {activity.maxTemperature}°C
                  </p>
                )}
              </div>
            </div>
          )}

          {activity.movingTime && (
            <div className="glass-panel p-4 rounded-lg border border-border-base shadow-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="text-2xl mb-2">⏸️</div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                  Temps en pause
                </p>
                <p className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast">
                  {formatDuration(activity.duration - activity.movingTime)}
                </p>
                <p className="text-xs text-text-tertiary dark:text-dark-text-muted">
                  En mouvement: {formatDuration(activity.movingTime)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notes de sensations */}
        {activity.feelingNotes && (
          <div className="glass-panel p-6 rounded-lg border border-amber-200 dark:border-amber-800/30 shadow-card mb-8 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
            <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl">
                📝
              </div>
              Notes sur les sensations
            </h3>
            <p className="text-text-body dark:text-dark-text-secondary whitespace-pre-wrap leading-relaxed pl-13">
              {activity.feelingNotes}
            </p>
          </div>
        )}

        {/* Météo */}
        {activity.weather &&
          (() => {
            try {
              const weather: WeatherData = JSON.parse(activity.weather);

              const getWindDirection = (degrees: number) => {
                const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
                const index = Math.round(degrees / 45) % 8;
                return directions[index];
              };

              return (
                <div className="glass-panel p-6 mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5" />
                  <div className="relative z-10">
                    <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-xl">
                        🌤️
                      </div>
                      Météo lors de l'activité
                    </h2>

                    {/* Carte principale avec icône et condition */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="glass-panel p-6 rounded-xl shadow-sm flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200/50 dark:border-sky-800/30">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                          alt={weather.description}
                          className="w-20 h-20"
                        />
                        <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast capitalize mt-2">
                          {weather.description}
                        </p>
                      </div>

                      <div className="glass-panel p-6 rounded-xl shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                          <div className="text-3xl mb-3">🌡️</div>
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                            Température
                          </p>
                          <p className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast">
                            {weather.temperature}°C
                          </p>
                          <p className="text-sm text-text-muted dark:text-dark-text-muted mt-2">
                            Ressenti{" "}
                            <span className="font-semibold">
                              {weather.feelsLike}°C
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="glass-panel p-6 rounded-xl shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                          <div className="text-3xl mb-3">💨</div>
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">
                            Vent
                          </p>
                          <p className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast">
                            {weather.windSpeed} km/h
                          </p>
                          <p className="text-sm text-text-muted dark:text-dark-text-muted mt-2">
                            Direction{" "}
                            <span className="font-semibold">
                              {getWindDirection(weather.windDirection)} (
                              {weather.windDirection}°)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl mb-2">💧</div>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wide">
                          Humidité
                        </p>
                        <p className="text-xl font-bold text-text-dark dark:text-dark-text-contrast mt-1">
                          {weather.humidity}%
                        </p>
                      </div>

                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl mb-2">🌡️</div>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wide">
                          Pression
                        </p>
                        <p className="text-xl font-bold text-text-dark dark:text-dark-text-contrast mt-1">
                          {weather.pressure} hPa
                        </p>
                      </div>

                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl mb-2">☁️</div>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-wide">
                          Nuages
                        </p>
                        <p className="text-xl font-bold text-text-dark dark:text-dark-text-contrast mt-1">
                          {weather.clouds}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } catch (e) {
              console.error("Error parsing weather data:", e);
              return null;
            }
          })()}

        {/* Carte GPS */}
        {gpsData.length > 0 && (
          <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card mb-8">
            <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-contrast mb-4 font-display">
              Tracé GPS
            </h2>
            <div className="h-96 rounded-lg overflow-hidden border-4 border-panel-border shadow-lg">
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
                {/* Ajustement automatique des limites de la carte */}
                <FitBounds
                  positions={gpsData.map((point) => [point.lat, point.lon])}
                />
                {/* Ligne d'ombre/bordure noire pour meilleur contraste */}
                <Polyline
                  positions={gpsData.map((point) => [point.lat, point.lon])}
                  color="#000000"
                  weight={8}
                  opacity={0.3}
                />
                {/* Ligne principale en rouge vif */}
                <Polyline
                  positions={gpsData.map((point) => [point.lat, point.lon])}
                  color="#FF3B30"
                  weight={5}
                  opacity={0.9}
                />
              </MapContainer>
            </div>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-3">
              📍 {gpsData.length} points GPS • Distance totale:{" "}
              {activity?.distance.toFixed(2)} km
            </p>
          </div>
        )}

        {/* Graphique d'élévation */}
        {elevationChartData.length > 0 && (
          <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card mb-8">
            <h2 className="text-xl font-semibold text-text-dark mb-4">
              Profil d'élévation
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={elevationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="index" stroke="#6B7280" hide />
                <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fdf7e5",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                  }}
                  formatter={(value: any) => [`${value} m`, "Altitude"]}
                />
                <Line
                  type="monotone"
                  dataKey="elevation"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  fill="#10B981"
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Zones de FC */}
        {hrZonesData && (
          <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card mb-8">
            <h2 className="text-xl font-semibold text-text-dark mb-4">
              Analyse des zones FC
            </h2>

            <div className="mb-6 p-4 bg-info-light border border-info rounded-md">
              <p className="text-sm text-info-dark">
                <strong>Zone d'entraînement:</strong>{" "}
                {hrZonesData.currentZone.name} ({hrZonesData.currentZone.min}-
                {hrZonesData.currentZone.max} bpm)
              </p>
              <p className="text-sm text-info-dark mt-1">
                FC moyenne: <strong>{activity.avgHeartRate} bpm</strong> | FC
                max: <strong>{activity.maxHeartRate} bpm</strong>
              </p>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hrZonesData.zones}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                  label={{ value: "BPM", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fdf7e5",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="min" fill="#7FBBB3" name="Min" />
                <Bar dataKey="max" fill="#E69875" name="Max" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Données supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cardio */}
          {(activity.avgHeartRate || activity.maxHeartRate) && (
            <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Cardio
              </h3>
              <div className="space-y-3">
                {activity.avgHeartRate && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">FC moyenne</span>
                    <span className="font-medium text-text-dark">
                      {activity.avgHeartRate} bpm
                    </span>
                  </div>
                )}
                {activity.maxHeartRate && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">FC maximale</span>
                    <span className="font-medium text-text-dark">
                      {activity.maxHeartRate} bpm
                    </span>
                  </div>
                )}
                {activity.trimp && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">TRIMP</span>
                    <span className="font-medium text-accent-500">
                      {activity.trimp}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vitesse */}
          {(activity.avgSpeed || activity.maxSpeed) && (
            <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Vitesse
              </h3>
              <div className="space-y-3">
                {activity.avgSpeed && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Vitesse moyenne</span>
                    <span className="font-medium text-text-dark">
                      {formatSpeed(activity.avgSpeed)}
                    </span>
                  </div>
                )}
                {activity.maxSpeed && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Vitesse maximale
                    </span>
                    <span className="font-medium text-text-dark">
                      {formatSpeed(activity.maxSpeed)}
                    </span>
                  </div>
                )}
                {activity.avgSpeed && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Allure moyenne</span>
                    <span className="font-medium text-text-dark">
                      {formatPace(activity.avgSpeed)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Puissance */}
          {(activity.avgPower || activity.normalizedPower) && (
            <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Puissance
              </h3>
              <div className="space-y-3">
                {activity.avgPower && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Puissance moyenne
                    </span>
                    <span className="font-medium text-text-dark">
                      {activity.avgPower} W
                    </span>
                  </div>
                )}
                {activity.normalizedPower && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Puissance normalisée
                    </span>
                    <span className="font-medium text-text-dark">
                      {activity.normalizedPower} W
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Autres */}
          {(activity.avgCadence || activity.calories) && (
            <div className="glass-panel p-6 rounded-lg border border-border-base shadow-card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Autres données
              </h3>
              <div className="space-y-3">
                {activity.avgCadence && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Cadence moyenne</span>
                    <span className="font-medium text-text-dark">
                      {activity.avgCadence} rpm
                    </span>
                  </div>
                )}
                {activity.calories && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Calories</span>
                    <span className="font-medium text-text-dark">
                      {activity.calories} kcal
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Activities Section */}
      {activity && <SimilarActivities activityId={activity.id} />}
    </div>
  );
}
