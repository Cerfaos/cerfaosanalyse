#!/usr/bin/env bash
# Script pour afficher les logs des conteneurs
set -euo pipefail

# Chemin explicite vers podman (évite les problèmes de PATH après redémarrage)
PODMAN="${PODMAN:-/usr/bin/podman}"
if [[ ! -x "$PODMAN" ]]; then
    PODMAN=$(command -v podman 2>/dev/null || echo "/usr/bin/podman")
fi

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo "Usage: $0 [service] [options]"
    echo ""
    echo "Services:"
    echo "  backend     Afficher les logs du backend"
    echo "  frontend    Afficher les logs du frontend"
    echo "  all         Afficher les logs des deux services (défaut)"
    echo ""
    echo "Options:"
    echo "  -f, --follow    Suivre les logs en temps réel"
    echo "  -n, --lines N   Nombre de lignes à afficher (défaut: 50)"
    echo "  --since TIME    Logs depuis (ex: 10m, 1h, 2023-01-01)"
    echo "  --errors        Afficher uniquement les erreurs"
    echo "  -h, --help      Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 backend -f         Suivre les logs backend"
    echo "  $0 frontend -n 100    100 dernières lignes frontend"
    echo "  $0 --since 30m        Logs des 30 dernières minutes"
    echo "  $0 backend --errors   Erreurs backend seulement"
}

# Variables par défaut
SERVICE="all"
FOLLOW=""
LINES="50"
SINCE=""
ERRORS_ONLY=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        backend|frontend|all)
            SERVICE="$1"
            shift
            ;;
        -f|--follow)
            FOLLOW="--follow"
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        --since)
            SINCE="--since=$2"
            shift 2
            ;;
        --errors)
            ERRORS_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Fonction pour afficher les logs d'un service
show_logs() {
    local container="$1"
    local name="$2"
    local color="$3"

    if ! $PODMAN container exists "$container" 2>/dev/null; then
        echo -e "${RED}Le conteneur $container n'existe pas${NC}"
        return 1
    fi

    echo ""
    echo -e "${color}════════════════════════════════════════════════════${NC}"
    echo -e "${color}  Logs: ${name}${NC}"
    echo -e "${color}════════════════════════════════════════════════════${NC}"
    echo ""

    if $ERRORS_ONLY; then
        $PODMAN logs --tail "$LINES" $SINCE $FOLLOW "$container" 2>&1 | grep -iE "(error|exception|fatal|failed|crash)" || echo "Aucune erreur trouvée"
    else
        $PODMAN logs --tail "$LINES" $SINCE $FOLLOW "$container" 2>&1
    fi
}

# Afficher les logs selon le service
case "$SERVICE" in
    backend)
        show_logs "cycliste-backend" "Backend (AdonisJS)" "${CYAN}"
        ;;
    frontend)
        show_logs "cycliste-frontend" "Frontend (Nginx)" "${GREEN}"
        ;;
    all)
        if [[ -n "$FOLLOW" ]]; then
            echo -e "${YELLOW}Mode suivi: utilisez Ctrl+C pour arrêter${NC}"
            echo -e "${YELLOW}Conseil: utilisez '$0 backend -f' ou '$0 frontend -f' pour suivre un seul service${NC}"
            echo ""
        fi
        show_logs "cycliste-backend" "Backend (AdonisJS)" "${CYAN}"
        if [[ -z "$FOLLOW" ]]; then
            show_logs "cycliste-frontend" "Frontend (Nginx)" "${GREEN}"
        fi
        ;;
esac
