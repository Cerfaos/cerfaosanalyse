/**
 * Point d'entrée du système d'icônes
 */

export { Icon, useIconExists, getAllIconNames } from "./Icon";
export type { IconProps } from "./Icon";
export { customIcons } from "./custom";
export type { CustomIconProps } from "./custom";

// Re-export lucide pour accès direct si nécessaire
export * from "lucide-react";
