#!/usr/bin/env bash
# Script pour arrêter l'application
set -euo pipefail

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

# Vérifier si un conteneur est en cours d'exécution
container_running() {
    [[ "$(podman inspect -f '{{.State.Running}}' "$1" 2>/dev/null)" == "true" ]]
}

# Arrêter un conteneur
stop_container() {
    local name="$1"
    local display_name="$2"

    if container_running "$name"; then
        log "Arrêt de ${display_name}..."
        if podman stop "$name" >/dev/null 2>&1; then
            log_success "${display_name} arrêté"
        else
            log_warn "Impossible d'arrêter ${display_name}"
        fi
    else
        log_warn "${display_name} n'était pas en cours d'exécution"
    fi
}

# Afficher l'état final
show_status() {
    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  État des conteneurs                                │"
    echo "├─────────────────────────────────────────────────────┤"

    local frontend_status="arrêté"
    local backend_status="arrêté"

    if container_running cycliste-frontend; then
        frontend_status="${RED}en cours${NC}"
    else
        frontend_status="${GREEN}arrêté${NC}"
    fi

    if container_running cycliste-backend; then
        backend_status="${RED}en cours${NC}"
    else
        backend_status="${GREEN}arrêté${NC}"
    fi

    echo -e "│  Frontend: ${frontend_status}                                  │"
    echo -e "│  Backend:  ${backend_status}                                  │"
    echo "└─────────────────────────────────────────────────────┘"
}

# Fonction principale
main() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Centre d'Analyse Cycliste - Arrêt                  ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    stop_container "cycliste-frontend" "Frontend"
    stop_container "cycliste-backend" "Backend"

    show_status

    echo ""
    log_success "Application arrêtée"
    echo ""
    echo "Pour redémarrer: ./scripts/start.sh"
    echo ""
}

main "$@"
