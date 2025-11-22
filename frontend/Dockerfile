# Frontend Dockerfile pour React + Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Argument pour l'URL de l'API (passé au build time)
ARG VITE_API_URL=http://localhost:3333
ENV VITE_API_URL=$VITE_API_URL

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (legacy-peer-deps pour compatibilité React 19)
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Build de production avec la variable d'environnement
RUN npm run build

# Stage final avec nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
