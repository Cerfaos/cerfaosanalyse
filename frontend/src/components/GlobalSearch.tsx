import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface SearchResult {
  type: 'activity' | 'page'
  id?: number
  title: string
  subtitle: string
  icon: string
  path: string
}

const pages: SearchResult[] = [
  { type: 'page', title: 'Accueil', subtitle: 'Page principale', icon: '🏠', path: '/' },
  { type: 'page', title: 'Tableau de bord', subtitle: 'Vue d\'ensemble', icon: '📊', path: '/dashboard' },
  { type: 'page', title: 'Insights', subtitle: 'Analyses intelligentes', icon: '🧠', path: '/insights' },
  { type: 'page', title: 'Activités', subtitle: 'Liste des activités', icon: '🏃', path: '/activities' },
  { type: 'page', title: 'Records', subtitle: 'Records personnels', icon: '🏆', path: '/records' },
  { type: 'page', title: 'Profil', subtitle: 'Paramètres utilisateur', icon: '👤', path: '/profile' },
  { type: 'page', title: 'Cartographie FC', subtitle: 'Zones cardiaques', icon: '❤️', path: '/cycling' },
  { type: 'page', title: 'Poids', subtitle: 'Suivi du poids', icon: '⚖️', path: '/weight' },
  { type: 'page', title: 'Charge d\'entraînement', subtitle: 'CTL/ATL/TSB', icon: '📈', path: '/training-load' },
  { type: 'page', title: 'Équipement', subtitle: 'Gestion équipement', icon: '🚲', path: '/equipment' },
  { type: 'page', title: 'Export', subtitle: 'Exporter les données', icon: '📥', path: '/export' },
]

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Raccourci clavier pour ouvrir la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K pour ouvrir
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape pour fermer
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus sur l'input quand on ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Recherche dans les pages et activités
  useEffect(() => {
    if (!query.trim()) {
      setResults(pages.slice(0, 6))
      setSelectedIndex(0)
      return
    }

    const searchTerm = query.toLowerCase()
    const pageResults = pages.filter(
      (p) => p.title.toLowerCase().includes(searchTerm) || p.subtitle.toLowerCase().includes(searchTerm)
    )

    // Rechercher dans les activités
    const searchActivities = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/api/activities?search=${encodeURIComponent(query)}&limit=5`)
        const activities = response.data.data.activities || []

        const activityResults: SearchResult[] = activities.map((a: any) => ({
          type: 'activity',
          id: a.id,
          title: a.type,
          subtitle: new Date(a.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          icon: getActivityIcon(a.type),
          path: `/activities/${a.id}`,
        }))

        setResults([...pageResults.slice(0, 4), ...activityResults])
      } catch (error) {
        setResults(pageResults)
      } finally {
        setLoading(false)
      }
    }

    searchActivities()
    setSelectedIndex(0)
  }, [query])

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      Cyclisme: '🚴',
      Course: '🏃',
      Natation: '🏊',
      Marche: '🚶',
      Randonnée: '🥾',
      VTT: '🚵',
      Musculation: '💪',
    }
    return icons[type] || '🏃'
  }

  const handleSelect = (result: SearchResult) => {
    navigate(result.path)
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-border-base dark:border-dark-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input de recherche */}
        <div className="p-4 border-b border-border-base/30 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-text-muted dark:text-dark-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNavigation}
              placeholder="Rechercher pages, activités..."
              className="flex-1 bg-transparent border-none outline-none text-text-dark dark:text-dark-text-contrast placeholder-text-muted dark:placeholder-dark-text-secondary text-lg"
            />
            {loading && (
              <div className="animate-spin w-5 h-5 border-2 border-brand border-t-transparent rounded-full" />
            )}
            <kbd className="px-2 py-1 text-xs bg-bg-gray-100 dark:bg-dark-border rounded">Esc</kbd>
          </div>
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-text-muted dark:text-dark-text-secondary">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id || result.path}`}
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-brand/10 dark:bg-brand/20'
                      : 'hover:bg-bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  <span className="text-2xl">{result.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-text-dark dark:text-dark-text-contrast">{result.title}</div>
                    <div className="text-sm text-text-muted dark:text-dark-text-secondary">{result.subtitle}</div>
                  </div>
                  {result.type === 'activity' && (
                    <span className="text-xs px-2 py-1 bg-brand/10 text-brand rounded">Activité</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-base/30 dark:border-dark-border bg-bg-gray-50 dark:bg-dark-bg">
          <div className="flex items-center justify-between text-xs text-text-muted dark:text-dark-text-secondary">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-surface rounded">↑↓</kbd> Naviguer
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-surface rounded">Enter</kbd> Sélectionner
              </span>
            </div>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-surface rounded">⌘K</kbd> Ouvrir recherche
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
