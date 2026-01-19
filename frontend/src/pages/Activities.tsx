import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import CustomDatePicker from "../components/ui/DatePicker";
import { Label } from "../components/ui/input";
import { PageHeader } from "../components/ui/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import api from "../services/api";
import {
  ActivityFilters,
  ActivityCard,
  ActivityEditModal,
  type Activity,
  type EditFormData,
  formatDistance,
  formatDuration,
} from "../components/activities";

interface ActivityStats {
  count: number;
  totalDuration: number;
  totalDistance: number;
  totalTrimp: number;
  avgDuration: number;
  avgDistance: number;
  avgTrimp: number;
  avgHeartRate: number;
  byType: Record<string, number>;
}

interface NewRecord {
  recordType: string;
  recordTypeName: string;
  activityType: string;
  value: number;
  unit: string;
  previousValue: number | null;
  improvement: number | null;
}

const RECORD_TYPE_ICONS: Record<string, string> = {
  max_distance: "📏",
  max_avg_speed: "⚡",
  max_speed: "🚀",
  max_trimp: "💪",
  max_elevation: "⛰️",
  longest_duration: "⏱️",
  max_avg_heart_rate: "❤️",
  max_calories: "🔥",
};

const formatRecordValue = (value: number, unit: string): string => {
  switch (unit) {
    case "km":
      return `${value.toFixed(2)} km`;
    case "km/h":
      return `${value.toFixed(1)} km/h`;
    case "m":
      return `${Math.round(value)} m`;
    case "min":
      const hours = Math.floor(value / 60);
      const mins = Math.round(value % 60);
      return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
    case "bpm":
      return `${Math.round(value)} bpm`;
    case "kcal":
      return `${Math.round(value)} kcal`;
    case "points":
      return `${Math.round(value)} pts`;
    default:
      return `${value} ${unit}`;
  }
};

const showRecordNotifications = (newRecords: NewRecord[]) => {
  if (newRecords.length === 0) return;

  newRecords.forEach((record, index) => {
    setTimeout(() => {
      const icon = RECORD_TYPE_ICONS[record.recordType] || "🏆";
      const improvement = record.improvement
        ? ` (+${record.improvement.toFixed(1)}%)`
        : " (Premier record!)";

      toast.success(
        <div className="flex flex-col">
          <div className="font-bold flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            Nouveau Record!
          </div>
          <div className="text-sm">
            {record.recordTypeName} - {record.activityType}
          </div>
          <div className="font-semibold text-brand">
            {formatRecordValue(record.value, record.unit)}
            <span className="text-success text-xs ml-1">{improvement}</span>
          </div>
        </div>,
        {
          duration: 6000,
          icon: "🏆",
        }
      );
    }, index * 800); // Décaler les notifications pour ne pas tout afficher en même temps
  });
};

export default function Activities() {
  const formRef = useRef<HTMLDivElement>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; activity: Activity | null }>({
    isOpen: false,
    activity: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGpxFile, setSelectedGpxFile] = useState<File | null>(null);
  const [manualGpxFile, setManualGpxFile] = useState<File | null>(null);
  const [filterType, setFilterType] = useState("");
  const [period, setPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  } | null>(null);
  const ITEMS_PER_PAGE = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [manualFormData, setManualFormData] = useState({
    date: new Date(),
    type: "Cyclisme",
    hours: "",
    minutes: "",
    seconds: "",
    distance: "",
    avgHeartRate: "",
    maxHeartRate: "",
    avgSpeed: "",
    maxSpeed: "",
    elevationGain: "",
    calories: "",
    avgCadence: "",
    avgPower: "",
    normalizedPower: "",
    rpe: "",
    feelingNotes: "",
    youtubeUrl: "",
  });

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/60 text-white placeholder-gray-500 focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 outline-none transition";
  const compactInputClass =
    "w-full px-3 py-2 rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/60 text-white placeholder-gray-500 focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 outline-none text-center transition";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";
  const primaryActionClass = "btn-primary w-full font-display";

  useEffect(() => {
    loadData();
  }, [filterType, period, currentPage, debouncedSearch]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, period, debouncedSearch]);

  // Debounce pour la recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (filterType) params.type = filterType;
      if (debouncedSearch) params.search = debouncedSearch;

      const [activitiesRes, statsRes] = await Promise.all([
        api.get("/api/activities", { params }),
        api.get("/api/activities/stats", {
          params: { period, type: filterType },
        }),
      ]);

      const paginatedData = activitiesRes.data.data;
      setActivities(paginatedData.data || []);
      setPagination({
        total: paginatedData.meta?.total || 0,
        perPage: paginatedData.meta?.perPage || ITEMS_PER_PAGE,
        currentPage: paginatedData.meta?.currentPage || 1,
        lastPage: paginatedData.meta?.lastPage || 1,
      });
      setStats(statsRes.data.data);
    } catch (err) {
      // Erreur gérée par toast
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Ajouter le fichier GPX s'il est présent
      if (selectedGpxFile) {
        formData.append("gpxFile", selectedGpxFile);
      }

      const response = await api.post("/api/activities/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSuccess("Activité importée avec succès !");
      setSelectedFile(null);
      setSelectedGpxFile(null);

      // Reset file inputs
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      const gpxInput = document.getElementById(
        "gpx-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      if (gpxInput) gpxInput.value = "";

      // Afficher les notifications de nouveaux records
      if (
        response.data.data?.newRecords &&
        response.data.data.newRecords.length > 0
      ) {
        showRecordNotifications(response.data.data.newRecords);
      }

      // Recharger les données
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'import");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.delete(`/api/activities/${deleteConfirm.id}`);
      setSuccess("Activité supprimée");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleEditClick = (activity: Activity) => {
    setEditModal({ isOpen: true, activity });
  };

  const handleEditSubmit = async (formData: EditFormData) => {
    if (!editModal.activity) return;

    setError("");
    setUploading(true);

    try {
      // Convertir le temps en secondes
      const duration =
        (Number(formData.hours) || 0) * 3600 +
        (Number(formData.minutes) || 0) * 60 +
        (Number(formData.seconds) || 0);

      // Convertir la distance en mètres
      const isStaticActivity = ["Musculation", "Yoga", "Mobilité"].includes(formData.type);
      const distance = isStaticActivity ? 0 : Number(formData.distance) * 1000;

      // Préparer la date au format ISO local
      const localDate = new Date(
        formData.date.getTime() - formData.date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      const updateData: Record<string, unknown> = {
        date: localDate,
        type: formData.type,
        duration,
        distance,
      };

      // Ajouter les champs optionnels
      if (formData.avgHeartRate) updateData.avgHeartRate = Number(formData.avgHeartRate);
      if (formData.maxHeartRate) updateData.maxHeartRate = Number(formData.maxHeartRate);
      if (formData.avgSpeed) updateData.avgSpeed = Number(formData.avgSpeed);
      if (formData.maxSpeed) updateData.maxSpeed = Number(formData.maxSpeed);
      if (formData.elevationGain) updateData.elevationGain = Number(formData.elevationGain);
      if (formData.calories) updateData.calories = Number(formData.calories);
      if (formData.avgCadence) updateData.avgCadence = Number(formData.avgCadence);
      if (formData.avgPower) updateData.avgPower = Number(formData.avgPower);
      if (formData.normalizedPower) updateData.normalizedPower = Number(formData.normalizedPower);
      if (formData.rpe) updateData.rpe = Number(formData.rpe);
      if (formData.feelingNotes) updateData.feelingNotes = formData.feelingNotes;

      await api.patch(`/api/activities/${editModal.activity.id}`, updateData);
      setSuccess("Activité mise à jour");
      setEditModal({ isOpen: false, activity: null });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setUploading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await api.get("/api/exports/activities/csv", {
        params,
        responseType: "blob",
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `activites-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export CSV téléchargé");
    } catch (err) {
      toast.error("Erreur lors de l'export");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      // Convertir le temps en secondes
      const duration =
        (Number(manualFormData.hours) || 0) * 3600 +
        (Number(manualFormData.minutes) || 0) * 60 +
        (Number(manualFormData.seconds) || 0);

      // Convertir la distance en mètres (0 pour activités statiques)
      const isStaticActivity = ["Musculation", "Yoga", "Mobilité"].includes(manualFormData.type);
      const distance = isStaticActivity ? 0 : Number(manualFormData.distance) * 1000;

      // Le format datetime-local donne "2024-11-21T22:00" sans fuseau horaire
      // On l'envoie tel quel au backend qui le traitera comme heure locale
      // Avec le DatePicker, on a un objet Date, on le convertit en string ISO local
      const localDate = new Date(
        manualFormData.date.getTime() -
          manualFormData.date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      const formData = new FormData();
      formData.append("date", localDate);
      formData.append("type", manualFormData.type);
      formData.append("duration", duration.toString());
      formData.append("distance", distance.toString());

      // Ajouter les champs optionnels seulement s'ils sont remplis
      if (manualFormData.avgHeartRate)
        formData.append("avgHeartRate", manualFormData.avgHeartRate);
      if (manualFormData.maxHeartRate)
        formData.append("maxHeartRate", manualFormData.maxHeartRate);
      if (manualFormData.avgSpeed)
        formData.append("avgSpeed", manualFormData.avgSpeed);
      if (manualFormData.maxSpeed)
        formData.append("maxSpeed", manualFormData.maxSpeed);
      if (manualFormData.elevationGain)
        formData.append("elevationGain", manualFormData.elevationGain);
      if (manualFormData.calories)
        formData.append("calories", manualFormData.calories);
      if (manualFormData.avgCadence)
        formData.append("avgCadence", manualFormData.avgCadence);
      if (manualFormData.avgPower)
        formData.append("avgPower", manualFormData.avgPower);
      if (manualFormData.normalizedPower)
        formData.append("normalizedPower", manualFormData.normalizedPower);
      if (manualFormData.rpe) formData.append("rpe", manualFormData.rpe);
      if (manualFormData.feelingNotes)
        formData.append("feelingNotes", manualFormData.feelingNotes);
      if (manualFormData.youtubeUrl)
        formData.append("youtubeUrl", manualFormData.youtubeUrl);

      // Ajouter le fichier GPX s'il est présent
      if (manualGpxFile) {
        formData.append("gpxFile", manualGpxFile);
      }

      const response = await api.post("/api/activities/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Activité créée avec succès !");
      setManualFormData({
        date: new Date(),
        type: "Cyclisme",
        hours: "",
        minutes: "",
        seconds: "",
        distance: "",
        avgHeartRate: "",
        maxHeartRate: "",
        avgSpeed: "",
        maxSpeed: "",
        elevationGain: "",
        calories: "",
        avgCadence: "",
        avgPower: "",
        normalizedPower: "",
        rpe: "",
        feelingNotes: "",
        youtubeUrl: "",
      });
      setManualGpxFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "manual-gpx-file"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Afficher les notifications de nouveaux records
      if (
        response.data.data?.newRecords &&
        response.data.data.newRecords.length > 0
      ) {
        showRecordNotifications(response.data.data.newRecords);
      }

      // Recharger les données
      loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'activité"
      );
    } finally {
      setUploading(false);
    }
  };

  const periodLabel = () => {
    switch (period) {
      case "7":
        return "7 derniers jours";
      case "30":
        return "30 derniers jours";
      case "90":
        return "90 derniers jours";
      case "365":
        return "Cette année";
      default:
        return "";
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus sur l'input file pour améliorer l'UX
      setTimeout(() => {
        const fileInput = document.getElementById("file-upload");
        if (fileInput) {
          fileInput.focus();
        }
      }, 500);
    }
  };

  const actions = (
    <button onClick={scrollToForm} className="btn-primary font-display">
      Nouvelle importation
    </button>
  );

  return (
    <AppLayout
      title="Activités"
      description="Importez vos fichiers et suivez vos stats"
      actions={actions}
    >
      <div className="space-y-8">
        <PageHeader
          eyebrow="Activités"
          title="Suivi des sorties"
          description="Importez vos fichiers ou ajoutez vos entraînements manuellement."
          icon="activities"
          gradient="from-[#FFAB40] to-[#FF5252]"
          accentColor="#FFAB40"
        />

        {success && (
          <div className="glass-panel border-success/30 text-success px-4 py-3">
            {success}
          </div>
        )}

        {error && (
          <div className="glass-panel border-error/30 text-error px-4 py-3">
            {error}
          </div>
        )}

        {stats && stats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-brand"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted">
                      Activités
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {periodLabel()}
                    </p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-brand mb-1">
                  {stats.count}
                </p>
                <p className="text-sm text-text-muted">
                  Moy:{" "}
                  {stats.avgDistance ? formatDistance(stats.avgDistance) : "-"}
                  /sortie
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-text-muted">
                    Distance totale
                  </p>
                </div>
                <p className="text-4xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
                  {formatDistance(stats.totalDistance)}
                </p>
                <p className="text-sm text-text-muted">
                  Moy: {formatDistance(stats.avgDistance)}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-text-muted">
                    Temps total
                  </p>
                </div>
                <p className="text-4xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
                  {formatDuration(stats.totalDuration)}
                </p>
                <p className="text-sm text-text-muted">
                  Moy: {formatDuration(stats.avgDuration)}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-text-muted">
                    TRIMP total
                  </p>
                </div>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {stats.totalTrimp}
                </p>
                <p className="text-sm text-text-muted">
                  Moy: {stats.avgTrimp}/activité
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div ref={formRef} className="lg:col-span-1" id="import-form">
            <Card title="Nouvelle activité">
              {/* Tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 rounded-2xl px-4 py-3 text-lg font-semibold font-display border-4 transition-all ${
                    activeTab === "upload"
                      ? "bg-panel-bg text-text-primary border-panel-border shadow-xl"
                      : "text-text-secondary border-dashed border-panel-border hover:bg-panel-bg/30"
                  }`}
                >
                  Importer un fichier
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 rounded-2xl px-4 py-3 text-lg font-semibold font-display border-4 transition-all ${
                    activeTab === "manual"
                      ? "bg-panel-bg text-text-primary border-panel-border shadow-xl"
                      : "text-text-secondary border-dashed border-panel-border hover:bg-panel-bg/30"
                  }`}
                >
                  Créer manuellement
                </button>
              </div>

              {/* Upload Form */}
              {activeTab === "upload" && (
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label htmlFor="file-upload" className={labelClass}>
                      Fichier FIT/CSV *
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      accept=".fit,.csv"
                      onChange={handleFileChange}
                      required
                      className="w-full px-4 py-3 border border-border-base rounded-xl bg-bg-white/90 focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    />
                    <p className="text-sm text-text-muted mt-2">
                      📊 Fichier contenant les métriques (durée, FC,
                      puissance...)
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="glass-panel p-3 border border-accent">
                      <p className="text-sm text-text-body">
                        Fichier métrique: <strong>{selectedFile.name}</strong>
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Taille: {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="gpx-upload" className={labelClass}>
                      Fichier GPX (optionnel)
                    </label>
                    <input
                      type="file"
                      id="gpx-upload"
                      accept=".gpx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedGpxFile(e.target.files[0]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-border-base rounded-xl bg-bg-white/90 focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
                    />
                    <p className="text-sm text-text-muted mt-2">
                      📍 Fichier pour la trace GPS complète
                    </p>
                  </div>

                  {selectedGpxFile && (
                    <div className="glass-panel p-3 border border-success/40 bg-success-light/60">
                      <p className="text-sm text-success">
                        ✓ Fichier GPS: <strong>{selectedGpxFile.name}</strong>
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Taille: {(selectedGpxFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className={primaryActionClass}
                  >
                    {uploading ? "Import en cours..." : "Importer"}
                  </button>

                  {uploading && (
                    <div className="w-full">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="bg-brand h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center text-text-muted mt-1">
                        {uploadProgress}%
                      </p>
                    </div>
                  )}

                  <div className="glass-panel p-4 border border-info bg-info-light/60">
                    <p className="text-sm text-info-dark">
                      <strong>💡 Import en 2 étapes :</strong>
                    </p>
                    <ul className="text-sm text-info-dark mt-2 space-y-1 list-disc list-inside">
                      <li>
                        Le fichier FIT/CSV fournit les métriques (durée, FC,
                        puissance, etc.)
                      </li>
                      <li>
                        Le fichier GPX (optionnel) fournit la trace GPS complète
                      </li>
                      <li>
                        Le TRIMP est calculé automatiquement si FC disponible
                      </li>
                    </ul>
                  </div>
                </form>
              )}

              {/* Manual Form */}
              {activeTab === "manual" && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="manual-date" className={labelClass}>
                        Date et heure *
                      </label>
                      <CustomDatePicker
                        selected={manualFormData.date}
                        onChange={(date) =>
                          setManualFormData({
                            ...manualFormData,
                            date: date || new Date(),
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Type d'activité *</Label>
                      <Select
                        value={manualFormData.type}
                        onValueChange={(value) =>
                          setManualFormData({ ...manualFormData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Course">🏃 Course</SelectItem>
                          <SelectItem value="Cyclisme">🚴 Cyclisme</SelectItem>
                          <SelectItem value="Marche">🚶 Marche</SelectItem>
                          <SelectItem value="Mobilité">🤸 Mobilité</SelectItem>
                          <SelectItem value="Musculation">
                            🏋️ Musculation
                          </SelectItem>
                          <SelectItem value="Natation">🏊 Natation</SelectItem>
                          <SelectItem value="Rameur">🚣 Rameur</SelectItem>
                          <SelectItem value="Randonnée">
                            🥾 Randonnée
                          </SelectItem>
                          <SelectItem value="Yoga">🧘 Yoga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Champ YouTube pour activités statiques */}
                    {["Mobilité", "Yoga", "Musculation"].includes(manualFormData.type) && (
                      <div className="col-span-2">
                        <label htmlFor="manual-youtube" className={labelClass}>
                          Lien vidéo YouTube
                        </label>
                        <input
                          type="url"
                          id="manual-youtube"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={manualFormData.youtubeUrl}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              youtubeUrl: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className={labelClass}>Durée *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <input
                            type="number"
                            min="0"
                            placeholder="HH"
                            value={manualFormData.hours}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                hours: e.target.value,
                              })
                            }
                            className={compactInputClass}
                          />
                          <p className="text-xs text-text-muted text-center mt-1">
                            Heures
                          </p>
                        </div>
                        <div>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="MM"
                            value={manualFormData.minutes}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                minutes: e.target.value,
                              })
                            }
                            className={compactInputClass}
                          />
                          <p className="text-xs text-text-muted text-center mt-1">
                            Minutes
                          </p>
                        </div>
                        <div>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="SS"
                            value={manualFormData.seconds}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                seconds: e.target.value,
                              })
                            }
                            className={compactInputClass}
                          />
                          <p className="text-xs text-text-muted text-center mt-1">
                            Secondes
                          </p>
                        </div>
                      </div>
                    </div>

                    {!["Musculation", "Yoga", "Mobilité"].includes(manualFormData.type) && (
                      <div className="col-span-2">
                        <label htmlFor="manual-distance" className={labelClass}>
                          Distance (km) *
                        </label>
                        <input
                          type="number"
                          id="manual-distance"
                          step="0.01"
                          min="0"
                          placeholder="Ex: 42.5"
                          value={manualFormData.distance}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              distance: e.target.value,
                            })
                          }
                          required={!["Musculation", "Yoga", "Mobilité"].includes(manualFormData.type)}
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* Champs avancés (FC, Dénivelé, Calories) - seulement pour Cyclisme et Course */}
                    {(manualFormData.type === "Cyclisme" ||
                      manualFormData.type === "Course") && (
                      <>
                        <div>
                          <label htmlFor="manual-avgHR" className={labelClass}>
                            FC moyenne
                          </label>
                          <input
                            type="number"
                            id="manual-avgHR"
                            min="0"
                            placeholder="bpm"
                            value={manualFormData.avgHeartRate}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                avgHeartRate: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label htmlFor="manual-maxHR" className={labelClass}>
                            FC max
                          </label>
                          <input
                            type="number"
                            id="manual-maxHR"
                            min="0"
                            placeholder="bpm"
                            value={manualFormData.maxHeartRate}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                maxHeartRate: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manual-elevation"
                            className={labelClass}
                          >
                            Dénivelé (m)
                          </label>
                          <input
                            type="number"
                            id="manual-elevation"
                            min="0"
                            placeholder="Ex: 450"
                            value={manualFormData.elevationGain}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                elevationGain: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manual-calories"
                            className={labelClass}
                          >
                            Calories
                          </label>
                          <input
                            type="number"
                            id="manual-calories"
                            min="0"
                            placeholder="kcal"
                            value={manualFormData.calories}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                calories: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    {/* Champ Calories uniquement pour Rameur et Marche */}
                    {(manualFormData.type === "Rameur" ||
                      manualFormData.type === "Marche") && (
                      <div>
                        <label htmlFor="manual-calories" className={labelClass}>
                          Calories
                        </label>
                        <input
                          type="number"
                          id="manual-calories"
                          min="0"
                          placeholder="kcal"
                          value={manualFormData.calories}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              calories: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* Champs spécifiques au Cyclisme et Course */}
                    {(manualFormData.type === "Cyclisme" ||
                      manualFormData.type === "Course") && (
                      <>
                        <div>
                          <label
                            htmlFor="manual-avgSpeed"
                            className={labelClass}
                          >
                            Vitesse moyenne (km/h)
                          </label>
                          <input
                            type="number"
                            id="manual-avgSpeed"
                            step="0.1"
                            min="0"
                            placeholder="km/h"
                            value={manualFormData.avgSpeed}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                avgSpeed: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manual-maxSpeed"
                            className={labelClass}
                          >
                            Vitesse max (km/h)
                          </label>
                          <input
                            type="number"
                            id="manual-maxSpeed"
                            step="0.1"
                            min="0"
                            placeholder="km/h"
                            value={manualFormData.maxSpeed}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                maxSpeed: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manual-avgCadence"
                            className={labelClass}
                          >
                            Cadence moyenne (rpm/spm)
                          </label>
                          <input
                            type="number"
                            id="manual-avgCadence"
                            min="0"
                            placeholder="rpm/spm"
                            value={manualFormData.avgCadence}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                avgCadence: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manual-avgPower"
                            className={labelClass}
                          >
                            Puissance moyenne (W)
                          </label>
                          <input
                            type="number"
                            id="manual-avgPower"
                            min="0"
                            placeholder="watts"
                            value={manualFormData.avgPower}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                avgPower: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manual-normalizedPower"
                            className={labelClass}
                          >
                            Puissance normalisée (W)
                          </label>
                          <input
                            type="number"
                            id="manual-normalizedPower"
                            min="0"
                            placeholder="watts"
                            value={manualFormData.normalizedPower}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                normalizedPower: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    <div className="col-span-2">
                      <label htmlFor="manual-gpx-file" className={labelClass}>
                        Fichier GPX (optionnel)
                      </label>
                      <input
                        type="file"
                        id="manual-gpx-file"
                        accept=".gpx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setManualGpxFile(e.target.files[0]);
                          }
                        }}
                        className={inputClass}
                      />
                      <p className="text-sm text-text-muted mt-2">
                        📍 Si vous fournissez un fichier GPX, la distance, la
                        durée et le dénivelé seront extraits automatiquement du
                        fichier et remplaceront les valeurs saisies
                        manuellement. Le fichier permet aussi d'obtenir la météo
                        exacte de votre localisation.
                      </p>
                      {manualGpxFile && (
                        <div className="glass-panel border border-success/40 bg-success-light/60 p-3 rounded-xl mt-2">
                          <p className="text-sm text-success">
                            ✓ Fichier sélectionné:{" "}
                            <strong>{manualGpxFile.name}</strong>
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Les données GPS (distance, durée, dénivelé) du
                            fichier seront utilisées en priorité
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="manual-rpe" className={labelClass}>
                        RPE (Effort perçu 1-10)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          id="manual-rpe"
                          min="1"
                          max="10"
                          step="1"
                          value={manualFormData.rpe || "5"}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              rpe: e.target.value,
                            })
                          }
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8BC34A]"
                        />
                        <span className="text-xl font-bold text-[#8BC34A] w-8 text-center">
                          {manualFormData.rpe || "5"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Facile</span>
                        <span>Modéré</span>
                        <span>Difficile</span>
                        <span>Maximal</span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="manual-notes" className={labelClass}>
                        Notes de séance
                      </label>
                      <textarea
                        id="manual-notes"
                        rows={3}
                        placeholder="Détails de la séance (ex: Squat 5x5@100kg...)"
                        value={manualFormData.feelingNotes}
                        onChange={(e) =>
                          setManualFormData({
                            ...manualFormData,
                            feelingNotes: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className={primaryActionClass}
                  >
                    {uploading ? "Création en cours..." : "Créer l'activité"}
                  </button>

                  <div className="glass-panel p-4 border border-info bg-info-light/60">
                    <p className="text-sm text-info-dark">
                      <strong>💡 Astuce :</strong> Le TRIMP sera calculé
                      automatiquement si vous renseignez la FC moyenne et que
                      votre profil est configuré.
                    </p>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Liste et filtres */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtres */}
            <ActivityFilters
              period={period}
              setPeriod={setPeriod}
              filterType={filterType}
              setFilterType={setFilterType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {/* Liste */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Historique
                </h2>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={activities.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/30 text-brand hover:bg-brand/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Exporter en CSV"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-sm font-medium">Export CSV</span>
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="glass-panel p-5 h-40 flex flex-col justify-between"
                    >
                      <div className="flex justify-between">
                        <div className="flex gap-4">
                          <Skeleton className="w-14 h-14 rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <Skeleton key={j} className="h-12 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-gray-300 mb-2">
                    Aucune activité enregistrée
                  </p>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Importez votre première activité pour commencer à suivre vos
                    performances
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.lastPage > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    {pagination.total} activité{pagination.total > 1 ? "s" : ""} • Page{" "}
                    {pagination.currentPage} sur {pagination.lastPage}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Première page"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>

                    {/* Numéros de page */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                        let pageNum: number;
                        if (pagination.lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.lastPage - 2) {
                          pageNum = pagination.lastPage - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? "bg-brand text-black"
                                : "border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))}
                      disabled={currentPage === pagination.lastPage}
                      className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(pagination.lastPage)}
                      disabled={currentPage === pagination.lastPage}
                      className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Dernière page"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'activité"
        message="Voulez-vous vraiment supprimer cette activité ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />

      {/* Modale d'édition */}
      <ActivityEditModal
        activity={editModal.activity}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, activity: null })}
        onSubmit={handleEditSubmit}
        isLoading={uploading}
      />
    </AppLayout>
  );
}
