import { useRef } from "react";
import CustomDatePicker from "../ui/DatePicker";
import { Label } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ManualFormData } from "../../types/activities";
import {
  INPUT_CLASSES,
  ACTIVITY_TYPES,
  STATIC_ACTIVITIES,
  CARDIO_ACTIVITIES,
} from "./activitiesConfig";

interface ManualActivityFormProps {
  formData: ManualFormData;
  manualGpxFile: File | null;
  uploading: boolean;
  onFormChange: (data: ManualFormData) => void;
  onGpxFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ManualActivityForm({
  formData,
  manualGpxFile,
  uploading,
  onFormChange,
  onGpxFileChange,
  onSubmit,
}: ManualActivityFormProps) {
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const isStaticActivity = STATIC_ACTIVITIES.includes(formData.type);
  const isCardioActivity = CARDIO_ACTIVITIES.includes(formData.type);
  const showCaloriesOnly = ["Rameur", "Marche"].includes(formData.type);

  const updateField = (field: keyof ManualFormData, value: string | Date) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Date + Type */}
      <div>
        <label className={INPUT_CLASSES.label}>Date et heure</label>
        <CustomDatePicker
          selected={formData.date}
          onChange={(date) => updateField("date", date || new Date())}
          className={INPUT_CLASSES.default}
        />
      </div>

      <div className="space-y-1.5">
        <Label className={INPUT_CLASSES.label}>Type d'activité</Label>
        <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
          <SelectTrigger className="h-9 text-sm bg-[var(--surface-input)] border-[var(--border-default)]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* YouTube for static activities */}
      {STATIC_ACTIVITIES.includes(formData.type) && (
        <div>
          <label className={INPUT_CLASSES.label}>Lien YouTube</label>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={formData.youtubeUrl}
            onChange={(e) => updateField("youtubeUrl", e.target.value)}
            className={INPUT_CLASSES.default}
          />
        </div>
      )}

      {/* Duration */}
      <div>
        <label className={INPUT_CLASSES.label}>Durée</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.hours}
              onChange={(e) => updateField("hours", e.target.value)}
              className={INPUT_CLASSES.compact}
            />
            <p className="text-[10px] text-[var(--text-disabled)] text-center mt-0.5">h</p>
          </div>
          <div>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={formData.minutes}
              onChange={(e) => updateField("minutes", e.target.value)}
              className={INPUT_CLASSES.compact}
            />
            <p className="text-[10px] text-[var(--text-disabled)] text-center mt-0.5">min</p>
          </div>
          <div>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={formData.seconds}
              onChange={(e) => updateField("seconds", e.target.value)}
              className={INPUT_CLASSES.compact}
            />
            <p className="text-[10px] text-[var(--text-disabled)] text-center mt-0.5">sec</p>
          </div>
        </div>
      </div>

      {/* Distance (non-static) */}
      {!isStaticActivity && (
        <div>
          <label className={INPUT_CLASSES.label}>Distance (km)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="42.5"
            value={formData.distance}
            onChange={(e) => updateField("distance", e.target.value)}
            required
            className={INPUT_CLASSES.default}
          />
        </div>
      )}

      {/* Cardio fields */}
      {isCardioActivity && (
        <>
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] mb-3">
              Métriques avancées
            </p>

            <div className="grid grid-cols-2 gap-3 space-y-0">
              <div>
                <label className={INPUT_CLASSES.label}>FC moy (bpm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="142"
                  value={formData.avgHeartRate}
                  onChange={(e) => updateField("avgHeartRate", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>FC max (bpm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="185"
                  value={formData.maxHeartRate}
                  onChange={(e) => updateField("maxHeartRate", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>Vit. moy (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="29.5"
                  value={formData.avgSpeed}
                  onChange={(e) => updateField("avgSpeed", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>Vit. max (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="55.0"
                  value={formData.maxSpeed}
                  onChange={(e) => updateField("maxSpeed", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>Dénivelé (m)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="450"
                  value={formData.elevationGain}
                  onChange={(e) => updateField("elevationGain", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>Calories</label>
                <input
                  type="number"
                  min="0"
                  placeholder="850"
                  value={formData.calories}
                  onChange={(e) => updateField("calories", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>Cadence (rpm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="85"
                  value={formData.avgCadence}
                  onChange={(e) => updateField("avgCadence", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div>
                <label className={INPUT_CLASSES.label}>Puiss. moy (W)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="220"
                  value={formData.avgPower}
                  onChange={(e) => updateField("avgPower", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
              <div className="col-span-2">
                <label className={INPUT_CLASSES.label}>Puiss. normalisée (W)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="235"
                  value={formData.normalizedPower}
                  onChange={(e) => updateField("normalizedPower", e.target.value)}
                  className={INPUT_CLASSES.default}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Calories only for Rameur/Marche */}
      {showCaloriesOnly && (
        <div>
          <label className={INPUT_CLASSES.label}>Calories</label>
          <input
            type="number"
            min="0"
            placeholder="350"
            value={formData.calories}
            onChange={(e) => updateField("calories", e.target.value)}
            className={INPUT_CLASSES.default}
          />
        </div>
      )}

      {/* GPX File */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className={INPUT_CLASSES.label + " mb-0"}>Trace GPS (optionnel)</p>
          {manualGpxFile && (
            <button
              type="button"
              onClick={() => {
                onGpxFileChange(null);
                if (gpxInputRef.current) gpxInputRef.current.value = "";
              }}
              className="text-[10px] text-[var(--status-error)] hover:underline"
            >
              Retirer
            </button>
          )}
        </div>

        {manualGpxFile ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-success-subtle)] border border-[var(--status-success)]/20">
            <svg className="w-3.5 h-3.5 text-[var(--status-success)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-[var(--text-primary)] truncate">{manualGpxFile.name}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => gpxInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-default)] border-dashed text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">Ajouter un fichier GPX</span>
          </button>
        )}

        <input
          ref={gpxInputRef}
          type="file"
          accept=".gpx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onGpxFileChange(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {manualGpxFile && (
          <p className="text-[10px] text-[var(--text-disabled)] mt-1.5 leading-relaxed">
            Distance, durée et dénivelé seront extraits du GPX automatiquement.
          </p>
        )}
      </div>

      {/* RPE */}
      <div className="pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <label className={INPUT_CLASSES.label + " mb-0"}>Effort perçu (RPE)</label>
          <span
            className="text-lg font-bold font-mono"
            style={{ color: "var(--accent-primary)" }}
          >
            {formData.rpe || "5"}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={formData.rpe || "5"}
          onChange={(e) => updateField("rpe", e.target.value)}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--surface-input)] accent-[var(--accent-primary)]"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-disabled)] mt-1">
          <span>Facile</span>
          <span>Modéré</span>
          <span>Difficile</span>
          <span>Max</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={INPUT_CLASSES.label}>Notes</label>
        <textarea
          rows={2}
          placeholder="Détails de la séance..."
          value={formData.feelingNotes}
          onChange={(e) => updateField("feelingNotes", e.target.value)}
          className={INPUT_CLASSES.default + " resize-none"}
        />
      </div>

      {/* Submit */}
      <button type="submit" disabled={uploading} className="btn-primary w-full">
        {uploading ? "Création..." : "Créer l'activité"}
      </button>
    </form>
  );
}
