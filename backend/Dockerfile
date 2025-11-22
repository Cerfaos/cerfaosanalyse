# Backend Dockerfile pour AdonisJS
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (dev incluses pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Build l'application AdonisJS
RUN node ace build

# Stage de production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le build depuis le stage builder
COPY --from=builder /app/build ./build

# Créer les répertoires nécessaires
RUN mkdir -p tmp uploads

# Exposer le port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Commande de démarrage
CMD ["node", "build/bin/server.js"]
