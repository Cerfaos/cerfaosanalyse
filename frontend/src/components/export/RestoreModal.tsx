/**
 * Modal de confirmation de restauration
 */

interface RestoreModalProps {
  backupFile: File
  cleanImport: boolean
  importing: boolean
  onCleanImportChange: (checked: boolean) => void
  onClose: () => void
  onRestore: () => void
}

export function RestoreModal({
  backupFile,
  cleanImport,
  importing,
  onCleanImportChange,
  onClose,
  onRestore,
}: RestoreModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>&#9888;&#65039;</span>
            Confirmer l'importation
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Fichier :</strong> {backupFile.name}
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">
                <strong>Taille :</strong> {(backupFile.size / 1024).toFixed(2)} Ko
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanImport}
                  onChange={(e) => onCleanImportChange(e.target.checked)}
                  className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Nettoyage complet avant import
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Supprime toutes vos données actuelles avant d'importer.
                  </p>
                </div>
              </label>
            </div>

            {cleanImport && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-900 dark:text-red-200 font-medium flex items-start gap-2">
                  <span className="text-xl">&#128680;</span>
                  <span>
                    <strong>DANGER :</strong> Toutes vos données actuelles seront supprimées !
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={importing}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onRestore}
                disabled={importing}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  cleanImport
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {importing ? 'Importation...' : cleanImport ? 'Nettoyer et importer' : 'Importer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
