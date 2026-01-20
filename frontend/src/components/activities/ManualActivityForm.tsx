/**
 * Formulaire de création manuelle d'activité
 */

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
  const isStaticActivity = STATIC_ACTIVITIES.includes(formData.type);
  const isCardioActivity = CARDIO_ACTIVITIES.includes(formData.type);
  const showCaloriesOnly = ["Rameur", "Marche"].includes(formData.type);

  const updateField = (field: keyof ManualFormData, value: string | Date) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div className="col-span-2">
          <label htmlFor="manual-date" className={INPUT_CLASSES.label}>
            Date et heure *
          </label>
          <CustomDatePicker
            selected={formData.date}
            onChange={(date) => updateField("date", date || new Date())}
            className={INPUT_CLASSES.default}
          />
        </div>

        {/* Type */}
        <div className="col-span-2 space-y-2">
          <Label>Type d'activité *</Label>
          <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
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

        {/* YouTube pour activités statiques */}
        {STATIC_ACTIVITIES.includes(formData.type) && (
          <div className="col-span-2">
            <label htmlFor="manual-youtube" className={INPUT_CLASSES.label}>
              Lien vidéo YouTube
            </label>
            <input
              type="url"
              id="manual-youtube"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
              className={INPUT_CLASSES.default}
            />
          </div>
        )}

        {/* Durée */}
        <div className="col-span-2">
          <label className={INPUT_CLASSES.label}>Durée *</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="number"
                min="0"
                placeholder="HH"
                value={formData.hours}
                onChange={(e) => updateField("hours", e.target.value)}
                className={INPUT_CLASSES.compact}
              />
              <p className="text-xs text-text-muted text-center mt-1">Heures</p>
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="MM"
                value={formData.minutes}
                onChange={(e) => updateField("minutes", e.target.value)}
                className={INPUT_CLASSES.compact}
              />
              <p className="text-xs text-text-muted text-center mt-1">Minutes</p>
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="SS"
                value={formData.seconds}
                onChange={(e) => updateField("seconds", e.target.value)}
                className={INPUT_CLASSES.compact}
              />
              <p className="text-xs text-text-muted text-center mt-1">Secondes</p>
            </div>
          </div>
        </div>

        {/* Distance (sauf activités statiques) */}
        {!isStaticActivity && (
          <div className="col-span-2">
            <label htmlFor="manual-distance" className={INPUT_CLASSES.label}>
              Distance (km) *
            </label>
            <input
              type="number"
              id="manual-distance"
              step="0.01"
              min="0"
              placeholder="Ex: 42.5"
              value={formData.distance}
              onChange={(e) => updateField("distance", e.target.value)}
              required
              className={INPUT_CLASSES.default}
            />
          </div>
        )}

        {/* Champs avancés pour Cyclisme et Course */}
        {isCardioActivity && (
          <>
            <div>
              <label htmlFor="manual-avgHR" className={INPUT_CLASSES.label}>
                FC moyenne
              </label>
              <input
                type="number"
                id="manual-avgHR"
                min="0"
                placeholder="bpm"
                value={formData.avgHeartRate}
                onChange={(e) => updateField("avgHeartRate", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-maxHR" className={INPUT_CLASSES.label}>
                FC max
              </label>
              <input
                type="number"
                id="manual-maxHR"
                min="0"
                placeholder="bpm"
                value={formData.maxHeartRate}
                onChange={(e) => updateField("maxHeartRate", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-elevation" className={INPUT_CLASSES.label}>
                Dénivelé (m)
              </label>
              <input
                type="number"
                id="manual-elevation"
                min="0"
                placeholder="Ex: 450"
                value={formData.elevationGain}
                onChange={(e) => updateField("elevationGain", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-calories" className={INPUT_CLASSES.label}>
                Calories
              </label>
              <input
                type="number"
                id="manual-calories"
                min="0"
                placeholder="kcal"
                value={formData.calories}
                onChange={(e) => updateField("calories", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-avgSpeed" className={INPUT_CLASSES.label}>
                Vitesse moyenne (km/h)
              </label>
              <input
                type="number"
                id="manual-avgSpeed"
                step="0.1"
                min="0"
                placeholder="km/h"
                value={formData.avgSpeed}
                onChange={(e) => updateField("avgSpeed", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-maxSpeed" className={INPUT_CLASSES.label}>
                Vitesse max (km/h)
              </label>
              <input
                type="number"
                id="manual-maxSpeed"
                step="0.1"
                min="0"
                placeholder="km/h"
                value={formData.maxSpeed}
                onChange={(e) => updateField("maxSpeed", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-avgCadence" className={INPUT_CLASSES.label}>
                Cadence moyenne (rpm/spm)
              </label>
              <input
                type="number"
                id="manual-avgCadence"
                min="0"
                placeholder="rpm/spm"
                value={formData.avgCadence}
                onChange={(e) => updateField("avgCadence", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-avgPower" className={INPUT_CLASSES.label}>
                Puissance moyenne (W)
              </label>
              <input
                type="number"
                id="manual-avgPower"
                min="0"
                placeholder="watts"
                value={formData.avgPower}
                onChange={(e) => updateField("avgPower", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>

            <div>
              <label htmlFor="manual-normalizedPower" className={INPUT_CLASSES.label}>
                Puissance normalisée (W)
              </label>
              <input
                type="number"
                id="manual-normalizedPower"
                min="0"
                placeholder="watts"
                value={formData.normalizedPower}
                onChange={(e) => updateField("normalizedPower", e.target.value)}
                className={INPUT_CLASSES.default}
              />
            </div>
          </>
        )}

        {/* Calories uniquement pour Rameur et Marche */}
        {showCaloriesOnly && (
          <div>
            <label htmlFor="manual-calories" className={INPUT_CLASSES.label}>
              Calories
            </label>
            <input
              type="number"
              id="manual-calories"
              min="0"
              placeholder="kcal"
              value={formData.calories}
              onChange={(e) => updateField("calories", e.target.value)}
              className={INPUT_CLASSES.default}
            />
          </div>
        )}

        {/* Fichier GPX */}
        <div className="col-span-2">
          <label htmlFor="manual-gpx-file" className={INPUT_CLASSES.label}>
            Fichier GPX (optionnel)
          </label>
          <input
            type="file"
            id="manual-gpx-file"
            accept=".gpx"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onGpxFileChange(e.target.files[0]);
              }
            }}
            className={INPUT_CLASSES.default}
          />
          <p className="text-sm text-text-muted mt-2">
            📍 Si vous fournissez un fichier GPX, la distance, la durée et le dénivelé seront
            extraits automatiquement du fichier et remplaceront les valeurs saisies manuellement.
            Le fichier permet aussi d'obtenir la météo exacte de votre localisation.
          </p>
          {manualGpxFile && (
            <div className="glass-panel border border-success/40 bg-success-light/60 p-3 rounded-xl mt-2">
              <p className="text-sm text-success">
                ✓ Fichier sélectionné: <strong>{manualGpxFile.name}</strong>
              </p>
              <p className="text-xs text-text-muted mt-1">
                Les données GPS (distance, durée, dénivelé) du fichier seront utilisées en priorité
              </p>
            </div>
          )}
        </div>

        {/* RPE */}
        <div className="col-span-2">
          <label htmlFor="manual-rpe" className={INPUT_CLASSES.label}>
            RPE (Effort perçu 1-10)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="manual-rpe"
              min="1"
              max="10"
              step="1"
              value={formData.rpe || "5"}
              onChange={(e) => updateField("rpe", e.target.value)}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8BC34A]"
            />
            <span className="text-xl font-bold text-[#8BC34A] w-8 text-center">
              {formData.rpe || "5"}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Facile</span>
            <span>Modéré</span>
            <span>Difficile</span>
            <span>Maximal</span>
          </div>
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label htmlFor="manual-notes" className={INPUT_CLASSES.label}>
            Notes de séance
          </label>
          <textarea
            id="manual-notes"
            rows={3}
            placeholder="Détails de la séance (ex: Squat 5x5@100kg...)"
            value={formData.feelingNotes}
            onChange={(e) => updateField("feelingNotes", e.target.value)}
            className={INPUT_CLASSES.default}
          />
        </div>
      </div>

      <button type="submit" disabled={uploading} className={INPUT_CLASSES.primaryButton}>
        {uploading ? "Création en cours..." : "Créer l'activité"}
      </button>

      <div className="glass-panel p-4 border border-info bg-info-light/60">
        <p className="text-sm text-info-dark">
          <strong>💡 Astuce :</strong> Le TRIMP sera calculé automatiquement si vous renseignez
          la FC moyenne et que votre profil est configuré.
        </p>
      </div>
    </form>
  );
}
