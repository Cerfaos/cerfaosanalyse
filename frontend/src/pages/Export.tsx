/**
 * Page Export de données
 */

import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import { useExport } from '../hooks/useExport'
import {
  ServerBackupStatus,
  DataStatistics,
  PortableBackup,
  ExportOptions,
  RestoreModal,
} from '../components/export'

export default function Export() {
  const {
    stats,
    backupStatus,
    loading,
    downloading,
    importing,
    showRestoreModal,
    showBackupDetails,
    cleanImport,
    backupFile,
    fileInputRef,
    setShowBackupDetails,
    setCleanImport,
    handleDownload,
    getFileName,
    handleBackupDownload,
    handleFileSelect,
    handleRestore,
    closeRestoreModal,
  } = useExport()

  if (loading) {
    return (
      <AppLayout title="Export de données" description="Préparation des statistiques">
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Export de données" description="Sauvegardez vos données">
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          eyebrow="Données"
          title="Sauvegarde & Export"
          description="Gérez vos sauvegardes et exportez vos données pour les analyser."
          icon="export"
          gradient="from-[#5CE1E6] to-[#8BC34A]"
          accentColor="#5CE1E6"
        />

        {/* Statut des sauvegardes serveur */}
        {backupStatus && (
          <ServerBackupStatus
            backupStatus={backupStatus}
            showDetails={showBackupDetails}
            onToggleDetails={() => setShowBackupDetails(!showBackupDetails)}
          />
        )}

        {/* Statistiques des données */}
        {stats && <DataStatistics stats={stats} />}

        {/* Sauvegarde portable */}
        <PortableBackup
          downloading={downloading}
          importing={importing}
          fileInputRef={fileInputRef}
          onBackupDownload={handleBackupDownload}
          onFileSelect={handleFileSelect}
        />

        {/* Exports CSV/GPX */}
        <ExportOptions downloading={downloading} onDownload={handleDownload} getFileName={getFileName} />

        {/* Informations */}
        <InfoSection />

        {/* Modal de restauration */}
        {showRestoreModal && backupFile && (
          <RestoreModal
            backupFile={backupFile}
            cleanImport={cleanImport}
            importing={importing}
            onCleanImportChange={setCleanImport}
            onClose={closeRestoreModal}
            onRestore={handleRestore}
          />
        )}
      </div>
    </AppLayout>
  )
}

function InfoSection() {
  return (
    <div className="glass-panel p-6 border-2 border-info bg-info/10">
      <h3 className="font-semibold text-text-dark dark:text-dark-text-contrast mb-3 font-display">
        Types de sauvegardes
      </h3>
      <div className="space-y-3 text-sm text-text-body dark:text-dark-text-secondary">
        <p>
          <strong className="text-success">Sauvegardes serveur (automatiques) :</strong> Sauvegarde
          complète de la base de données SQLite et des fichiers uploadés. Gérées automatiquement par le
          serveur avec rotation (7 dernières conservées).
        </p>
        <p>
          <strong className="text-cta">Sauvegarde portable (JSON) :</strong> Export de vos données
          personnelles pour transfert vers un autre compte ou serveur. Peut être réimporté via
          l'interface.
        </p>
        <p>
          <strong className="text-brand">Exports CSV/GPX :</strong> Pour analyse dans Excel, Google
          Sheets, ou applications GPS tierces.
        </p>
      </div>
    </div>
  )
}
