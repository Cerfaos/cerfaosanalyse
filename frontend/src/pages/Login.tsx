import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { user, token } = response.data.data

      setAuth(user, token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-text-muted mb-4">Bienvenue</p>
          <h1 className="text-4xl font-semibold mb-4 text-text-dark dark:text-dark-text-contrast">Connectez-vous à votre cockpit</h1>
          <p className="text-text-secondary mb-8">
            Accédez à vos tableaux de bord, importez vos fichiers et suivez votre charge en temps réel.
          </p>
          <Link to="/register" className="text-sm font-medium text-cta hover:text-cta/80">
            Pas encore de compte ? Créez-le en 2 minutes →
          </Link>
        </div>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-2xl border border-error/40 bg-error/5 text-error px-4 py-3 text-sm">{error}</div>}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-dark">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border-base bg-bg-white focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-text-dark">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border-base bg-bg-white focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-text-secondary">
            <Link to="/" className="hover:text-text-dark">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
