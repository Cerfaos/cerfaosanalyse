/**
 * Carte d'équipement
 */

import type { Equipment } from "../../types/equipment";
import { formatDistance, getTypeIcon, getMaintenanceStatus } from "../../utils/equipmentUtils";

interface EquipmentCardProps {
  item: Equipment;
  onEdit: (item: Equipment) => void;
  onToggleActive: (item: Equipment) => void;
  onDelete: (id: number) => void;
}

export function EquipmentCard({ item, onEdit, onToggleActive, onDelete }: EquipmentCardProps) {
  const maintenanceStatus = getMaintenanceStatus(item);

  return (
    <div
      className={`glass-panel p-6 ${!item.isActive ? "opacity-60" : ""} ${
        maintenanceStatus?.status === "urgent" ? "ring-2 ring-danger" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{getTypeIcon(item.type)}</span>
          <div>
            <h3 className="font-semibold text-lg text-text-dark dark:text-dark-text-contrast">{item.name}</h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{item.type}</p>
          </div>
        </div>
        {!item.isActive && (
          <span className="text-xs bg-bg-subtle text-text-body px-2 py-1 rounded-full border border-panel-border">
            Retraité
          </span>
        )}
      </div>

      {(item.brand || item.model) && (
        <p className="text-sm text-text-body dark:text-dark-text-secondary mb-3">
          {item.brand} {item.model}
        </p>
      )}

      {/* Alerte de maintenance */}
      {maintenanceStatus && item.isActive && (
        <div
          className={`mb-4 p-3 rounded-xl border-2 ${
            maintenanceStatus.status === "urgent"
              ? "bg-danger/10 border-danger"
              : maintenanceStatus.status === "soon"
                ? "bg-warning/10 border-warning"
                : "bg-success/10 border-success"
          }`}
        >
          <p
            className={`text-sm font-medium mb-2 ${
              maintenanceStatus.status === "urgent"
                ? "text-danger"
                : maintenanceStatus.status === "soon"
                  ? "text-warning dark:text-warning"
                  : "text-success"
            }`}
          >
            {maintenanceStatus.label}
          </p>

          {/* Barre de progression */}
          <div className="w-full bg-bg-subtle rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                maintenanceStatus.status === "urgent"
                  ? "bg-danger"
                  : maintenanceStatus.status === "soon"
                    ? "bg-warning"
                    : "bg-success"
              }`}
              style={{ width: `${Math.min(maintenanceStatus.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-body dark:text-dark-text-secondary">Distance totale:</span>
          <span className="font-medium text-text-dark dark:text-dark-text-contrast">{formatDistance(item.currentDistance)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-body dark:text-dark-text-secondary">Distance parcourue:</span>
          <span className="font-medium text-text-dark dark:text-dark-text-contrast">
            {formatDistance(item.currentDistance - item.initialDistance)}
          </span>
        </div>
        {item.purchaseDate && (
          <div className="flex justify-between text-sm">
            <span className="text-text-body dark:text-dark-text-secondary">Acheté le:</span>
            <span className="font-medium text-text-dark dark:text-dark-text-contrast">
              {new Date(item.purchaseDate).toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}
      </div>

      {item.notes && (
        <div className="mb-4 p-3 bg-bg-subtle rounded-xl border border-panel-border">
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary italic">"{item.notes}"</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 px-3 py-2 rounded-xl border-2 border-panel-border bg-panel-bg hover:bg-accent/10 text-text-secondary dark:text-dark-text-secondary hover:text-accent transition-all text-sm font-medium"
        >
          Modifier
        </button>
        <button
          onClick={() => onToggleActive(item)}
          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
            item.isActive
              ? "border-warning bg-warning/10 text-warning hover:bg-warning/20"
              : "border-success bg-success/10 text-success hover:bg-success/20"
          }`}
        >
          {item.isActive ? "Retirer" : "Réactiver"}
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-2 rounded-xl text-sm font-medium border-2 border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-all"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
