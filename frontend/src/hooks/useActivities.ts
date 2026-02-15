/**
 * Hook personnalisé pour la gestion des activités
 */

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import type { Activity } from "../components/activities";
import type { EditFormData } from "../components/activities/ActivityEditModal";
import type {
  ActivityStats,
  ManualFormData,
  PaginationMeta,
} from "../types/activities";
import { INITIAL_MANUAL_FORM_DATA } from "../types/activities";
import { ITEMS_PER_PAGE, showRecordNotifications } from "../components/activities/activitiesConfig";

interface UseActivitiesReturn {
  // State
  activities: Activity[];
  stats: ActivityStats | null;
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  success: string;
  error: string;
  pagination: PaginationMeta | null;
  currentPage: number;
  filterType: string;
  period: string;
  searchTerm: string;
  activeTab: "upload" | "manual";
  selectedFile: File | null;
  selectedGpxFile: File | null;
  manualGpxFile: File | null;
  manualFormData: ManualFormData;
  deleteConfirm: { isOpen: boolean; id: number | null };
  editModal: { isOpen: boolean; activity: Activity | null };
  formRef: React.RefObject<HTMLDivElement | null>;

  // Setters
  setFilterType: (type: string) => void;
  setPeriod: (period: string) => void;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: "upload" | "manual") => void;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
  setSelectedFile: (file: File | null) => void;
  setSelectedGpxFile: (file: File | null) => void;
  setManualGpxFile: (file: File | null) => void;
  setManualFormData: (data: ManualFormData | ((prev: ManualFormData) => ManualFormData)) => void;
  setDeleteConfirm: (confirm: { isOpen: boolean; id: number | null }) => void;
  setEditModal: (modal: { isOpen: boolean; activity: Activity | null }) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;

  // Actions
  loadData: () => Promise<void>;
  handleUpload: (e: React.FormEvent) => Promise<void>;
  handleManualSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteClick: (id: number) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleEditClick: (activity: Activity) => void;
  handleEditSubmit: (formData: EditFormData) => Promise<void>;
  handleExportCsv: () => Promise<void>;
  scrollToForm: () => void;
}

export function useActivities(): UseActivitiesReturn {
  const formRef = useRef<HTMLDivElement>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [period, setPeriod] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGpxFile, setSelectedGpxFile] = useState<File | null>(null);
  const [manualGpxFile, setManualGpxFile] = useState<File | null>(null);
  const [manualFormData, setManualFormData] = useState<ManualFormData>(INITIAL_MANUAL_FORM_DATA);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; activity: Activity | null }>({
    isOpen: false,
    activity: null,
  });

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, period, debouncedSearch]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (filterType) params.type = filterType;
      if (debouncedSearch) params.search = debouncedSearch;
      if (period) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));
        params.startDate = startDate.toISOString().split("T")[0];
      }

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
    } catch {
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, period, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (selectedGpxFile) {
        formData.append("gpxFile", selectedGpxFile);
      }

      const response = await api.post("/api/activities/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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

      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      const gpxInput = document.getElementById("gpx-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      if (gpxInput) gpxInput.value = "";

      if (response.data.data?.newRecords?.length > 0) {
        showRecordNotifications(response.data.data.newRecords);
      }

      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de l'import");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const duration =
        (Number(manualFormData.hours) || 0) * 3600 +
        (Number(manualFormData.minutes) || 0) * 60 +
        (Number(manualFormData.seconds) || 0);

      const isStaticActivity = ["Musculation", "Yoga", "Mobilité"].includes(manualFormData.type);
      const distance = isStaticActivity ? 0 : Number(manualFormData.distance) * 1000;

      const localDate = new Date(
        manualFormData.date.getTime() - manualFormData.date.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16);

      const formData = new FormData();
      formData.append("date", localDate);
      formData.append("type", manualFormData.type);
      formData.append("duration", duration.toString());
      formData.append("distance", distance.toString());

      if (manualFormData.avgHeartRate) formData.append("avgHeartRate", manualFormData.avgHeartRate);
      if (manualFormData.maxHeartRate) formData.append("maxHeartRate", manualFormData.maxHeartRate);
      if (manualFormData.avgSpeed) formData.append("avgSpeed", manualFormData.avgSpeed);
      if (manualFormData.maxSpeed) formData.append("maxSpeed", manualFormData.maxSpeed);
      if (manualFormData.elevationGain) formData.append("elevationGain", manualFormData.elevationGain);
      if (manualFormData.calories) formData.append("calories", manualFormData.calories);
      if (manualFormData.avgCadence) formData.append("avgCadence", manualFormData.avgCadence);
      if (manualFormData.avgPower) formData.append("avgPower", manualFormData.avgPower);
      if (manualFormData.normalizedPower) formData.append("normalizedPower", manualFormData.normalizedPower);
      if (manualFormData.rpe) formData.append("rpe", manualFormData.rpe);
      if (manualFormData.feelingNotes) formData.append("feelingNotes", manualFormData.feelingNotes);
      if (manualFormData.youtubeUrl) formData.append("youtubeUrl", manualFormData.youtubeUrl);
      if (manualGpxFile) formData.append("gpxFile", manualGpxFile);

      const response = await api.post("/api/activities/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Activité créée avec succès !");
      setManualFormData(INITIAL_MANUAL_FORM_DATA);
      setManualGpxFile(null);

      const fileInput = document.getElementById("manual-gpx-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      if (response.data.data?.newRecords?.length > 0) {
        showRecordNotifications(response.data.data.newRecords);
      }

      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de la création de l'activité");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de la suppression");
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
      const duration =
        (Number(formData.hours) || 0) * 3600 +
        (Number(formData.minutes) || 0) * 60 +
        (Number(formData.seconds) || 0);

      const isStaticActivity = ["Musculation", "Yoga", "Mobilité"].includes(formData.type);
      const distance = isStaticActivity ? 0 : Number(formData.distance) * 1000;

      const localDate = new Date(
        formData.date.getTime() - formData.date.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16);

      const updateData: Record<string, unknown> = {
        date: localDate,
        type: formData.type,
        duration,
        distance,
      };

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
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

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `activites-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export CSV téléchargé");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.focus();
      }, 500);
    }
  };

  return {
    // State
    activities,
    stats,
    loading,
    uploading,
    uploadProgress,
    success,
    error,
    pagination,
    currentPage,
    filterType,
    period,
    searchTerm,
    activeTab,
    selectedFile,
    selectedGpxFile,
    manualGpxFile,
    manualFormData,
    deleteConfirm,
    editModal,
    formRef,

    // Setters
    setFilterType,
    setPeriod,
    setSearchTerm,
    setActiveTab,
    setCurrentPage,
    setSelectedFile,
    setSelectedGpxFile,
    setManualGpxFile,
    setManualFormData,
    setDeleteConfirm,
    setEditModal,
    setSuccess,
    setError,

    // Actions
    loadData,
    handleUpload,
    handleManualSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handleEditSubmit,
    handleExportCsv,
    scrollToForm,
  };
}
