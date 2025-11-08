import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <nav className="bg-white border-b border-border-base">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-text-dark">
              Centre d'Analyse Cycliste
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="flex items-center gap-8">
              <Link
                to="/dashboard"
                className="text-text-body hover:text-text-dark transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/activities"
                className="text-text-body hover:text-text-dark transition-colors font-medium"
              >
                Activités
              </Link>
              <Link
                to="/weight"
                className="text-text-body hover:text-text-dark transition-colors font-medium"
              >
                Poids
              </Link>
              <Link
                to="/equipment"
                className="text-text-body hover:text-text-dark transition-colors font-medium"
              >
                Équipement
              </Link>
              <Link
                to="/training-load"
                className="text-text-body hover:text-text-dark transition-colors font-medium"
              >
                Charge d'entraînement
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-4 pl-4 border-l border-border-base">
                <Link
                  to="/profile"
                  className="text-text-secondary hover:text-text-dark transition-colors"
                >
                  {user?.fullName || user?.email}
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-white text-text-body border border-border-base rounded-md hover:bg-bg-gray-50 hover:border-border-medium transition-all"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}

          {/* Login/Register (when not authenticated) */}
          {!isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-text-body hover:text-text-dark transition-colors font-medium"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 shadow-button hover:shadow-button-hover transition-all font-medium"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
