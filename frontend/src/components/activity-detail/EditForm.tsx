/**
 * Formulaire d'édition d'activité
 */

import type { ActivityEditForm as EditFormType } from "../../types/activity";

interface EditFormProps {
  editForm: EditFormType;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormType>>;
  handleSubmitEdit: (e: React.FormEvent) => Promise<void>;
  cancelEditing: () => void;
  formatDuration: (s: number) => string;
}

export default function EditForm({
  editForm,
  setEditForm,
  handleSubmitEdit,
  cancelEditing,
  formatDuration,
}: EditFormProps) {
  return (
    <div className="mb-8 glass-panel p-6 rounded-lg shadow-lg border border-[var(--border-default)]">
      <h2 className="text-2xl font-bold mb-4 text-white">Modifier l'activité</h2>
      <form onSubmit={handleSubmitEdit} className="space-y-6">
        {/* Section Informations générales */}
        <GeneralInfoSection editForm={editForm} setEditForm={setEditForm} formatDuration={formatDuration} />

        {/* Section Cardio */}
        <CardioSection editForm={editForm} setEditForm={setEditForm} />

        {/* Section Vitesse */}
        <SpeedSection editForm={editForm} setEditForm={setEditForm} />

        {/* Section Puissance */}
        <PowerSection editForm={editForm} setEditForm={setEditForm} />

        {/* Section Autres données */}
        <OtherDataSection editForm={editForm} setEditForm={setEditForm} />

        {/* Section Météo */}
        <WeatherEditSection editForm={editForm} setEditForm={setEditForm} />

        {/* Section RPE et Sensations */}
        <FeelingSection editForm={editForm} setEditForm={setEditForm} />

        {/* Note d'information */}
        <div className="bg-[var(--status-info-subtle)] p-4 rounded-lg border border-[var(--status-info)]/30">
          <p className="text-sm text-[var(--status-info)]">
            <strong>Note :</strong> Si vous modifiez la fréquence cardiaque moyenne ou la durée, le
            TRIMP sera automatiquement recalculé par le système.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <button type="submit" className="btn-primary font-display">
            Enregistrer les modifications
          </button>
          <button type="button" onClick={cancelEditing} className="btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// Sous-composants du formulaire

interface SectionProps {
  editForm: EditFormType;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormType>>;
}

function GeneralInfoSection({ editForm, setEditForm, formatDuration }: SectionProps & { formatDuration: (s: number) => string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Informations générales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormSelect
          label="Type *"
          value={editForm.type}
          onChange={(value) => setEditForm({ ...editForm, type: value })}
          options={[
            "Course", "Cyclisme", "Marche", "Musculation", "Natation",
            "Rameur", "Randonnée", "Yoga", "Mobilité", "Autre"
          ]}
          required
        />
        <FormInput
          label="Date *"
          type="date"
          value={editForm.date}
          onChange={(value) => setEditForm({ ...editForm, date: value })}
          required
        />
        <FormInput
          label="Heure"
          type="time"
          value={editForm.time}
          onChange={(value) => setEditForm({ ...editForm, time: value })}
        />
        <div>
          <FormInput
            label="Distance (km) *"
            type="number"
            step="0.01"
            value={editForm.distanceKm}
            onChange={(value) => setEditForm({ ...editForm, distanceKm: value })}
            required
            min="0"
          />
          <p className="text-xs text-text-secondary mt-1">
            {Number(editForm.distanceKm).toFixed(2)} km = {(Number(editForm.distanceKm) * 1000).toFixed(0)} m
          </p>
        </div>
      </div>

      {/* Durée */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-text-body mb-2">Durée (HH:MM:SS) *</label>
        <div className="grid grid-cols-3 gap-2">
          <DurationInput
            value={editForm.durationHours}
            onChange={(value) => setEditForm({ ...editForm, durationHours: value })}
            label="Heures"
            max={99}
          />
          <DurationInput
            value={editForm.durationMinutes}
            onChange={(value) => setEditForm({ ...editForm, durationMinutes: value })}
            label="Minutes"
            max={59}
            required
          />
          <DurationInput
            value={editForm.durationSeconds}
            onChange={(value) => setEditForm({ ...editForm, durationSeconds: value })}
            label="Secondes"
            max={59}
            required
          />
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
  );
}

function CardioSection({ editForm, setEditForm }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Fréquence cardiaque</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="FC Moyenne (bpm)"
          type="number"
          value={editForm.avgHeartRate}
          onChange={(value) => setEditForm({ ...editForm, avgHeartRate: value })}
          min="0"
          max="250"
        />
        <FormInput
          label="FC Maximale (bpm)"
          type="number"
          value={editForm.maxHeartRate}
          onChange={(value) => setEditForm({ ...editForm, maxHeartRate: value })}
          min="0"
          max="250"
        />
      </div>
    </div>
  );
}

function SpeedSection({ editForm, setEditForm }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Vitesse</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Vitesse Moyenne (km/h)"
          type="number"
          step="0.1"
          value={editForm.avgSpeed}
          onChange={(value) => setEditForm({ ...editForm, avgSpeed: value })}
          min="0"
        />
        <FormInput
          label="Vitesse Maximale (km/h)"
          type="number"
          step="0.1"
          value={editForm.maxSpeed}
          onChange={(value) => setEditForm({ ...editForm, maxSpeed: value })}
          min="0"
        />
      </div>
    </div>
  );
}

function PowerSection({ editForm, setEditForm }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Puissance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Puissance Moyenne (W)"
          type="number"
          value={editForm.avgPower}
          onChange={(value) => setEditForm({ ...editForm, avgPower: value })}
          min="0"
        />
        <FormInput
          label="Puissance Normalisée (W)"
          type="number"
          value={editForm.normalizedPower}
          onChange={(value) => setEditForm({ ...editForm, normalizedPower: value })}
          min="0"
        />
      </div>
    </div>
  );
}

function OtherDataSection({ editForm, setEditForm }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Autres données</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="Cadence Moyenne (rpm)"
          type="number"
          value={editForm.avgCadence}
          onChange={(value) => setEditForm({ ...editForm, avgCadence: value })}
          min="0"
        />
        <FormInput
          label="Dénivelé (m)"
          type="number"
          value={editForm.elevationGain}
          onChange={(value) => setEditForm({ ...editForm, elevationGain: value })}
          min="0"
        />
        <FormInput
          label="Calories"
          type="number"
          value={editForm.calories}
          onChange={(value) => setEditForm({ ...editForm, calories: value })}
          min="0"
        />
      </div>
    </div>
  );
}

function WeatherEditSection({ editForm, setEditForm }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Météo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Conditions météo"
          value={editForm.weatherCondition}
          onChange={(value) => setEditForm({ ...editForm, weatherCondition: value })}
          options={[
            { value: "", label: "-- Aucune modification --" },
            { value: "ensoleille", label: "Ensoleillé" },
            { value: "partiellement-nuageux", label: "Partiellement nuageux" },
            { value: "nuageux", label: "Nuageux" },
            { value: "couvert", label: "Couvert" },
            { value: "pluie-legere", label: "Pluie légère" },
            { value: "pluie", label: "Pluie" },
            { value: "orage", label: "Orage" },
            { value: "neige", label: "Neige" },
            { value: "brouillard", label: "Brouillard" },
            { value: "vent", label: "Venteux" },
          ]}
        />
        <FormInput
          label="Température (°C)"
          type="number"
          value={editForm.weatherTemperature}
          onChange={(value) => setEditForm({ ...editForm, weatherTemperature: value })}
          placeholder="ex: 18"
          min="-50"
          max="60"
        />
        <FormInput
          label="Vitesse du vent (km/h)"
          type="number"
          value={editForm.weatherWindSpeed}
          onChange={(value) => setEditForm({ ...editForm, weatherWindSpeed: value })}
          placeholder="ex: 15"
          min="0"
          max="200"
        />
        <FormInput
          label="Direction du vent (°)"
          type="number"
          value={editForm.weatherWindDirection}
          onChange={(value) => setEditForm({ ...editForm, weatherWindDirection: value })}
          placeholder="ex: 180 (Nord=0, Est=90, Sud=180, Ouest=270)"
          min="0"
          max="359"
        />
      </div>
      <p className="text-xs text-text-secondary mt-2">
        La modification des conditions météo remplacera les données météo existantes pour cette sortie.
      </p>
    </div>
  );
}

function FeelingSection({ editForm, setEditForm }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Ressenti / Sensations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="RPE - Effort Perçu (1-10)"
          value={editForm.rpe}
          onChange={(value) => setEditForm({ ...editForm, rpe: value })}
          options={[
            { value: "", label: "-- Sélectionner --" },
            { value: "1", label: "1 - Très très facile" },
            { value: "2", label: "2 - Très facile" },
            { value: "3", label: "3 - Facile" },
            { value: "4", label: "4 - Modéré" },
            { value: "5", label: "5 - Assez dur" },
            { value: "6", label: "6 - Dur" },
            { value: "7", label: "7 - Très dur" },
            { value: "8", label: "8 - Très très dur" },
            { value: "9", label: "9 - Extrême" },
            { value: "10", label: "10 - Maximum" },
          ]}
          hint="Échelle de Borg modifiée : comment avez-vous perçu cet effort ?"
        />
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Notes sur les sensations
          </label>
          <textarea
            value={editForm.feelingNotes}
            onChange={(e) => setEditForm({ ...editForm, feelingNotes: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
            rows={3}
            placeholder="Ex: Jambes lourdes, bonne récupération, fatigue générale..."
            maxLength={500}
          />
        </div>
      </div>
    </div>
  );
}

// Composants de formulaire réutilisables

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

function FormInput({ label, type = "text", value, onChange, placeholder, required, min, max, step }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-body mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | { value: string; label: string }[];
  required?: boolean;
  hint?: string;
}

function FormSelect({ label, value, onChange, options, required, hint }: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-body mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)] [&>option]:bg-[var(--surface-raised)] [&>option]:text-white"
        required={required}
      >
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
      {hint && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
    </div>
  );
}

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  max: number;
  required?: boolean;
}

function DurationInput({ value, onChange, label, max, required }: DurationInputProps) {
  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-lg focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
        placeholder={label.substring(0, 2).toUpperCase()}
        min="0"
        max={max}
        required={required}
      />
      <p className="text-xs text-text-secondary text-center mt-1">{label}</p>
    </div>
  );
}
