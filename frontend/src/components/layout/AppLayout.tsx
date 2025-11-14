import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle'
import { useAuthStore } from '../../store/authStore'
import { getAvatarUrl } from '../../services/api'

type LayoutProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

const navigation = [
  { label: 'Accueil', to: '/', icon: HomeIcon },
  { label: 'Tableau de bord', to: '/dashboard', icon: DashboardIcon },
  { label: 'Activités', to: '/activities', icon: ActivitiesIcon },
  { label: 'Poids', to: '/weight', icon: WeightIcon },
  { label: "Charge d'entraînement", to: '/training-load', icon: TrainingIcon },
  { label: 'Équipement', to: '/equipment', icon: EquipmentIcon },
  { label: 'Profil', to: '/profile', icon: ProfileIcon },
  { label: 'Export', to: '/export', icon: ExportIcon },
]

export default function AppLayout({ title, description, actions, children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-shell min-h-screen w-full text-text-dark dark:text-dark-text-contrast">
      <div className="flex">
        <aside
          className={`sidebar-shell font-display fixed inset-y-0 left-0 z-40 w-80 rounded-r-3xl shadow-lg flex flex-col transition-transform duration-300 lg:static lg:rounded-none lg:shadow-none lg:border-r lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-8 py-8 flex items-center justify-between border-b-4 border-panel-border">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-text-muted dark:text-dark-text-secondary">Cerfao</p>
              <p className="text-3xl font-bold">Centre Cycliste</p>
            </div>
            <button
              className="lg:hidden text-text-muted"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {navigation.map(({ label, to, icon: Icon }) => {
              const active = location.pathname.startsWith(to)
              const itemStyle = active
                ? {
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-elevated)',
                    borderColor: 'var(--panel-border)',
                    boxShadow: '10px 10px 0 var(--shadow-color)',
                  }
                : {
                    backgroundColor: 'var(--panel-bg)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--panel-border)',
                  }
              const iconStyle = active
                ? {
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    borderColor: 'var(--bg-elevated)',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    borderColor: 'var(--panel-border)',
                  }
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-xl font-semibold tracking-wide transition-all border-4 ${
                    active ? 'hover:-translate-y-1' : 'hover:-translate-y-1'
                  }`}
                  style={itemStyle}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2"
                    style={iconStyle}
                  >
                    <Icon />
                  </span>
                  <span className="font-display">{label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="px-8 py-6 border-t-4 border-panel-border mt-6">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={getAvatarUrl(user.avatarUrl)}
                  alt={user.fullName || user.email || 'Avatar utilisateur'}
                  className="h-12 w-12 rounded-2xl border-4 border-panel-border object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-2xl border-4 border-panel-border bg-panel-bg flex items-center justify-center font-semibold text-lg">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
              <div className="text-sm">
                <p className="font-semibold">{user?.fullName || 'Athlète'}</p>
                <p className="text-text-muted dark:text-dark-text-secondary text-xs">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="text-sm text-text-muted hover:text-danger dark:text-dark-text-secondary transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <div className="flex-1 lg:ml-0 lg:w-auto w-full min-h-screen flex flex-col">
          <header className="px-6 pt-12">
            <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-7xl mx-auto">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary mb-1 font-display">
                  Vue générale
                </p>
                <h1 className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast font-display">{title}</h1>
                {description && <p className="text-sm text-text-muted dark:text-dark-text-secondary">{description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden h-10 w-10 rounded-full border border-border-base flex items-center justify-center"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Ouvrir le menu"
                >
                  ☰
                </button>
                {actions}
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 pb-12 mt-12">
            <div className="max-w-7xl mx-auto space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12h7V3H3v9zm11 9h7v-7h-7v7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21h7v-6H3v6zm11-9h7V3h-7v9z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ActivitiesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12h4l2 7 4-14 2 7h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 13.5h6" strokeLinecap="round" />
    </svg>
  )
}

function TrainingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 16c1.333-2 3.333-3 6-3s4.667 1 6 3" strokeLinecap="round" />
      <path d="M12 5v8" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1" />
    </svg>
  )
}

function EquipmentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 7h10v10H7z" opacity="0.4" />
      <path d="M5 5h14v14H5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c1.5-2.5 3.5-4 6-4s4.5 1.5 6 4" strokeLinecap="round" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M15 6l-3-3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="15" width="14" height="6" rx="2" />
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9.5L12 3l9 6.5V21H3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
