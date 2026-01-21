/**
 * Modal de remplacement de fichier d'activité
 */

interface FileReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  replacementFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  uploading: boolean;
}

export default function FileReplacementModal({
  isOpen,
  onClose,
  replacementFile,
  onFileChange,
  onSubmit,
  uploading,
}: FileReplacementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-panel p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-white mb-4">Remplacer le fichier</h2>
        <p className="text-sm text-gray-300 mb-4">
          Le remplacement du fichier mettra à jour toutes les données de l'activité (durée,
          distance, GPS, etc.) avec les nouvelles données du fichier.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="replacement-file" className="block text-sm font-medium text-gray-300 mb-2">
              Nouveau fichier
            </label>
            <input
              type="file"
              id="replacement-file"
              accept=".fit,.gpx,.csv"
              onChange={onFileChange}
              required
              className="w-full px-4 py-3 border border-[var(--border-default)] bg-[var(--surface-input)] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--accent-primary)]"
            />
            <p className="text-sm text-gray-400 mt-2">Formats acceptés: FIT, GPX, CSV</p>
          </div>

          {replacementFile && (
            <div className="bg-[var(--accent-secondary-subtle)] border border-[var(--accent-secondary)]/30 p-3 rounded-md">
              <p className="text-sm text-[var(--accent-secondary)]">
                Fichier sélectionné: <strong>{replacementFile.name}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Taille: {(replacementFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || !replacementFile}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Remplacement..." : "Remplacer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
