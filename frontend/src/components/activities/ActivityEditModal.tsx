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

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/60 text-white placeholder-gray-500 focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 outline-none transition";
const compactInputClass =
  "w-full px-3 py-2 rounded-xl border border-[#8BC34A]/30 bg-[#0A191A]/60 text-white placeholder-gray-500 focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 outline-none text-center transition";
const labelClass = "block text-sm font-medium text-gray-300 mb-2";

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
      <div className="relative bg-[#0D1F22] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-[#0D1F22] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white">
            Modifier l'activité
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Fermer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type et Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={labelClass}>Type d'activité</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="w-full bg-[#0A191A]/60 border-[#8BC34A]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cyclisme">Cyclisme</SelectItem>
                  <SelectItem value="Course à pied">Course à pied</SelectItem>
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
              <Label className={labelClass}>Date et heure</Label>
              <CustomDatePicker
                selected={formData.date}
                onChange={(date: Date | null) =>
                  date && setFormData({ ...formData, date })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Durée */}
          <div>
            <Label className={labelClass}>Durée</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Heures"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className={compactInputClass}
                  min="0"
                />
                <span className="text-xs text-gray-500 text-center block mt-1">heures</span>
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Minutes"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  className={compactInputClass}
                  min="0"
                  max="59"
                />
                <span className="text-xs text-gray-500 text-center block mt-1">minutes</span>
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Secondes"
                  value={formData.seconds}
                  onChange={(e) => setFormData({ ...formData, seconds: e.target.value })}
                  className={compactInputClass}
                  min="0"
                  max="59"
                />
                <span className="text-xs text-gray-500 text-center block mt-1">secondes</span>
              </div>
            </div>
          </div>

          {/* Distance (si pas activité statique) */}
          {!isStaticActivity && (
            <div>
              <Label className={labelClass}>Distance (km)</Label>
              <input
                type="number"
                step="any"
                placeholder="Distance en km"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className={inputClass}
              />
            </div>
          )}

          {/* Fréquence cardiaque */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={labelClass}>FC moyenne (bpm)</Label>
              <input
                type="number"
                step="any"
                placeholder="FC moyenne"
                value={formData.avgHeartRate}
                onChange={(e) => setFormData({ ...formData, avgHeartRate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <Label className={labelClass}>FC max (bpm)</Label>
              <input
                type="number"
                step="any"
                placeholder="FC max"
                value={formData.maxHeartRate}
                onChange={(e) => setFormData({ ...formData, maxHeartRate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Vitesse et dénivelé (si pas activité statique) */}
          {!isStaticActivity && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={labelClass}>Vitesse moy. (km/h)</Label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Vitesse moyenne"
                    value={formData.avgSpeed}
                    onChange={(e) => setFormData({ ...formData, avgSpeed: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Vitesse max (km/h)</Label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Vitesse max"
                    value={formData.maxSpeed}
                    onChange={(e) => setFormData({ ...formData, maxSpeed: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Dénivelé positif (m)</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="Dénivelé en mètres"
                  value={formData.elevationGain}
                  onChange={(e) => setFormData({ ...formData, elevationGain: e.target.value })}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* Calories */}
          <div>
            <Label className={labelClass}>Calories</Label>
            <input
              type="number"
              step="any"
              placeholder="Calories brûlées"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Cadence et puissance (cyclisme) */}
          {formData.type === "Cyclisme" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className={labelClass}>Cadence moy.</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="rpm"
                  value={formData.avgCadence}
                  onChange={(e) => setFormData({ ...formData, avgCadence: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <Label className={labelClass}>Puissance moy.</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="watts"
                  value={formData.avgPower}
                  onChange={(e) => setFormData({ ...formData, avgPower: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <Label className={labelClass}>Puissance norm.</Label>
                <input
                  type="number"
                  step="any"
                  placeholder="NP"
                  value={formData.normalizedPower}
                  onChange={(e) => setFormData({ ...formData, normalizedPower: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary font-display disabled:opacity-50"
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
