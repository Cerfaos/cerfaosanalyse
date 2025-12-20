import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTrainingStore } from '../store/trainingStore'
import api from '../services/api'

export function useAuth() {
  const { token, user, logout } = useAuthStore()
  const { fetchProfile, syncProfileFromUser } = useTrainingStore()

  useEffect(() => {
    // Si on a un token mais pas d'utilisateur, charger l'utilisateur
    if (token && !user) {
      loadCurrentUser()
    }
  }, [token, user])

  // Charger le profil d'entraînement quand l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      // Synchroniser d'abord avec les données utilisateur de base
      syncProfileFromUser(user)
      // Puis charger le profil complet avec l'historique FTP
      fetchProfile()
    }
  }, [user])

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
