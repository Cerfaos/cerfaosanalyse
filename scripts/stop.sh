#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

log "Arrêt de l'application..."

podman stop cycliste-frontend 2>/dev/null || true
podman stop cycliste-backend 2>/dev/null || true

log "Application arrêtée."
