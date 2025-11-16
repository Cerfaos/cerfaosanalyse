import { useAuthStore } from '../store/authStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'

export default function GlobalShortcuts() {
  const { isAuthenticated } = useAuthStore()

  // Active les raccourcis seulement si authentifié
  if (isAuthenticated) {
    useKeyboardShortcuts()
  }

  return <KeyboardShortcutsHelp />
}
