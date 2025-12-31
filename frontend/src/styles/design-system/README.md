# Design System - Centre d'Analyse Cycliste

## Architecture Rationalisée

Ce dossier contient le nouveau système de design unifié.

### Structure

```
design-system/
├── tokens/
│   ├── colors.css       # Palette de couleurs (thèmes)
│   ├── typography.css   # Typographie
│   ├── spacing.css      # Espacement et layout
│   ├── shadows.css      # Ombres et effets
│   └── animations.css   # Animations et transitions
├── themes/
│   ├── theme-dark.css   # Thème sombre
│   └── theme-light.css  # Thème clair
├── components/
│   └── base.css         # Styles de base des composants
├── icons/
│   └── custom/          # Dossier pour icônes personnalisées SVG
└── index.css            # Point d'entrée
```

### Principes

1. **Single Source of Truth** - Toutes les couleurs via CSS Variables
2. **Semantic Naming** - Noms basés sur l'usage, pas la couleur
3. **Theme-Ready** - Support natif dark/light mode
4. **No Hardcoded Values** - Aucune couleur hex dans les composants
5. **Custom Icons Ready** - Infrastructure pour icônes personnalisées

### Utilisation

```tsx
// Au lieu de :
className="bg-[#0A191A] text-[#8BC34A]"

// Utiliser :
className="bg-surface-primary text-accent-primary"
```
