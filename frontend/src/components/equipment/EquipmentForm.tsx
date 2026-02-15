/**
 * Formulaire d'équipement
 */

import type { EquipmentFormData } from "../../types/equipment";
import { EQUIPMENT_TYPES } from "../../types/equipment";

interface EquipmentFormProps {
  formData: EquipmentFormData;
  setFormData: (data: EquipmentFormData) => void;
  editingId: number | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function EquipmentForm({ formData, setFormData, editingId, onSubmit, onCancel }: EquipmentFormProps) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4">{editingId ? "Modifier l'équipement" : "Nouvel équipement"}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Nom *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
              required
            >
              {EQUIPMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Marque</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Modèle</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Kilométrage initial (km)</label>
            <input
              type="number"
              value={formData.initialDistance}
              onChange={(e) => setFormData({ ...formData, initialDistance: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Alerte de maintenance (km)</label>
            <input
              type="number"
              value={formData.alertDistance}
              onChange={(e) => setFormData({ ...formData, alertDistance: e.target.value })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
              min="0"
              placeholder="Ex: 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-1">Date d'achat</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-body mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-6">
            {editingId ? "Mettre à jour" : "Créer"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
