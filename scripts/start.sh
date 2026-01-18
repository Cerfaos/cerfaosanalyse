#!/usr/bin/env bash
# Script pour démarrer l'application (conteneurs existants)
set -euo pipefail

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_error() { printf "${RED}[%s] ✗${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

# Détecter l'IP locale
detect_local_ip() {
    local ip
    ip=$(hostname -I 2>/dev/null | awk '{print $1}') || ip="localhost"
    echo "${ip:-localhost}"
}

# Vérifier si un conteneur existe
container_exists() {
    podman container exists "$1" 2>/dev/null
}

# Vérifier si un conteneur est en cours d'exécution
container_running() {
    [[ "$(podman inspect -f '{{.State.Running}}' "$1" 2>/dev/null)" == "true" ]]
}

# Démarrer le backend
start_backend() {
    log "Démarrage du backend..."

    if ! container_exists cycliste-backend; then
        log_error "Le conteneur cycliste-backend n'existe pas"
        log_warn "Exécutez: ./scripts/rebuild-containers.sh"
        return 1
    fi

    if container_running cycliste-backend; then
        log_warn "Backend déjà en cours d'exécution"
        return 0
    fi

    if podman start cycliste-backend >/dev/null 2>&1; then
        log_success "Backend démarré"
        return 0
    else
        log_error "Impossible de démarrer le backend"
        return 1
    fi
}

# Attendre que le backend soit prêt
wait_for_backend() {
    log "Attente du backend..."
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf http://127.0.0.1:3333/health >/dev/null 2>&1; then
            log_success "Backend opérationnel"
            return 0
        fi
        printf "."
        sleep 1
        ((attempt++))
    done
    echo ""

    log_error "Le backend n'est pas accessible après ${max_attempts}s"
    log "Vérifiez les logs: ./scripts/logs.sh backend"
    return 1
}

# Démarrer le frontend
start_frontend() {
    log "Démarrage du frontend..."

    if ! container_exists cycliste-frontend; then
        log_error "Le conteneur cycliste-frontend n'existe pas"
        log_warn "Exécutez: ./scripts/rebuild-containers.sh"
        return 1
    fi

    if container_running cycliste-frontend; then
        log_warn "Frontend déjà en cours d'exécution"
        return 0
    fi

    if podman start cycliste-frontend >/dev/null 2>&1; then
        log_success "Frontend démarré"
        return 0
    else
        log_error "Impossible de démarrer le frontend"
        return 1
    fi
}

# Vérifier l'état des services
verify_services() {
    local backend_ok=false
    local frontend_ok=false

    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  État des services                                  │"
    echo "├─────────────────────────────────────────────────────┤"

    # Test backend (127.0.0.1 pour éviter problèmes IPv6)
    if curl -sf http://127.0.0.1:3333/health >/dev/null 2>&1; then
        echo -e "│  ${GREEN}●${NC} Backend:  http://localhost:3333              │"
        backend_ok=true
    else
        echo -e "│  ${RED}●${NC} Backend:  non accessible                      │"
    fi

    # Test frontend (127.0.0.1 pour éviter problèmes IPv6)
    if curl -sf http://127.0.0.1:8080 >/dev/null 2>&1; then
        echo -e "│  ${GREEN}●${NC} Frontend: http://localhost:8080              │"
        frontend_ok=true
    else
        echo -e "│  ${RED}●${NC} Frontend: non accessible                      │"
    fi

    echo "└─────────────────────────────────────────────────────┘"

    $backend_ok && $frontend_ok
}

# Afficher le résumé
show_summary() {
    local ip
    ip=$(detect_local_ip)

    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo -e "│  ${GREEN}✓ Application démarrée${NC}                             │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  URL locale:    http://localhost:8080               │"
    echo "│  URL réseau:    http://${ip}:8080               │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Arrêter:       ./scripts/stop.sh                   │"
    echo "│  Logs:          ./scripts/logs.sh                   │"
    echo "│  Status:        ./scripts/status.sh                 │"
    echo "└─────────────────────────────────────────────────────┘"
}

# Ouvrir le navigateur
open_browser() {
    local ip
    ip=$(detect_local_ip)
    local url="http://${ip}:8080"

    if [[ "${1:-}" == "--no-browser" ]]; then
        return 0
    fi

    sleep 1
    if command -v xdg-open &>/dev/null; then
        xdg-open "$url" &>/dev/null &
    elif command -v firefox &>/dev/null; then
        firefox "$url" &>/dev/null &
    fi
}

# Fonction principale
main() {
    local no_browser=false

    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --no-browser) no_browser=true; shift ;;
            -h|--help)
                echo "Usage: $0 [options]"
                echo "  --no-browser  Ne pas ouvrir le navigateur"
                echo "  -h, --help    Afficher cette aide"
                exit 0
                ;;
            *) shift ;;
        esac
    done

    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Centre d'Analyse Cycliste - Démarrage              ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    # Démarrer les services
    if ! start_backend; then
        exit 1
    fi

    if ! wait_for_backend; then
        exit 1
    fi

    if ! start_frontend; then
        exit 1
    fi

    sleep 2

    if verify_services; then
        show_summary
        if ! $no_browser; then
            open_browser
        fi
    else
        log_error "Un ou plusieurs services ne fonctionnent pas correctement"
        log "Vérifiez les logs: ./scripts/logs.sh"
        exit 1
    fi
}

main "$@"
