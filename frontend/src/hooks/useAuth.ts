import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTrainingStore } from '../store/trainingStore'
import api from '../services/api'
import { AxiosError } from 'axios'

export function useAuth() {
  const { token, user, logout, setLoading, setError } = useAuthStore()
  const { fetchProfile, syncProfileFromUser } = useTrainingStore()
  const isLoadingRef = useRef(false)

  useEffect(() => {
    // Si on a un token mais pas d'utilisateur, charger l'utilisateur
    if (token && !user && !isLoadingRef.current) {
      loadCurrentUser()
    } else if (!token) {
      // Pas de token, pas de chargement nécessaire
      setLoading(false)
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
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setLoading(true)

    try {
      const response = await api.get('/api/auth/me')
      const userData = response.data.data

      // Mettre à jour le store avec les données utilisateur
      useAuthStore.setState({ user: userData, isLoading: false, authError: null })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>

      // Distinguer les types d'erreurs
      if (axiosError.response) {
        // Erreur du serveur (401, 403, 500, etc.)
        const status = axiosError.response.status
        const message = axiosError.response.data?.message || 'Erreur serveur'

        if (status === 401) {
          // Token invalide ou expiré - déconnexion silencieuse
          console.warn('[Auth] Token expiré ou invalide')
          logout()
        } else if (status === 403) {
          setError('Accès refusé')
          logout()
        } else {
          setError(`Erreur serveur: ${message}`)
          // Ne pas déconnecter pour les erreurs 500, réessayer possible
        }
      } else if (axiosError.request) {
        // Pas de réponse du serveur (réseau, CORS, etc.)
        console.error('[Auth] Erreur réseau:', axiosError.message)
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
        // Ne pas déconnecter - problème réseau temporaire
      } else {
        // Erreur de configuration
        console.error('[Auth] Erreur:', axiosError.message)
        setError('Erreur inattendue')
      }
    } finally {
      isLoadingRef.current = false
    }
  }

  return { user, token, logout }
}
