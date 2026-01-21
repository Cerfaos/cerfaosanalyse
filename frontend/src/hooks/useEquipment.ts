/**
 * Hook pour la gestion des équipements
 */

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import type { Equipment, EquipmentFormData } from "../types/equipment";
import { DEFAULT_FORM_DATA } from "../types/equipment";

interface DeleteConfirmState {
  isOpen: boolean;
  id: number | null;
}

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EquipmentFormData>(DEFAULT_FORM_DATA);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    id: null,
  });

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/equipment");
      setEquipment(response.data.data);
    } catch {
      // Silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      initialDistance: Number(formData.initialDistance) * 1000,
      alertDistance: formData.alertDistance ? Number(formData.alertDistance) * 1000 : null,
    };

    try {
      if (editingId) {
        await api.patch(`/api/equipment/${editingId}`, data);
      } else {
        await api.post("/api/equipment", data);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchEquipment();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (item: Equipment) => {
    setFormData({
      name: item.name,
      type: item.type,
      brand: item.brand || "",
      model: item.model || "",
      initialDistance: item.initialDistance / 1000,
      alertDistance: item.alertDistance ? String(item.alertDistance / 1000) : "",
      purchaseDate: item.purchaseDate || "",
      notes: item.notes || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.delete(`/api/equipment/${deleteConfirm.id}`);
      fetchEquipment();
      toast.success("Equipement supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const toggleActive = async (item: Equipment) => {
    try {
      await api.patch(`/api/equipment/${item.id}`, {
        isActive: !item.isActive,
        retirementDate: !item.isActive ? null : new Date().toISOString().split("T")[0],
      });
      fetchEquipment();
    } catch {
      // Erreur gérée par toast
    }
  };

  const openNewForm = () => {
    setShowForm(true);
    setEditingId(null);
    resetForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  return {
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
  };
}
