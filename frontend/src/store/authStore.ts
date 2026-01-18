import { create } from 'zustand'

interface User {
  id: number
  email: string
  fullName: string | null
  fcMax: number | null
  fcRepos: number | null
  ftp: number | null
  weightCurrent: number | null
  theme: 'light' | 'dark'
  avatarUrl?: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: !!localStorage.getItem('authToken'), // Loading si token présent mais user non chargé
  authError: null,

  setAuth: (user, token) => {
    localStorage.setItem('authToken', token)
    set({ user, token, isAuthenticated: true, isLoading: false, authError: null })
  },

  logout: () => {
    localStorage.removeItem('authToken')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, authError: null })
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ authError: error, isLoading: false }),

  clearError: () => set({ authError: null }),
}))
