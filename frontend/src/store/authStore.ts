import { create } from 'zustand'

interface User {
  id: number
  email: string
  fullName: string | null
  fcMax: number | null
  fcRepos: number | null
  weightCurrent: number | null
  theme: 'light' | 'dark'
  avatarUrl?: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),

  setAuth: (user, token) => {
    localStorage.setItem('authToken', token)
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('authToken')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}))
