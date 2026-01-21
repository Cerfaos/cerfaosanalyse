/**
 * Section exports CSV/GPX
 */

interface ExportOptionsProps {
  downloading: string | null
  onDownload: (endpoint: string, filename: string) => void
  getFileName: (type: string, extension: string) => string
}

export function ExportOptions({ downloading, onDownload, getFileName }: ExportOptionsProps) {
  const exports = [
    {
      endpoint: '/activities/csv',
      title: 'Activités (CSV)',
      description: 'Date, type, durée, distance, FC, vitesse, puissance, TRIMP',
      type: 'activities',
    },
    {
      endpoint: '/weight/csv',
      title: 'Historique de poids (CSV)',
      description: 'Date, poids, notes',
      type: 'weight',
    },
    {
      endpoint: '/equipment/csv',
      title: 'Équipement (CSV)',
      description: 'Nom, type, marque, modèle, kilométrage',
      type: 'equipment',
    },
  ]

  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-2 font-display flex items-center gap-2">
        <span className="text-2xl">&#128196;</span>
        Exports pour analyse
      </h2>
      <p className="text-sm text-text-body dark:text-dark-text-secondary mb-6">
        Exportez vos données au format CSV pour Excel/Google Sheets ou GPX pour les applications GPS.
      </p>

      <div className="space-y-3">
        {exports.map(({ endpoint, title, description, type }) => (
          <div
            key={endpoint}
            className="flex items-center justify-between p-4 border-2 border-panel-border rounded-xl hover:bg-bg-subtle transition-colors"
          >
            <div>
              <h4 className="font-medium text-text-dark dark:text-dark-text-contrast">{title}</h4>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => onDownload(endpoint, getFileName(type, 'csv'))}
              disabled={downloading === endpoint}
              className="btn-primary px-6"
            >
              {downloading === endpoint ? '...' : 'CSV'}
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between p-4 border-2 border-info/40 bg-info/10 rounded-xl">
          <div>
            <h4 className="font-medium text-info-dark dark:text-info">Activités (GPX)</h4>
            <p className="text-sm text-info-dark/80 dark:text-info/80">
              Export individuel sur chaque activité avec données GPS
            </p>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = '/activities')}
            className="px-6 py-2 rounded-xl border-2 border-info bg-info/20 text-info-dark dark:text-info hover:bg-info/30 transition-all font-medium"
          >
            Activités
          </button>
        </div>
      </div>
    </div>
  )
}
