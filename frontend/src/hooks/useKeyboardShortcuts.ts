import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface Shortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  const shortcuts: Shortcut[] = [
    {
      key: 'h',
      action: () => navigate('/'),
      description: 'Accueil',
    },
    {
      key: 'd',
      action: () => navigate('/dashboard'),
      description: 'Tableau de bord',
    },
    {
      key: 'i',
      action: () => navigate('/insights'),
      description: 'Prédictions',
    },
    {
      key: 'a',
      action: () => navigate('/activities'),
      description: 'Activités',
    },
    {
      key: 'r',
      action: () => navigate('/records'),
      description: 'Records',
    },
    {
      key: 'p',
      action: () => navigate('/profile'),
      description: 'Profil',
    },
    {
      key: 'c',
      action: () => navigate('/cycling'),
      description: 'Cartographie FC',
    },
    {
      key: 'w',
      action: () => navigate('/weight'),
      description: 'Poids',
    },
    {
      key: 't',
      action: () => navigate('/training-load'),
      description: "Charge d'entraînement",
    },
    {
      key: 'e',
      action: () => navigate('/equipment'),
      description: 'Équipement',
    },
    {
      key: 'x',
      action: () => navigate('/export'),
      description: 'Export',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // Toggle help modal
        const event = new CustomEvent('toggle-shortcuts-help')
        window.dispatchEvent(event)
      },
      description: 'Afficher les raccourcis',
    },
  ]

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorer si on est dans un input, textarea ou contenteditable
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('[contenteditable="true"]')
      ) {
        return
      }

      // Ignorer si une modal est ouverte (sauf pour Escape)
      if (event.key !== 'Escape' && document.querySelector('[role="dialog"]')) {
        return
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase()
        const ctrlMatch = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const altMatch = s.alt ? event.altKey : !event.altKey
        const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey

        return keyMatch && ctrlMatch && altMatch && shiftMatch
      })

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    },
    [shortcuts, navigate, location]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { shortcuts }
}

export function getShortcutsList() {
  return [
    { key: 'H', description: 'Accueil' },
    { key: 'D', description: 'Tableau de bord' },
    { key: 'I', description: 'Analyses' },
    { key: 'A', description: 'Activités' },
    { key: 'R', description: 'Records' },
    { key: 'P', description: 'Profil' },
    { key: 'C', description: 'Cartographie FC' },
    { key: 'W', description: 'Poids' },
    { key: 'T', description: "Charge d'entraînement" },
    { key: 'E', description: 'Équipement' },
    { key: 'X', description: 'Export' },
    { key: 'Shift + ?', description: 'Afficher les raccourcis' },
  ]
}
