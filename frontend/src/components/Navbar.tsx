import { Link } from 'react-router-dom'

const links = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Sécurité', href: '#security' },
  { label: 'Roadmap', href: '#roadmap' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-base/60 dark:border-dark-border/60 bg-bg-gray-50/80 dark:bg-dark-bg/70 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand text-white flex items-center justify-center font-semibold">
            C
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Cerfao</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">Analyse Cycliste</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          {links.map(({ label, href }) => (
            <a key={href} href={href} className="hover:text-text-dark transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm font-medium">
          <Link to="/login" className="text-text-secondary hover:text-text-dark">
            Connexion
          </Link>
          <Link
            to="/register"
            className="btn-primary"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  )
}
