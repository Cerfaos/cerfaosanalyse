/**
 * Formulaire d'upload de fichier d'activité
 */

import { INPUT_CLASSES } from "./activitiesConfig";

interface UploadFormProps {
  selectedFile: File | null;
  selectedGpxFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGpxFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function UploadForm({
  selectedFile,
  selectedGpxFile,
  uploading,
  uploadProgress,
  onFileChange,
  onGpxFileChange,
  onSubmit,
}: UploadFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="file-upload" className={INPUT_CLASSES.label}>
          Fichier FIT/CSV *
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".fit,.csv"
          onChange={onFileChange}
          required
          className="w-full px-4 py-3 border border-border-base rounded-xl bg-bg-white/90 focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
        />
        <p className="text-sm text-text-muted mt-2">
          📊 Fichier contenant les métriques (durée, FC, puissance...)
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
        <label htmlFor="gpx-upload" className={INPUT_CLASSES.label}>
          Fichier GPX (optionnel)
        </label>
        <input
          type="file"
          id="gpx-upload"
          accept=".gpx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onGpxFileChange(e.target.files[0]);
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
        className={INPUT_CLASSES.primaryButton}
      >
        {uploading ? "Import en cours..." : "Importer"}
      </button>

      {uploading && (
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div
              className="bg-brand h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-text-muted mt-1">{uploadProgress}%</p>
        </div>
      )}

      <div className="glass-panel p-4 border border-info bg-info-light/60">
        <p className="text-sm text-info-dark">
          <strong>💡 Import en 2 étapes :</strong>
        </p>
        <ul className="text-sm text-info-dark mt-2 space-y-1 list-disc list-inside">
          <li>Le fichier FIT/CSV fournit les métriques (durée, FC, puissance, etc.)</li>
          <li>Le fichier GPX (optionnel) fournit la trace GPS complète</li>
          <li>Le TRIMP est calculé automatiquement si FC disponible</li>
        </ul>
      </div>
    </form>
  );
}
