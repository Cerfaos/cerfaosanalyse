import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Widget {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  order: number
  size: 'small' | 'medium' | 'large' | 'full'
}

interface DashboardState {
  widgets: Widget[]
  setWidgets: (widgets: Widget[]) => void
  toggleWidget: (id: string) => void
  reorderWidgets: (startIndex: number, endIndex: number) => void
  resetToDefault: () => void
}

const defaultWidgets: Widget[] = [
  {
    id: 'period-stats',
    name: 'Statistiques par période',
    description: 'Vue d\'ensemble des stats sur la période sélectionnée',
    icon: '📊',
    enabled: true,
    order: 0,
    size: 'full',
  },
  {
    id: 'type-stats',
    name: 'Stats par type d\'activité',
    description: 'Répartition des activités par type',
    icon: '🏃',
    enabled: true,
    order: 1,
    size: 'full',
  },
  {
    id: 'timeline',
    name: 'Timeline des activités',
    description: 'Graphique d\'évolution temporelle',
    icon: '📈',
    enabled: true,
    order: 2,
    size: 'full',
  },
  {
    id: 'weight-chart',
    name: 'Évolution du poids',
    description: 'Graphique de suivi du poids',
    icon: '⚖️',
    enabled: true,
    order: 3,
    size: 'full',
  },
  {
    id: 'heatmap',
    name: 'Calendrier d\'activités',
    description: 'Heatmap style GitHub',
    icon: '🗓️',
    enabled: true,
    order: 4,
    size: 'full',
  },
  {
    id: 'year-comparison',
    name: 'Comparaison annuelle',
    description: 'Compare les performances année vs année',
    icon: '📅',
    enabled: true,
    order: 5,
    size: 'full',
  },
  {
    id: 'zone-progression',
    name: 'Zones d\'effort',
    description: 'Distribution par zone cardiaque',
    icon: '❤️',
    enabled: true,
    order: 6,
    size: 'full',
  },
  {
    id: 'gps-map',
    name: 'Carte des parcours',
    description: 'Traces GPS superposées',
    icon: '🗺️',
    enabled: true,
    order: 7,
    size: 'full',
  },
  {
    id: 'recent-activities',
    name: 'Activités récentes',
    description: 'Liste des dernières activités',
    icon: '🕐',
    enabled: true,
    order: 8,
    size: 'full',
  },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,

      setWidgets: (widgets) => set({ widgets }),

      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
        })),

      reorderWidgets: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.widgets)
          const [removed] = result.splice(startIndex, 1)
          result.splice(endIndex, 0, removed)
          // Mettre à jour les ordres
          const reordered = result.map((w, index) => ({ ...w, order: index }))
          return { widgets: reordered }
        }),

      resetToDefault: () => set({ widgets: defaultWidgets }),
    }),
    {
      name: 'dashboard-widgets',
    }
  )
)
