#!/usr/bin/env bash
set -euo pipefail

# Script de démarrage pour CerfAOS Analyse avec Alacritty.

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

command -v alacritty >/dev/null 2>&1 || abort "Alacritty n'est pas installé ou introuvable."
[[ -d "$BACKEND_DIR" ]] || abort "Répertoire backend introuvable: $BACKEND_DIR"
[[ -d "$FRONTEND_DIR" ]] || abort "Répertoire frontend introuvable: $FRONTEND_DIR"

log "Lancement du Backend dans Alacritty..."
alacritty --title "CerfAOS Backend" --working-directory "$BACKEND_DIR" -e npm run dev &

log "Lancement du Frontend dans Alacritty..."
alacritty --title "CerfAOS Frontend" --working-directory "$FRONTEND_DIR" -e npm run dev &

log "Application lancée dans des terminaux séparés."
log "Utilisez ./scripts/stop-cerfaosanalyse.sh pour tout arrêter."
