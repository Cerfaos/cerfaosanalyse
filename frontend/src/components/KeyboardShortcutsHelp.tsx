import { useState, useEffect } from 'react'
import { getShortcutsList } from '../hooks/useKeyboardShortcuts'

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const shortcuts = getShortcutsList()

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('toggle-shortcuts-help', handleToggle)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('toggle-shortcuts-help', handleToggle)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="glass-panel max-w-lg w-full mx-4 p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="shortcuts-title" className="text-xl font-bold font-display">
            Raccourcis clavier
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-dark dark:text-dark-text-secondary dark:hover:text-dark-text transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-bg-gray-100 dark:bg-dark-border rounded border border-border-base/30 dark:border-dark-border">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border-base/20 dark:border-dark-border">
          <p className="text-xs text-text-muted dark:text-dark-text-secondary">
            Appuyez sur <kbd className="px-1 py-0.5 text-xs font-mono bg-bg-gray-100 dark:bg-dark-border rounded">Esc</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  )
}
