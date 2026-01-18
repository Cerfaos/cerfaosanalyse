#!/usr/bin/env bash
# Script de restauration de la base de données et des uploads
set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
DB_FILE="${PROJECT_DIR}/backend/tmp/db.sqlite3"
UPLOADS_DIR="${PROJECT_DIR}/backend/public/uploads"

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_error() { printf "${RED}[%s] ✗${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

# Lister les sauvegardes disponibles
list_backups() {
    local type="${1:-all}"

    echo ""
    echo "Sauvegardes disponibles:"
    echo ""

    case "$type" in
        db)
            ls -1t "${BACKUP_DIR}"/db_*.sqlite3.gz 2>/dev/null | head -10 | nl -w2 -s") " | sed "s|${BACKUP_DIR}/||"
            ;;
        uploads)
            ls -1t "${BACKUP_DIR}"/uploads_*.tar.gz 2>/dev/null | head -10 | nl -w2 -s") " | sed "s|${BACKUP_DIR}/||"
            ;;
        full)
            ls -1t "${BACKUP_DIR}"/full_backup_*.tar.gz 2>/dev/null | head -10 | nl -w2 -s") " | sed "s|${BACKUP_DIR}/||"
            ;;
        *)
            echo "Sauvegardes complètes:"
            ls -1t "${BACKUP_DIR}"/full_backup_*.tar.gz 2>/dev/null | head -5 | nl -w2 -s") " | sed "s|${BACKUP_DIR}/||" || echo "  Aucune"
            echo ""
            echo "Bases de données:"
            ls -1t "${BACKUP_DIR}"/db_*.sqlite3.gz 2>/dev/null | head -5 | nl -w2 -s") " | sed "s|${BACKUP_DIR}/||" || echo "  Aucune"
            echo ""
            echo "Uploads:"
            ls -1t "${BACKUP_DIR}"/uploads_*.tar.gz 2>/dev/null | head -5 | nl -w2 -s") " | sed "s|${BACKUP_DIR}/||" || echo "  Aucune"
            ;;
    esac
}

# Restaurer la base de données
restore_database() {
    local backup_file="$1"

    # Vérifier que le fichier existe
    if [[ ! -f "$backup_file" ]]; then
        # Essayer avec le chemin complet
        backup_file="${BACKUP_DIR}/${backup_file}"
        if [[ ! -f "$backup_file" ]]; then
            log_error "Fichier de sauvegarde non trouvé: $backup_file"
            return 1
        fi
    fi

    log "Restauration de la base de données depuis: $(basename "$backup_file")"

    # Arrêter le backend si nécessaire
    if podman ps --format "{{.Names}}" | grep -q "cycliste-backend"; then
        log "Arrêt du backend..."
        podman stop cycliste-backend >/dev/null 2>&1 || true
    fi

    # Sauvegarder la base actuelle avant restauration
    if [[ -f "$DB_FILE" ]]; then
        local backup_current="${DB_FILE}.before_restore.$(date +%Y%m%d_%H%M%S)"
        cp "$DB_FILE" "$backup_current"
        log "Base actuelle sauvegardée: $backup_current"
    fi

    # Décompresser et restaurer
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$DB_FILE"
    else
        cp "$backup_file" "$DB_FILE"
    fi

    log_success "Base de données restaurée"

    # Redémarrer le backend
    if podman ps -a --format "{{.Names}}" | grep -q "cycliste-backend"; then
        log "Redémarrage du backend..."
        podman start cycliste-backend >/dev/null 2>&1 || true
        sleep 2
    fi

    log_success "Restauration terminée!"
}

# Restaurer les uploads
restore_uploads() {
    local backup_file="$1"

    # Vérifier que le fichier existe
    if [[ ! -f "$backup_file" ]]; then
        backup_file="${BACKUP_DIR}/${backup_file}"
        if [[ ! -f "$backup_file" ]]; then
            log_error "Fichier de sauvegarde non trouvé: $backup_file"
            return 1
        fi
    fi

    log "Restauration des uploads depuis: $(basename "$backup_file")"

    # Sauvegarder les uploads actuels
    if [[ -d "$UPLOADS_DIR" ]] && [[ -n "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]]; then
        local backup_current="${UPLOADS_DIR}.before_restore.$(date +%Y%m%d_%H%M%S)"
        mv "$UPLOADS_DIR" "$backup_current"
        log "Uploads actuels sauvegardés: $backup_current"
    fi

    # Créer le répertoire et extraire
    mkdir -p "$(dirname "$UPLOADS_DIR")"
    tar -xzf "$backup_file" -C "$(dirname "$UPLOADS_DIR")"

    log_success "Uploads restaurés"
}

# Restaurer une sauvegarde complète
restore_full() {
    local backup_file="$1"

    # Vérifier que le fichier existe
    if [[ ! -f "$backup_file" ]]; then
        backup_file="${BACKUP_DIR}/${backup_file}"
        if [[ ! -f "$backup_file" ]]; then
            log_error "Fichier de sauvegarde non trouvé: $backup_file"
            return 1
        fi
    fi

    log "Restauration complète depuis: $(basename "$backup_file")"

    # Arrêter le backend
    if podman ps --format "{{.Names}}" | grep -q "cycliste-backend"; then
        log "Arrêt du backend..."
        podman stop cycliste-backend >/dev/null 2>&1 || true
    fi

    # Extraire dans un répertoire temporaire
    local temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir"

    # Trouver le répertoire extrait
    local extracted_dir=$(find "$temp_dir" -maxdepth 1 -type d -name "cycliste_backup_*" | head -1)
    if [[ -z "$extracted_dir" ]]; then
        extracted_dir="$temp_dir"
    fi

    # Sauvegarder les données actuelles
    local backup_suffix="before_restore.$(date +%Y%m%d_%H%M%S)"

    if [[ -f "$DB_FILE" ]]; then
        cp "$DB_FILE" "${DB_FILE}.${backup_suffix}"
        log "Base actuelle sauvegardée"
    fi

    if [[ -d "$UPLOADS_DIR" ]] && [[ -n "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]]; then
        mv "$UPLOADS_DIR" "${UPLOADS_DIR}.${backup_suffix}"
        log "Uploads actuels sauvegardés"
    fi

    # Restaurer la base de données
    if [[ -f "${extracted_dir}/db.sqlite3" ]]; then
        cp "${extracted_dir}/db.sqlite3" "$DB_FILE"
        log_success "Base de données restaurée"
    fi

    # Restaurer les uploads
    if [[ -d "${extracted_dir}/uploads" ]]; then
        mkdir -p "$UPLOADS_DIR"
        cp -r "${extracted_dir}/uploads"/* "$UPLOADS_DIR/" 2>/dev/null || true
        log_success "Uploads restaurés"
    fi

    # Afficher les infos de la sauvegarde
    if [[ -f "${extracted_dir}/backup_info.json" ]]; then
        echo ""
        echo "Informations de la sauvegarde:"
        cat "${extracted_dir}/backup_info.json"
        echo ""
    fi

    # Nettoyer
    rm -rf "$temp_dir"

    # Redémarrer le backend
    if podman ps -a --format "{{.Names}}" | grep -q "cycliste-backend"; then
        log "Redémarrage du backend..."
        podman start cycliste-backend >/dev/null 2>&1 || true
        sleep 2
    fi

    log_success "Restauration complète terminée!"
}

# Mode interactif
interactive_restore() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Restauration - Centre d'Analyse Cycliste           ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        log_error "Aucune sauvegarde trouvée dans $BACKUP_DIR"
        exit 1
    fi

    echo "Que voulez-vous restaurer ?"
    echo ""
    echo "  1) Sauvegarde complète"
    echo "  2) Base de données uniquement"
    echo "  3) Uploads uniquement"
    echo "  4) Annuler"
    echo ""
    read -p "Choix [1-4]: " choice

    case "$choice" in
        1)
            echo ""
            list_backups full
            echo ""
            read -p "Numéro de la sauvegarde à restaurer: " num
            local file=$(ls -1t "${BACKUP_DIR}"/full_backup_*.tar.gz 2>/dev/null | sed -n "${num}p")
            if [[ -n "$file" ]]; then
                echo ""
                log_warn "ATTENTION: Cette opération va remplacer vos données actuelles!"
                read -p "Continuer ? [o/N]: " confirm
                if [[ "$confirm" =~ ^[oOyY]$ ]]; then
                    restore_full "$file"
                else
                    log "Restauration annulée"
                fi
            else
                log_error "Sélection invalide"
            fi
            ;;
        2)
            echo ""
            list_backups db
            echo ""
            read -p "Numéro de la sauvegarde à restaurer: " num
            local file=$(ls -1t "${BACKUP_DIR}"/db_*.sqlite3.gz 2>/dev/null | sed -n "${num}p")
            if [[ -n "$file" ]]; then
                echo ""
                log_warn "ATTENTION: Cette opération va remplacer votre base de données!"
                read -p "Continuer ? [o/N]: " confirm
                if [[ "$confirm" =~ ^[oOyY]$ ]]; then
                    restore_database "$file"
                else
                    log "Restauration annulée"
                fi
            else
                log_error "Sélection invalide"
            fi
            ;;
        3)
            echo ""
            list_backups uploads
            echo ""
            read -p "Numéro de la sauvegarde à restaurer: " num
            local file=$(ls -1t "${BACKUP_DIR}"/uploads_*.tar.gz 2>/dev/null | sed -n "${num}p")
            if [[ -n "$file" ]]; then
                echo ""
                log_warn "ATTENTION: Cette opération va remplacer vos uploads!"
                read -p "Continuer ? [o/N]: " confirm
                if [[ "$confirm" =~ ^[oOyY]$ ]]; then
                    restore_uploads "$file"
                else
                    log "Restauration annulée"
                fi
            else
                log_error "Sélection invalide"
            fi
            ;;
        4|*)
            log "Restauration annulée"
            ;;
    esac
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [commande] [fichier]"
    echo ""
    echo "Commandes:"
    echo "  (sans argument)    Mode interactif"
    echo "  db <fichier>       Restaurer une base de données"
    echo "  uploads <fichier>  Restaurer les uploads"
    echo "  full <fichier>     Restaurer une sauvegarde complète"
    echo "  list               Lister les sauvegardes disponibles"
    echo "  -h, --help         Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                              # Mode interactif"
    echo "  $0 db db_2024-01-15_120000.sqlite3.gz"
    echo "  $0 full full_backup_2024-01-15_120000.tar.gz"
    echo ""
}

# Fonction principale
main() {
    local command="${1:-}"
    local file="${2:-}"

    case "$command" in
        "")
            interactive_restore
            ;;
        db)
            if [[ -z "$file" ]]; then
                log_error "Fichier de sauvegarde requis"
                show_help
                exit 1
            fi
            restore_database "$file"
            ;;
        uploads)
            if [[ -z "$file" ]]; then
                log_error "Fichier de sauvegarde requis"
                show_help
                exit 1
            fi
            restore_uploads "$file"
            ;;
        full)
            if [[ -z "$file" ]]; then
                log_error "Fichier de sauvegarde requis"
                show_help
                exit 1
            fi
            restore_full "$file"
            ;;
        list)
            list_backups
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            log_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
