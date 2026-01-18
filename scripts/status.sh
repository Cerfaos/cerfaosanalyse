#!/usr/bin/env bash
# Script pour afficher l'état complet des services
set -euo pipefail

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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

# Obtenir des infos sur un conteneur
get_container_info() {
    local container="$1"
    if container_exists "$container"; then
        podman inspect -f '{{.State.Status}} | Démarré: {{.State.StartedAt}}' "$container" 2>/dev/null | cut -c1-50
    else
        echo "n'existe pas"
    fi
}

# Afficher l'état d'un service
show_service_status() {
    local container="$1"
    local name="$2"
    local url="$3"
    local health_url="$4"

    echo -e "│  ${CYAN}${name}${NC}"

    if ! container_exists "$container"; then
        echo -e "│    État:     ${RED}● Non créé${NC}"
        echo "│    Action:   ./scripts/rebuild-containers.sh"
        return
    fi

    if container_running "$container"; then
        echo -e "│    État:     ${GREEN}● En cours d'exécution${NC}"

        # Test de santé (utilise 127.0.0.1 pour éviter problèmes IPv6)
        local test_url="${health_url//localhost/127.0.0.1}"
        if [[ -n "$test_url" ]] && curl -sf "$test_url" >/dev/null 2>&1; then
            echo -e "│    Santé:    ${GREEN}● OK${NC}"
        elif [[ -n "$health_url" ]]; then
            echo -e "│    Santé:    ${RED}● Non accessible${NC}"
        fi

        echo "│    URL:      $url"
    else
        echo -e "│    État:     ${YELLOW}● Arrêté${NC}"
        echo "│    Action:   ./scripts/start.sh"
    fi

    # Infos mémoire/CPU si en cours
    if container_running "$container"; then
        local stats
        stats=$(podman stats --no-stream --format "{{.MemUsage}} | CPU: {{.CPUPerc}}" "$container" 2>/dev/null | head -1)
        if [[ -n "$stats" ]]; then
            echo "│    Ressources: $stats"
        fi
    fi
}

# Afficher les volumes
show_volumes() {
    echo "│"
    echo -e "│  ${CYAN}Volumes${NC}"

    local db_file="${PROJECT_DIR}/backend/tmp/db.sqlite3"
    local uploads_dir="${PROJECT_DIR}/backend/public/uploads"

    if [[ -f "$db_file" ]]; then
        local db_size
        db_size=$(du -h "$db_file" 2>/dev/null | cut -f1)
        echo "│    Base SQLite:  $db_size ($db_file)"
    else
        echo -e "│    Base SQLite:  ${YELLOW}Non initialisée${NC}"
    fi

    if [[ -d "$uploads_dir" ]]; then
        local uploads_count
        uploads_count=$(find "$uploads_dir" -type f 2>/dev/null | wc -l)
        echo "│    Uploads:      $uploads_count fichiers"
    fi
}

# Afficher les URLs
show_urls() {
    local ip
    ip=$(detect_local_ip)

    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  URLs d'accès                                       │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Local:                                             │"
    echo "│    Frontend:  http://localhost:8080                 │"
    echo "│    API:       http://localhost:3333                 │"
    echo "│    Health:    http://localhost:3333/health          │"
    echo "│                                                     │"
    echo "│  Réseau:                                            │"
    echo "│    Frontend:  http://${ip}:8080                 │"
    echo "│    API:       http://${ip}:3333                 │"
    echo "└─────────────────────────────────────────────────────┘"
}

# Afficher les commandes disponibles
show_commands() {
    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  Commandes disponibles                              │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  ./scripts/start.sh             Démarrer            │"
    echo "│  ./scripts/stop.sh              Arrêter             │"
    echo "│  ./scripts/logs.sh              Voir les logs       │"
    echo "│  ./scripts/logs.sh backend -f   Suivre logs backend │"
    echo "│  ./scripts/rebuild-containers.sh  Reconstruire      │"
    echo "└─────────────────────────────────────────────────────┘"
}

# Fonction principale
main() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Centre d'Analyse Cycliste - État des services      ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  Services                                           │"
    echo "├─────────────────────────────────────────────────────┤"

    show_service_status "cycliste-backend" "Backend (AdonisJS)" "http://localhost:3333" "http://localhost:3333/health"
    echo "│"
    show_service_status "cycliste-frontend" "Frontend (React/Nginx)" "http://localhost:8080" "http://localhost:8080"

    show_volumes

    echo "└─────────────────────────────────────────────────────┘"

    show_urls
    show_commands
}

main "$@"
