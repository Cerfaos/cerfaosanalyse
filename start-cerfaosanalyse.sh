#!/usr/bin/env bash
set -euo pipefail

# Script de démarrage rapide pour backend + frontend CerfAOS Analyse.
# Copiez ce fichier (par exemple dans ~/Documents) et exécutez-le tel quel.
# Vous pouvez remplacer l'emplacement du projet en exportant PROJECT_ROOT
# avant d'appeler ce script.

DEFAULT_ROOT="/home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse"
PROJECT_ROOT="${PROJECT_ROOT:-$DEFAULT_ROOT}"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

abort() {
  echo "Erreur: $*" >&2
  exit 1
}

command -v npm >/dev/null 2>&1 || abort "npm n'est pas installé ou introuvable dans le PATH."
[[ -d "$BACKEND_DIR" ]] || abort "Répertoire backend introuvable: $BACKEND_DIR"
[[ -d "$FRONTEND_DIR" ]] || abort "Répertoire frontend introuvable: $FRONTEND_DIR"

cleanup() {
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

log "Démarrage du backend..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!
log "Backend lancé (PID $BACKEND_PID)."

log "Démarrage du frontend... (Ctrl+C pour tout arrêter)"
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

wait "$FRONTEND_PID"
