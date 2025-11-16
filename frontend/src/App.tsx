import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import GlobalShortcuts from './components/GlobalShortcuts'
import GlobalSearch from './components/GlobalSearch'

// Lazy loading des pages pour réduire le bundle initial
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Weight = lazy(() => import('./pages/Weight'))
const Activities = lazy(() => import('./pages/Activities'))
const ActivityDetail = lazy(() => import('./pages/ActivityDetail'))
const TrainingLoad = lazy(() => import('./pages/TrainingLoad'))
const CyclingStats = lazy(() => import('./pages/CyclingStats'))
const Equipment = lazy(() => import('./pages/Equipment'))
const Export = lazy(() => import('./pages/Export'))
const Badges = lazy(() => import('./pages/Badges'))
const Goals = lazy(() => import('./pages/Goals'))
const Records = lazy(() => import('./pages/Records'))
const Insights = lazy(() => import('./pages/Insights'))

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Composant de chargement pour Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-gray-50 dark:bg-dark-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
        <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">Chargement...</p>
      </div>
    </div>
  )
}

function App() {
  // Charger automatiquement l'utilisateur si un token existe
  useAuth()
  // Initialiser le thème
  useTheme()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        {/* Raccourcis clavier globaux */}
        <GlobalShortcuts />
        {/* Recherche globale */}
        <GlobalSearch />
        {/* Skip navigation pour accessibilité */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-text)',
              border: '1px solid var(--toast-border)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        <main id="main-content">
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycling"
            element={
              <ProtectedRoute>
                <CyclingStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id"
            element={
              <ProtectedRoute>
                <ActivityDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weight"
            element={
              <ProtectedRoute>
                <Weight />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment"
            element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-load"
            element={
              <ProtectedRoute>
                <TrainingLoad />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/export"
            element={
              <ProtectedRoute>
                <Export />
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <Badges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
        </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
