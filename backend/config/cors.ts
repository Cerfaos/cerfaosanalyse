import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */

// Liste des origines autorisées (hardcodée pour éviter les problèmes podman)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://192.168.0.11:8080',
  'http://192.168.0.11:5173',
]

// Fonction qui vérifie dynamiquement l'origine
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false
  // Accepter toutes les origines locales
  return ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://localhost')
}

const corsConfig = defineConfig({
  enabled: true,
  // Fonction qui vérifie chaque origine dynamiquement
  origin: (requestOrigin) => isOriginAllowed(requestOrigin),
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
