#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

log "Arrêt de l'application..."

# Fonction pour tuer un processus par port
kill_port() {
  local port=$1
  local pid=$(lsof -ti :$port 2>/dev/null || true)
  if [[ -n "$pid" ]]; then
    log "Arrêt du processus sur le port $port (PID $pid)..."
    kill -9 "$pid" 2>/dev/null || true
  fi
}

# Arrêt par ports
kill_port 3333 # Backend
kill_port 5173 # Frontend Vite
kill_port 8080 # Frontend Docker/Podman (au cas où)

# Nettoyage supplémentaire par nom de processus
log "Nettoyage des processus restants..."
pkill -f "node ace serve" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

log "Application arrêtée."
