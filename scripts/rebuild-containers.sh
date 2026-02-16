#!/usr/bin/env bash
# Script pour reconstruire et redémarrer les conteneurs après modifications
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
NC='\033[0m' # No Color

# Répertoire du projet (parent de scripts/)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env"

# Options (modifiées par argument parsing)
USE_NO_CACHE=false

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_error() { printf "${RED}[%s] ✗${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    local missing=()

    $PODMAN --version &>/dev/null || missing+=("podman")
    command -v curl &>/dev/null || missing+=("curl")

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Outils manquants: ${missing[*]}"
        exit 1
    fi
    log_success "Prérequis OK"
}

# Charger les variables d'environnement
load_env() {
    if [[ -f "$ENV_FILE" ]]; then
        log "Chargement de ${ENV_FILE}..."
        set -a
        source "$ENV_FILE"
        set +a
        log_success "Variables chargées depuis .env"
    else
        log_warn "Fichier .env non trouvé, utilisation des valeurs par défaut"
    fi

    # Valeurs par défaut (CORS est maintenant hardcodé dans le code backend)
    APP_KEY="${APP_KEY:-your-secret-app-key-change-in-production}"
    VITE_API_URL="${VITE_API_URL:-http://192.168.0.11:3333}"
    OPENWEATHERMAP_API_KEY="${OPENWEATHERMAP_API_KEY:-}"
    LOG_LEVEL="${LOG_LEVEL:-info}"
}

# Détecter l'IP locale
detect_local_ip() {
    local ip
    ip=$(hostname -I 2>/dev/null | awk '{print $1}') || ip="localhost"
    echo "${ip:-localhost}"
}

# Arrêter et supprimer les conteneurs existants
cleanup_containers() {
    log "Arrêt et suppression des conteneurs existants..."
    $PODMAN stop --timeout 5 cycliste-backend cycliste-frontend 2>/dev/null || true
    $PODMAN rm -f cycliste-backend cycliste-frontend 2>/dev/null || true
    log_success "Nettoyage terminé"
}

# Construire l'image backend
build_backend() {
    log "Construction de l'image backend..."
    cd "$PROJECT_DIR"

    local build_args=(-t cerfaosanalyse_backend:latest -f backend/Dockerfile)
    if $USE_NO_CACHE; then
        build_args+=(--no-cache)
    fi

    if $PODMAN build "${build_args[@]}" ./backend; then
        log_success "Image backend construite"
    else
        log_error "Échec de la construction du backend"
        exit 1
    fi
}

# Construire l'image frontend
build_frontend() {
    log "Construction de l'image frontend..."
    cd "$PROJECT_DIR"

    local build_args=(-t cerfaosanalyse_frontend:latest --build-arg "VITE_API_URL=${VITE_API_URL}" -f frontend/Dockerfile)
    if $USE_NO_CACHE; then
        build_args+=(--no-cache)
    fi

    if $PODMAN build "${build_args[@]}" ./frontend; then
        log_success "Image frontend construite"
    else
        log_error "Échec de la construction du frontend"
        exit 1
    fi
}

# Créer les répertoires nécessaires
ensure_directories() {
    log "Création des répertoires..."
    mkdir -p "${PROJECT_DIR}/backend/tmp"
    mkdir -p "${PROJECT_DIR}/backend/public/uploads"
    log_success "Répertoires prêts"
}

# Démarrer le backend
start_backend() {
    log "Démarrage du conteneur backend..."

    $PODMAN run -d --name cycliste-backend --replace \
        -p 3333:3333 \
        -v "${PROJECT_DIR}/backend/tmp:/app/build/tmp:Z" \
        -v "${PROJECT_DIR}/backend/public/uploads:/app/build/public/uploads:Z" \
        -e NODE_ENV=production \
        -e PORT=3333 \
        -e HOST=0.0.0.0 \
        -e TZ=Europe/Paris \
        -e "APP_KEY=${APP_KEY}" \
        -e "LOG_LEVEL=${LOG_LEVEL}" \
        -e DB_CONNECTION=sqlite \
        -e "OPENWEATHERMAP_API_KEY=${OPENWEATHERMAP_API_KEY}" \
        cerfaosanalyse_backend:latest

    log_success "Backend démarré"
}

# Attendre que le backend soit prêt
wait_for_backend() {
    log "Attente du backend..."
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf http://127.0.0.1:3333/health >/dev/null 2>&1; then
            log_success "Backend prêt après ${attempt}s"
            return 0
        fi
        sleep 1
        ((attempt++))
    done

    log_error "Le backend n'a pas démarré après ${max_attempts}s"
    log "Logs du backend:"
    $PODMAN logs --tail 50 cycliste-backend
    exit 1
}

# Démarrer le frontend
start_frontend() {
    log "Démarrage du conteneur frontend..."

    $PODMAN run -d --name cycliste-frontend --replace \
        -p 8080:80 \
        -v "${PROJECT_DIR}/frontend/public/icons:/usr/share/nginx/html/icons:Z" \
        cerfaosanalyse_frontend:latest

    log_success "Frontend démarré"
}

# Vérifier l'état des services
verify_services() {
    log "Vérification des services..."
    echo ""

    # Status des conteneurs
    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  État des conteneurs                                │"
    echo "├─────────────────────────────────────────────────────┤"
    $PODMAN ps --filter "name=cycliste" --format "│  {{.Names}}: {{.Status}}" | head -2
    echo "└─────────────────────────────────────────────────────┘"
    echo ""

    # Test backend
    if curl -sf http://127.0.0.1:3333/health >/dev/null; then
        log_success "Backend: http://localhost:3333"
    else
        log_error "Backend: non accessible"
    fi

    # Test frontend
    if curl -sf http://127.0.0.1:8080 >/dev/null; then
        log_success "Frontend: http://localhost:8080"
    else
        log_error "Frontend: non accessible"
    fi
}

# Afficher le résumé final
show_summary() {
    local ip
    ip=$(detect_local_ip)

    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo -e "│  ${GREEN}✓ Reconstruction terminée avec succès${NC}              │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Accès local:    http://localhost:8080              │"
    echo "│  Accès réseau:   http://${ip}:8080              │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  API Backend:    http://localhost:3333              │"
    echo "│  Health check:   http://localhost:3333/health       │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Commandes utiles:                                  │"
    echo "│    ./scripts/stop.sh      - Arrêter l'application   │"
    echo "│    ./scripts/start.sh     - Démarrer l'application  │"
    echo "│    ./scripts/logs.sh      - Voir les logs           │"
    echo "│    ./scripts/status.sh    - État des services       │"
    echo "└─────────────────────────────────────────────────────┘"
}

# Fonction principale
main() {
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --no-cache) USE_NO_CACHE=true; shift ;;
            -h|--help)
                echo "Usage: $0 [options]"
                echo "  --no-cache    Forcer la reconstruction complète sans cache"
                echo "  -h, --help    Afficher cette aide"
                exit 0
                ;;
            *) shift ;;
        esac
    done

    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Centre d'Analyse Cycliste - Reconstruction         ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    check_prerequisites
    load_env
    cleanup_containers
    ensure_directories
    build_backend
    build_frontend
    start_backend
    wait_for_backend
    start_frontend
    sleep 2
    verify_services
    show_summary
}

main "$@"
