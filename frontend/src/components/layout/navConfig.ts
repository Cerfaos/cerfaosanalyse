/**
 * Configuration de la navigation
 */

import {
  HomeIcon,
  DashboardIcon,
  InsightsIcon,
  CyclingIcon,
  ActivitiesIcon,
  RecordsIcon,
  WeightIcon,
  TrainingIcon,
  EquipmentIcon,
  ProfileIcon,
  ExportIcon,
  ReportsIcon,
  IconsDevIcon,
  PlanningIcon,
} from "./navIcons";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType;
}

export const navigation: NavItem[] = [
  { label: "Accueil", to: "/", icon: HomeIcon },
  { label: "Tableau de bord", to: "/dashboard", icon: DashboardIcon },
  { label: "Prédictions", to: "/insights", icon: InsightsIcon },
  { label: "Cartographie FC", to: "/cycling", icon: CyclingIcon },
  { label: "Activités", to: "/activities", icon: ActivitiesIcon },
  { label: "Records", to: "/records", icon: RecordsIcon },
  { label: "Planification", to: "/training", icon: PlanningIcon },
  { label: "Poids", to: "/weight", icon: WeightIcon },
  { label: "Charge d'entraînement", to: "/training-load", icon: TrainingIcon },
  { label: "Équipement", to: "/equipment", icon: EquipmentIcon },
  { label: "Profil", to: "/profile", icon: ProfileIcon },
  { label: "Export", to: "/export", icon: ExportIcon },
  { label: "Rapports", to: "/reports", icon: ReportsIcon },
  { label: "Icônes (Dev)", to: "/icons", icon: IconsDevIcon },
];
