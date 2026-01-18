#!/usr/bin/env bash
# Script d'installation du système de sauvegarde automatique
set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="${PROJECT_DIR}/scripts"
USER_SERVICE_DIR="$HOME/.config/systemd/user"

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_error() { printf "${RED}[%s] ✗${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

install_backup_service() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Installation du système de sauvegarde automatique  ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    # Vérifier que les scripts existent
    for script in backup.sh restore-db.sh; do
        if [[ ! -f "${SCRIPTS_DIR}/${script}" ]]; then
            log_error "Script manquant: ${script}"
            exit 1
        fi
    done
    log_success "Scripts de sauvegarde présents"

    # Rendre les scripts exécutables
    log "Configuration des permissions..."
    chmod +x "${SCRIPTS_DIR}/backup.sh"
    chmod +x "${SCRIPTS_DIR}/restore-db.sh"
    log_success "Scripts rendus exécutables"

    # Créer le répertoire de sauvegarde
    log "Création du répertoire de sauvegarde..."
    mkdir -p "${PROJECT_DIR}/backups"
    log_success "Répertoire créé: ${PROJECT_DIR}/backups"

    # Créer le répertoire des services utilisateur
    log "Création du répertoire systemd utilisateur..."
    mkdir -p "$USER_SERVICE_DIR"

    # Copier les fichiers service et timer
    log "Installation du service et du timer..."
    cp "${SCRIPTS_DIR}/cycliste-backup.service" "$USER_SERVICE_DIR/"
    cp "${SCRIPTS_DIR}/cycliste-backup.timer" "$USER_SERVICE_DIR/"
    log_success "Fichiers copiés"

    # Recharger systemd
    log "Rechargement de systemd..."
    systemctl --user daemon-reload
    log_success "Systemd rechargé"

    # Activer le timer
    log "Activation du timer de sauvegarde..."
    systemctl --user enable cycliste-backup.timer
    systemctl --user start cycliste-backup.timer
    log_success "Timer activé"

    # Activer le linger
    log "Activation du linger pour démarrage au boot..."
    loginctl enable-linger "$USER"
    log_success "Linger activé"

    # Effectuer une première sauvegarde
    echo ""
    read -p "Effectuer une sauvegarde maintenant ? [O/n]: " do_backup
    if [[ ! "$do_backup" =~ ^[nN]$ ]]; then
        log "Exécution de la première sauvegarde..."
        "${SCRIPTS_DIR}/backup.sh" full
    fi

    echo ""
    echo "┌─────────────────────────────────────────────────────┐"
    echo -e "│  ${GREEN}✓ Installation terminée${NC}                            │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Sauvegarde automatique tous les jours à 2h00      │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Commandes utiles:                                  │"
    echo "│    ./scripts/backup.sh          (sauvegarde manuelle) │"
    echo "│    ./scripts/backup.sh list     (voir les sauvegardes)│"
    echo "│    ./scripts/restore-db.sh      (restaurer)         │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Gestion du timer:                                  │"
    echo "│    systemctl --user status cycliste-backup.timer    │"
    echo "│    systemctl --user list-timers                     │"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Pour désinstaller:                                 │"
    echo "│    ./scripts/install-backup.sh uninstall            │"
    echo "└─────────────────────────────────────────────────────┘"
    echo ""
}

uninstall_backup_service() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Désinstallation du système de sauvegarde           ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    log "Arrêt du timer..."
    systemctl --user stop cycliste-backup.timer 2>/dev/null || true

    log "Désactivation du timer..."
    systemctl --user disable cycliste-backup.timer 2>/dev/null || true

    log "Suppression des fichiers service..."
    rm -f "$USER_SERVICE_DIR/cycliste-backup.service"
    rm -f "$USER_SERVICE_DIR/cycliste-backup.timer"

    log "Rechargement de systemd..."
    systemctl --user daemon-reload

    log_success "Système de sauvegarde désinstallé"
    echo ""
    log_warn "Les sauvegardes existantes dans ${PROJECT_DIR}/backups n'ont pas été supprimées"
    echo ""
}

show_status() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  État du système de sauvegarde                      ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    echo "Timer de sauvegarde:"
    echo "────────────────────"
    systemctl --user status cycliste-backup.timer 2>/dev/null || log_warn "Timer non installé"

    echo ""
    echo "Prochaines exécutions:"
    echo "──────────────────────"
    systemctl --user list-timers cycliste-backup.timer 2>/dev/null || true

    echo ""
    echo "Dernière sauvegarde:"
    echo "────────────────────"
    if [[ -d "${PROJECT_DIR}/backups" ]]; then
        local last_backup=$(ls -t "${PROJECT_DIR}/backups"/*.tar.gz 2>/dev/null | head -1)
        if [[ -n "$last_backup" ]]; then
            echo "  $(basename "$last_backup")"
            echo "  $(stat -c '%y' "$last_backup" | cut -d'.' -f1)"
        else
            echo "  Aucune sauvegarde"
        fi
    else
        echo "  Répertoire de sauvegarde non créé"
    fi

    echo ""
    "${SCRIPTS_DIR}/backup.sh" list 2>/dev/null || true
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [install|uninstall|status]"
    echo ""
    echo "Commandes:"
    echo "  install    Installer le système de sauvegarde automatique (défaut)"
    echo "  uninstall  Désinstaller le système de sauvegarde"
    echo "  status     Afficher l'état du système"
    echo ""
    echo "Scripts de sauvegarde:"
    echo "  ./scripts/backup.sh          Créer une sauvegarde"
    echo "  ./scripts/backup.sh list     Lister les sauvegardes"
    echo "  ./scripts/restore-db.sh      Restaurer une sauvegarde"
    echo ""
}

# Main
case "${1:-install}" in
    install)
        install_backup_service
        ;;
    uninstall)
        uninstall_backup_service
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
