/**
 * Section sauvegarde portable (JSON)
 */

interface PortableBackupProps {
  downloading: string | null
  importing: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onBackupDownload: () => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PortableBackup({
  downloading,
  importing,
  fileInputRef,
  onBackupDownload,
  onFileSelect,
}: PortableBackupProps) {
  return (
    <div className="glass-panel p-6 border-2 border-cta">
      <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text-contrast mb-2 font-display flex items-center gap-2">
        <span className="text-3xl">&#128190;</span>
        Sauvegarde portable
      </h2>
      <p className="text-text-body dark:text-dark-text-secondary mb-6">
        Téléchargez vos données au format JSON pour les transférer vers un autre compte ou serveur.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-bg-subtle dark:bg-dark-bg/50 p-6 rounded-xl border-2 border-panel-border">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">&#11015;&#65039;</span>
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                Exporter mes données
              </h3>
              <p className="text-sm text-text-body dark:text-dark-text-secondary mb-4">
                Fichier JSON contenant toutes vos données personnelles.
              </p>
            </div>
          </div>

          <ul className="text-sm text-text-body dark:text-dark-text-secondary space-y-1 mb-4 ml-12">
            <li>&#10003; Activités avec GPS et météo</li>
            <li>&#10003; Historique de poids</li>
            <li>&#10003; Équipements et kilométrage</li>
            <li>&#10003; Paramètres du profil</li>
          </ul>

          <button
            onClick={onBackupDownload}
            disabled={downloading === '/backup'}
            className="w-full btn-primary font-display text-lg"
          >
            {downloading === '/backup' ? 'Création...' : 'Télécharger (JSON)'}
          </button>
        </div>

        {/* Import */}
        <div className="bg-bg-subtle dark:bg-dark-bg/50 p-6 rounded-xl border-2 border-panel-border">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">&#11014;&#65039;</span>
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2">
                Importer une sauvegarde
              </h3>
              <p className="text-sm text-text-body dark:text-dark-text-secondary mb-4">
                Restaurez vos données depuis un fichier JSON.
              </p>
            </div>
          </div>

          <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-3 mb-4 ml-12">
            <p className="text-sm text-warning-dark dark:text-warning font-medium">
              Les données importées seront ajoutées aux données existantes.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={onFileSelect}
            className="hidden"
            aria-label="Sélectionner un fichier de sauvegarde JSON"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full px-6 py-3 rounded-xl border-2 border-cta bg-cta/20 text-cta-dark dark:text-cta hover:bg-cta/30 transition-all font-medium font-display text-lg"
          >
            {importing ? 'Importation...' : 'Sélectionner un fichier'}
          </button>
        </div>
      </div>
    </div>
  )
}
