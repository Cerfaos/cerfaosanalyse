import AppLayout from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import {
  ActivityFilters,
  ActivityEditModal,
  ActivityStatsCards,
  ActivityList,
  UploadForm,
  ManualActivityForm,
} from "../components/activities";
import { useActivities } from "../hooks/useActivities";

export default function Activities() {
  const {
    // State
    activities,
    stats,
    loading,
    uploading,
    uploadProgress,
    success,
    error,
    pagination,
    currentPage,
    filterType,
    period,
    searchTerm,
    activeTab,
    selectedFile,
    selectedGpxFile,
    manualGpxFile,
    manualFormData,
    deleteConfirm,
    editModal,
    formRef,

    // Setters
    setFilterType,
    setPeriod,
    setSearchTerm,
    setActiveTab,
    setCurrentPage,
    setSelectedFile,
    setSelectedGpxFile,
    setManualGpxFile,
    setManualFormData,
    setDeleteConfirm,
    setEditModal,

    // Actions
    handleUpload,
    handleManualSubmit,
    handleDeleteConfirm,
    handleEditClick,
    handleEditSubmit,
    handleExportCsv,
    handleDeleteClick,
    scrollToForm,
  } = useActivities();

  const actions = (
    <button onClick={scrollToForm} className="btn-primary font-display">
      Nouvelle importation
    </button>
  );

  return (
    <AppLayout
      title="Activités"
      description="Importez vos fichiers et suivez vos stats"
      actions={actions}
    >
      <div className="space-y-8">
        <PageHeader
          eyebrow="Activités"
          title="Suivi des sorties"
          description="Importez vos fichiers ou ajoutez vos entraînements manuellement."
          icon="activities"
          gradient="from-[#FFAB40] to-[#FF5252]"
          accentColor="#FFAB40"
        />

        {success && (
          <div className="glass-panel border-success/30 text-success px-4 py-3">{success}</div>
        )}

        {error && (
          <div className="glass-panel border-error/30 text-error px-4 py-3">{error}</div>
        )}

        {stats && <ActivityStatsCards stats={stats} period={period} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div ref={formRef} className="lg:col-span-1" id="import-form">
            <Card title="Nouvelle activité">
              {/* Tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 rounded-2xl px-4 py-3 text-lg font-semibold font-display border-4 transition-all ${
                    activeTab === "upload"
                      ? "bg-panel-bg text-text-primary border-panel-border shadow-xl"
                      : "text-text-secondary border-dashed border-panel-border hover:bg-panel-bg/30"
                  }`}
                >
                  Importer un fichier
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 rounded-2xl px-4 py-3 text-lg font-semibold font-display border-4 transition-all ${
                    activeTab === "manual"
                      ? "bg-panel-bg text-text-primary border-panel-border shadow-xl"
                      : "text-text-secondary border-dashed border-panel-border hover:bg-panel-bg/30"
                  }`}
                >
                  Créer manuellement
                </button>
              </div>

              {activeTab === "upload" ? (
                <UploadForm
                  selectedFile={selectedFile}
                  selectedGpxFile={selectedGpxFile}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  onFileChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  onGpxFileChange={setSelectedGpxFile}
                  onSubmit={handleUpload}
                />
              ) : (
                <ManualActivityForm
                  formData={manualFormData}
                  manualGpxFile={manualGpxFile}
                  uploading={uploading}
                  onFormChange={setManualFormData}
                  onGpxFileChange={setManualGpxFile}
                  onSubmit={handleManualSubmit}
                />
              )}
            </Card>
          </div>

          {/* Liste et filtres */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFilters
              period={period}
              setPeriod={setPeriod}
              filterType={filterType}
              setFilterType={setFilterType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            <ActivityList
              activities={activities}
              loading={loading}
              pagination={pagination}
              currentPage={currentPage}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onExportCsv={handleExportCsv}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'activité"
        message="Voulez-vous vraiment supprimer cette activité ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />

      <ActivityEditModal
        activity={editModal.activity}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, activity: null })}
        onSubmit={handleEditSubmit}
        isLoading={uploading}
      />
    </AppLayout>
  );
}
