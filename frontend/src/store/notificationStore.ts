import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'achievement'
  title: string
  message: string
  timestamp: number
  read: boolean
  link?: string
  icon?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Garder max 50
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }
          }
          return state
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const wasUnread = notification && !notification.read
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'notifications',
    }
  )
)

// Service pour générer des notifications intelligentes
export const notificationService = {
  // Notification de record battu
  newRecord: (recordType: string, value: string) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'achievement',
      title: 'Nouveau record personnel !',
      message: `Félicitations ! Vous avez battu votre record de ${recordType} avec ${value}`,
      icon: '🏆',
      link: '/records',
    })
  },

  // Notification d'objectif atteint
  goalCompleted: (goalTitle: string) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'success',
      title: 'Objectif atteint !',
      message: `Bravo ! Vous avez complété l'objectif "${goalTitle}"`,
      icon: '🎯',
      link: '/goals',
    })
  },

  // Notification de repos recommandé
  restRecommended: () => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'warning',
      title: 'Repos recommandé',
      message: 'Votre charge d\'entraînement est élevée. Pensez à prendre un jour de repos.',
      icon: '😴',
      link: '/insights',
    })
  },

  // Notification de streak
  streakAchieved: (days: number) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'achievement',
      title: `Streak de ${days} jours !`,
      message: `Impressionnant ! Vous vous êtes entraîné ${days} jours consécutifs.`,
      icon: '🔥',
      link: '/dashboard',
    })
  },

  // Notification de badge débloqué
  badgeUnlocked: (badgeName: string) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'achievement',
      title: 'Badge débloqué !',
      message: `Vous avez obtenu le badge "${badgeName}"`,
      icon: '🎖️',
      link: '/badges',
    })
  },

  // Notification d'inactivité
  inactivityWarning: (days: number) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'info',
      title: 'On se remet en selle ?',
      message: `Cela fait ${days} jours sans activité. Planifiez votre prochaine séance !`,
      icon: '💪',
      link: '/activities',
    })
  },
}
