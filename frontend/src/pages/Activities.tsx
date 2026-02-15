import AppLayout from "../components/layout/AppLayout";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
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
    activities, stats, loading, uploading, uploadProgress, success, error,
    pagination, currentPage, filterType, period, searchTerm, activeTab,
    selectedFile, selectedGpxFile, manualGpxFile, manualFormData,
    deleteConfirm, editModal, formRef,
    setFilterType, setPeriod, setSearchTerm, setActiveTab, setCurrentPage,
    setSelectedFile, setSelectedGpxFile, setManualGpxFile, setManualFormData,
    setDeleteConfirm, setEditModal,
    handleUpload, handleManualSubmit, handleDeleteConfirm, handleEditClick,
    handleEditSubmit, handleExportCsv, handleDeleteClick, scrollToForm,
  } = useActivities();

  const actions = (
    <button
      onClick={scrollToForm}
      className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, #f8712f 0%, #ea580c 100%)",
        boxShadow: "0 4px 24px rgba(248,113,47,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Importer
    </button>
  );

  return (
    <AppLayout
      title="Activités"
      description="Importez vos fichiers et suivez vos performances"
      actions={actions}
    >
      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-sm font-semibold text-emerald-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <p className="text-sm font-semibold text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      {stats && <ActivityStatsCards stats={stats} period={period} />}

      {/* Main grid: sidebar form + feed */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* Sidebar - Formulaire toujours visible */}
        <aside ref={formRef} className="lg:col-span-4 xl:col-span-3" id="import-form">
          <div className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#1e293b] bg-[#0f1520] overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#1e293b]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#475569]">
                  Nouvelle activité
                </span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#1e293b]">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all duration-200 border-b-2 ${
                    activeTab === "upload"
                      ? "border-[var(--accent-primary)] text-white"
                      : "border-transparent text-[#475569] hover:text-[#94a3b8]"
                  }`}
                >
                  <svg className={`w-4 h-4 ${activeTab === "upload" ? "text-[var(--accent-primary)]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Fichier
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all duration-200 border-b-2 ${
                    activeTab === "manual"
                      ? "border-[var(--accent-primary)] text-white"
                      : "border-transparent text-[#475569] hover:text-[#94a3b8]"
                  }`}
                >
                  <svg className={`w-4 h-4 ${activeTab === "manual" ? "text-[var(--accent-primary)]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Manuel
                </button>
              </div>

              {/* Form content */}
              <div className="p-5">
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
              </div>
            </div>
          </div>
        </aside>

        {/* Feed */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-6">
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
        </section>
      </div>

      {/* Modals */}
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
