import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export function useAuth() {
  const { token, user, setAuth, logout } = useAuthStore()

  useEffect(() => {
    // Si on a un token mais pas d'utilisateur, charger l'utilisateur
    if (token && !user) {
      loadCurrentUser()
    }
  }, [token, user])

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/api/auth/me')
      const userData = response.data.data

      // Mettre à jour le store avec les données utilisateur
      useAuthStore.setState({ user: userData })
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error)
      // Si le token n'est plus valide, déconnecter
      logout()
    }
  }

  return { user, token, logout }
}
