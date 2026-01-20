import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import type { Activity, ActivityEditForm } from "../types/activity";

interface UseActivityEditResult {
  editForm: ActivityEditForm;
  setEditForm: React.Dispatch<React.SetStateAction<ActivityEditForm>>;
  isEditing: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  handleSubmitEdit: (e: React.FormEvent) => Promise<void>;
}

const createEmptyForm = (): ActivityEditForm => ({
  type: "",
  date: "",
  time: "",
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

export const useActivityEdit = (
  activity: Activity | null,
  activityId: string | undefined,
  onSuccess: () => void
): UseActivityEditResult => {
  const [editForm, setEditForm] = useState<ActivityEditForm>(createEmptyForm());
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = useCallback(() => {
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
      } catch {
        // Ignore parsing errors
      }
    }

    // Extraire la date et l'heure
    const activityDate = new Date(activity.date);
    const dateStr = activityDate.toISOString().split("T")[0];
    const timeStr = activityDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setEditForm({
      type: activity.type,
      date: dateStr,
      time: timeStr,
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
  }, [activity]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSubmitEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Convertir HH:MM:SS en secondes
        const hours = Number(editForm.durationHours) || 0;
        const minutes = Number(editForm.durationMinutes) || 0;
        const seconds = Number(editForm.durationSeconds) || 0;
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        // Convertir km en mètres
        const distanceInMeters = Number(editForm.distanceKm) * 1000;

        // Combiner date et heure
        const dateTimeStr = editForm.time
          ? `${editForm.date}T${editForm.time}:00`
          : `${editForm.date}T00:00:00`;

        const updateData: Record<string, unknown> = {
          type: editForm.type,
          date: dateTimeStr,
          duration: totalSeconds,
          distance: distanceInMeters,
        };

        // Ajouter les champs optionnels
        if (editForm.avgHeartRate) updateData.avgHeartRate = Number(editForm.avgHeartRate);
        if (editForm.maxHeartRate) updateData.maxHeartRate = Number(editForm.maxHeartRate);
        if (editForm.avgSpeed) updateData.avgSpeed = Number(editForm.avgSpeed);
        if (editForm.maxSpeed) updateData.maxSpeed = Number(editForm.maxSpeed);
        if (editForm.avgPower) updateData.avgPower = Number(editForm.avgPower);
        if (editForm.normalizedPower) updateData.normalizedPower = Number(editForm.normalizedPower);
        if (editForm.avgCadence) updateData.avgCadence = Number(editForm.avgCadence);
        if (editForm.elevationGain) updateData.elevationGain = Number(editForm.elevationGain);
        if (editForm.calories) updateData.calories = Number(editForm.calories);

        // Ajouter RPE et notes
        updateData.rpe = editForm.rpe ? Number(editForm.rpe) : null;
        updateData.feelingNotes = editForm.feelingNotes || null;

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
            updateData.weatherWindDirection = Number(editForm.weatherWindDirection);
          }
        }

        await api.patch(`/api/activities/${activityId}`, updateData);

        setIsEditing(false);
        onSuccess();
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    },
    [editForm, activityId, onSuccess]
  );

  return {
    editForm,
    setEditForm,
    isEditing,
    startEditing,
    cancelEditing,
    handleSubmitEdit,
  };
};

export default useActivityEdit;
