import { useState, useEffect } from "react";
import CustomDatePicker from "../ui/DatePicker";
import { Label } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Activity } from "./activityUtils";
import { INPUT_CLASSES } from "./activitiesConfig";

interface EditFormData {
  date: Date;
  type: string;
  hours: string;
  minutes: string;
  seconds: string;
  distance: string;
  avgHeartRate: string;
  maxHeartRate: string;
  avgSpeed: string;
  maxSpeed: string;
  elevationGain: string;
  calories: string;
  avgCadence: string;
  avgPower: string;
  normalizedPower: string;
  rpe: string;
  feelingNotes: string;
}

interface ActivityEditModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditFormData) => Promise<void>;
  isLoading: boolean;
}

export default function ActivityEditModal({
  activity,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ActivityEditModalProps) {
  const [formData, setFormData] = useState<EditFormData>({
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
  });

  useEffect(() => {
    if (activity) {
      const totalSeconds = activity.duration;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setFormData({
        date: new Date(activity.date),
        type: activity.type,
        hours: hours > 0 ? hours.toString() : "",
        minutes: minutes > 0 ? minutes.toString() : "",
        seconds: seconds > 0 ? seconds.toString() : "",
        distance: activity.distance > 0 ? (activity.distance / 1000).toString() : "",
        avgHeartRate: activity.avgHeartRate?.toString() || "",
        maxHeartRate: activity.maxHeartRate?.toString() || "",
        avgSpeed: activity.avgSpeed?.toString() || "",
        maxSpeed: activity.maxSpeed?.toString() || "",
        elevationGain: activity.elevationGain?.toString() || "",
        calories: activity.calories?.toString() || "",
        avgCadence: activity.avgCadence?.toString() || "",
        avgPower: activity.avgPower?.toString() || "",
        normalizedPower: activity.normalizedPower?.toString() || "",
        rpe: "",
        feelingNotes: "",
      });
    }
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen || !activity) return null;

  const isStaticActivity = ["Musculation", "Yoga", "Mobilité"].includes(formData.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Modifier l'activité
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={INPUT_CLASSES.label}>Type d'activité</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="h-9 text-sm bg-[var(--surface-input)] border-[var(--border-default)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cyclisme">Cyclisme</SelectItem>
                  <SelectItem value="Course">Course</SelectItem>
                  <SelectItem value="Marche">Marche</SelectItem>
                  <SelectItem value="Natation">Natation</SelectItem>
                  <SelectItem value="Randonnée">Randonnée</SelectItem>
                  <SelectItem value="Rameur">Rameur</SelectItem>
                  <SelectItem value="Musculation">Musculation</SelectItem>
                  <SelectItem value="Yoga">Yoga</SelectItem>
                  <SelectItem value="Mobilité">Mobilité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={INPUT_CLASSES.label}>Date et heure</Label>
              <CustomDatePicker
                selected={formData.date}
                onChange={(date: Date | null) =>
                  date && setFormData({ ...formData, date })
                }
                className={INPUT_CLASSES.default}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label className={INPUT_CLASSES.label}>Durée</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className={INPUT_CLASSES.compact}
                  min="0"
                />
                <span className="text-[10px] text-[var(--text-disabled)] text-center block mt-0.5">h</span>
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  className={INPUT_CLASSES.compact}
                  min="0"
                  max="59"
                />
                <span className="text-[10px] text-[var(--text-disabled)] text-center block mt-0.5">min</span>
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={formData.seconds}
                  onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                  className={INPUT_CLASSES.compact}
                  min="0"
                  max="59"
                />
                <span className="text-[10px] text-[var(--text-disabled)] text-center block mt-0.5">sec</span>
              </div>
            </div>
          </div>

          {/* Distance */}
          {!isStaticActivity && (
            <div>
              <Label className={INPUT_CLASSES.label}>Distance (km)</Label>
              <input
                type="number"
                step="any"
                placeholder="Distance en km"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className={INPUT_CLASSES.default}
              />
            </div>
          )}

          {/* Heart Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={INPUT_CLASSES.label}>FC moyenne (bpm)</Label>
              <input
                type="number"
                step="any"
                placeholder="142"
                value={formData.avgHeartRate}
                onChange={(e) => setFormData({ ...formData, avgHeartRate: e.target.value })}
                className={INPUT_CLASSES.default}
              />
            </div>
            <div>
              <Label className={INPUT_CLASSES.label}>FC max (bpm)</Label>
              <input
                type="number"
                step="any"
                placeholder="185"
                value={formData.maxHeartRate}
                onChange={(e) => setFormData({ ...formData, maxHeartRate: e.target.value })}
                className={INPUT_CLASSES.default}
              />
            </div>
          </div>

          {/* Speed + Elevation */}
          {!isStaticActivity && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={INPUT_CLASSES.label}>Vit. moy. (km/h)</Label>
                  <input
                    type="number"
                    step="any"
                    placeholder="29.5"
                    value={formData.avgSpeed}
                    onChange={(e) => setFormData({ ...formData, avgSpeed: e.target.value })}
                    className={INPUT_CLASSES.default}
                  />
                </div>
                <div>
                  <Label className={INPUT_CLASSES.label}>Vit. max (km/h)</Label>
                  <input
                    type="number"
                    step="any"
                    placeholder="55.0"
                    value={formData.maxSpeed}
                    onChange={(e) => setFormData({ ...formData, maxSpeed: e.target.value })}
                    className={INPUT_CLASSES.default}
                  />
                </div>
              </div>
              <div>
                <Label className={INPUT_CLASSES.label}>Dénivelé positif (m)</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="450"
                  value={formData.elevationGain}
                  onChange={(e) => setFormData({ ...formData, elevationGain: e.target.value })}
                  className={INPUT_CLASSES.default}
                />
              </div>
            </>
          )}

          {/* Calories */}
          <div>
            <Label className={INPUT_CLASSES.label}>Calories</Label>
            <input
              type="number"
              step="any"
              placeholder="850"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              className={INPUT_CLASSES.default}
            />
          </div>

          {/* Cycling metrics */}
          {formData.type === "Cyclisme" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className={INPUT_CLASSES.label}>Cadence moy.</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="85"
                  value={formData.avgCadence}
                  onChange={(e) => setFormData({ ...formData, avgCadence: e.target.value })}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <Label className={INPUT_CLASSES.label}>Puiss. moy.</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="220"
                  value={formData.avgPower}
                  onChange={(e) => setFormData({ ...formData, avgPower: e.target.value })}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <Label className={INPUT_CLASSES.label}>Puiss. norm.</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="235"
                  value={formData.normalizedPower}
                  onChange={(e) => setFormData({ ...formData, normalizedPower: e.target.value })}
                  className={INPUT_CLASSES.default}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? "Mise à jour..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { EditFormData };
