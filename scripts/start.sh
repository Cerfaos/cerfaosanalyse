#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

log "Démarrage de l'application..."

# Démarrer le backend
log "Démarrage du backend..."
podman start cycliste-backend 2>/dev/null || {
  log "ERREUR: Le conteneur cycliste-backend n'existe pas."
  log "Exécutez: ./scripts/rebuild-containers.sh"
  exit 1
}

# Attendre que le backend soit prêt
log "Attente du backend..."
for i in {1..30}; do
  if curl -s http://localhost:3333/health > /dev/null 2>&1; then
    log "Backend prêt!"
    break
  fi
  sleep 1
done

# Démarrer le frontend
log "Démarrage du frontend..."
podman start cycliste-frontend 2>/dev/null || {
  log "ERREUR: Le conteneur cycliste-frontend n'existe pas."
  exit 1
}

sleep 2

log ""
log "========================================="
log "Application démarrée"
log "========================================="
log "URL: http://192.168.0.11:8080"
log ""
log "Pour arrêter: ./scripts/stop.sh"
log "========================================="

# Ouvrir le navigateur automatiquement
if command -v xdg-open &> /dev/null; then
  xdg-open "http://192.168.0.11:8080" &> /dev/null &
elif command -v firefox &> /dev/null; then
  firefox "http://192.168.0.11:8080" &> /dev/null &
fi
