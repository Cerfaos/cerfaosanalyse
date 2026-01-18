#!/usr/bin/env bash
# Script d'installation du service systemd pour démarrage automatique
set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_FILE="${PROJECT_DIR}/scripts/cycliste-app.service"
USER_SERVICE_DIR="$HOME/.config/systemd/user"

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_error() { printf "${RED}[%s] ✗${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

install_service() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Installation du service de démarrage automatique   ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    # Vérifier que les images existent
    log "Vérification des images Docker..."
    if ! podman images | grep -q cerfaosanalyse_backend; then
        log_error "Image backend non trouvée. Exécutez d'abord: ./scripts/rebuild-containers.sh"
        exit 1
    fi
    if ! podman images | grep -q cerfaosanalyse_frontend; then
        log_error "Image frontend non trouvée. Exécutez d'abord: ./scripts/rebuild-containers.sh"
        exit 1
    fi
    log_success "Images Docker présentes"

    # Créer le répertoire des services utilisateur
    log "Création du répertoire systemd utilisateur..."
    mkdir -p "$USER_SERVICE_DIR"
    log_success "Répertoire créé: $USER_SERVICE_DIR"

    # Copier le fichier service
    log "Installation du service..."
    cp "$SERVICE_FILE" "$USER_SERVICE_DIR/cycliste-app.service"
    log_success "Service copié"

    # Recharger systemd
    log "Rechargement de systemd..."
    systemctl --user daemon-reload
    log_success "Systemd rechargé"

    # Activer le service
    log "Activation du service au démarrage..."
    systemctl --user enable cycliste-app.service
    log_success "Service activé"

    # Activer le linger pour que les services utilisateur démarrent au boot
    log "Activation du linger pour démarrage au boot..."
    loginctl enable-linger "$USER"
    log_success "Linger activé"

    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo -e "│  ${GREEN}✓ Installation terminée${NC}                            │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  L'application démarrera automatiquement au boot    │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Commandes de gestion du service:                   │"
    echo "│    systemctl --user start cycliste-app   (démarrer) │"
    echo "│    systemctl --user stop cycliste-app    (arrêter)  │"
    echo "│    systemctl --user status cycliste-app  (état)     │"
    echo "│    systemctl --user restart cycliste-app (relancer) │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Pour désinstaller:                                 │"
    echo "│    ./scripts/uninstall-service.sh                   │"
    echo "└─────────────────────────────────────────────────────┘"
    echo ""
}

uninstall_service() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Désinstallation du service                         ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    log "Arrêt du service..."
    systemctl --user stop cycliste-app.service 2>/dev/null || true

    log "Désactivation du service..."
    systemctl --user disable cycliste-app.service 2>/dev/null || true

    log "Suppression du fichier service..."
    rm -f "$USER_SERVICE_DIR/cycliste-app.service"

    log "Rechargement de systemd..."
    systemctl --user daemon-reload

    log_success "Service désinstallé"
    echo ""
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [install|uninstall|status]"
    echo ""
    echo "Commandes:"
    echo "  install    Installer le service de démarrage automatique"
    echo "  uninstall  Désinstaller le service"
    echo "  status     Afficher l'état du service"
    echo ""
}

# Afficher le status
show_status() {
    echo ""
    echo "État du service cycliste-app:"
    echo ""
    systemctl --user status cycliste-app.service 2>/dev/null || log_warn "Service non installé"
}

# Main
case "${1:-install}" in
    install)
        install_service
        ;;
    uninstall)
        uninstall_service
        ;;
    status)
        show_status
        ;;
    -h|--help|help)
        show_help
        ;;
    *)
        log_error "Commande inconnue: $1"
        show_help
        exit 1
        ;;
esac
