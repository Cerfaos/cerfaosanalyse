/**
 * Types pour le module Équipement
 */

export interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  initialDistance: number;
  currentDistance: number;
  alertDistance: number | null;
  purchaseDate: string | null;
  retirementDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

export interface EquipmentFormData {
  name: string;
  type: string;
  brand: string;
  model: string;
  initialDistance: number;
  alertDistance: string;
  purchaseDate: string;
  notes: string;
}

export interface MaintenanceStatus {
  status: "urgent" | "soon" | "ok";
  label: string;
  color: string;
  percentage: number;
}

export const EQUIPMENT_TYPES = [
  "Vélo Route",
  "Vélo VTT",
  "Vélo Gravel",
  "Chaussures Route",
  "Chaussures Trail",
  "Cardio",
  "Capteur Puissance",
  "Autre",
];

export const DEFAULT_FORM_DATA: EquipmentFormData = {
  name: "",
  type: "Vélo Route",
  brand: "",
  model: "",
  initialDistance: 0,
  alertDistance: "",
  purchaseDate: "",
  notes: "",
};
