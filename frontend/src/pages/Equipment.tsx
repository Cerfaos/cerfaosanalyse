/**
 * Page Équipement
 */

import { useRef } from "react";
import AppLayout from "../components/layout/AppLayout";
import { PageHeader } from "../components/ui/PageHeader";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EquipmentForm, EquipmentCard } from "../components/equipment";
import { useEquipment } from "../hooks/useEquipment";

export default function Equipment() {
  const formRef = useRef<HTMLDivElement>(null);

  const {
    equipment,
    loading,
    showForm,
    editingId,
    formData,
    setFormData,
    deleteConfirm,
    handleSubmit,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    toggleActive,
    openNewForm,
    closeForm,
  } = useEquipment();

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenNewForm = () => {
    openNewForm();
    setTimeout(scrollToForm, 200);
  };

  const actions = (
    <button onClick={handleOpenNewForm} className="btn-primary font-display">
      Ajouter un équipement
    </button>
  );

  if (loading) {
    return (
      <AppLayout title="Équipement" description="Gestion de votre matériel" actions={actions}>
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Équipement" description="Suivez l'usure et planifiez vos remplacements" actions={actions}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Matériel"
          title="Mon Équipement"
          description="Suivez l'usure de votre matériel et planifiez vos remplacements."
          icon="equipment"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
          accentColor="#8BC34A"
        />

        {/* Formulaire */}
        {showForm && (
          <div ref={formRef}>
            <EquipmentForm
              formData={formData}
              setFormData={setFormData}
              editingId={editingId}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        )}

        {/* Liste des équipements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onToggleActive={toggleActive}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        {equipment.length === 0 && !showForm && (
          <div className="glass-panel p-12 text-center">
            <p className="text-text-secondary text-lg mb-4">Aucun équipement enregistré</p>
            <button onClick={openNewForm} className="btn-primary px-8">
              Ajouter votre premier équipement
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'équipement"
        message="Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </AppLayout>
  );
}
