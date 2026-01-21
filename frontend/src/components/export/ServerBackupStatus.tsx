/**
 * Section statut des sauvegardes serveur
 */

import type { BackupStatus } from '../../types/export'
import { formatDate, getTimeSinceLastBackup } from '../../hooks/useExport'

interface ServerBackupStatusProps {
  backupStatus: BackupStatus
  showDetails: boolean
  onToggleDetails: () => void
}

export function ServerBackupStatus({ backupStatus, showDetails, onToggleDetails }: ServerBackupStatusProps) {
  return (
    <div className="glass-panel p-6 border-2 border-success/50 bg-success/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-2xl">
            <span className="text-success">&#x2713;</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-dark dark:text-dark-text-contrast font-display">
              Sauvegardes automatiques
            </h2>
            <p className="text-sm text-text-body dark:text-dark-text-secondary">
              {backupStatus.backupSchedule} | {backupStatus.summary.totalFull} sauvegarde
              {backupStatus.summary.totalFull > 1 ? 's' : ''} disponible
              {backupStatus.summary.totalFull > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-body dark:text-dark-text-secondary">Dernière sauvegarde</div>
          <div className="font-medium text-success">
            {getTimeSinceLastBackup(backupStatus.summary.lastBackupDate)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatBox value={backupStatus.summary.totalFull} label="Sauvegardes complètes" color="text-cta" />
        <StatBox value={backupStatus.summary.totalDb} label="Bases de données" color="text-brand" />
        <StatBox value={backupStatus.summary.totalUploads} label="Archives uploads" color="text-accent" />
        <StatBox value={backupStatus.summary.totalSize} label="Espace utilisé" color="text-text-dark dark:text-dark-text-contrast" />
      </div>

      <button
        type="button"
        onClick={onToggleDetails}
        className="text-sm text-cta hover:underline flex items-center gap-1"
      >
        {showDetails ? 'Masquer les détails' : 'Voir les détails'}
        <span className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}>&#x25BC;</span>
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4">
          {backupStatus.backups.full.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-dark dark:text-dark-text-contrast mb-2">
                Sauvegardes complètes
              </h4>
              <div className="space-y-1">
                {backupStatus.backups.full.slice(0, 5).map((backup) => (
                  <div
                    key={backup.name}
                    className="flex items-center justify-between text-sm bg-bg-subtle dark:bg-dark-bg/30 px-3 py-2 rounded"
                  >
                    <span className="font-mono text-xs">{backup.name}</span>
                    <span className="text-text-body">
                      {formatDate(backup.date)} ({backup.size})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-info/10 border border-info/30 rounded-lg p-3">
            <p className="text-sm text-info-dark dark:text-info">
              <strong>Info :</strong> Les sauvegardes serveur sont stockées sur le serveur et incluent la
              base de données SQLite complète et tous les fichiers uploadés. Utilisez{' '}
              <code className="bg-info/20 px-1 rounded">./scripts/restore-db.sh</code> pour restaurer
              depuis le serveur.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="bg-bg-subtle dark:bg-dark-bg/30 p-3 rounded-lg text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-text-body">{label}</div>
    </div>
  )
}
