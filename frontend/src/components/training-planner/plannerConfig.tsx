/**
 * Configuration pour le planificateur d'entraînement
 */

import { Bike, FolderOpen, Calendar } from "lucide-react";

export type TabId = "sessions" | "templates" | "planning";

export const TABS: { id: TabId; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: "sessions", label: "Mes séances", shortLabel: "Séances", icon: <Bike className="h-4 w-4" /> },
  { id: "templates", label: "Modèles", shortLabel: "Modèles", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "planning", label: "Planification", shortLabel: "Planning", icon: <Calendar className="h-4 w-4" /> },
];
