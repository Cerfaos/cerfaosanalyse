#!/usr/bin/env bash
# Script de sauvegarde automatique de la base de données et des uploads
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
MAX_BACKUPS=7  # Nombre de sauvegardes à conserver

# Format de date pour les fichiers
DATE_FORMAT="%Y-%m-%d_%H%M%S"
TODAY=$(date +"$DATE_FORMAT")

log() { printf "${BLUE}[%s]${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_success() { printf "${GREEN}[%s] ✓${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_warn() { printf "${YELLOW}[%s] ⚠${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }
log_error() { printf "${RED}[%s] ✗${NC} %s\n" "$(date '+%H:%M:%S')" "$*"; }

# Créer le répertoire de sauvegarde
ensure_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "Création du répertoire de sauvegarde..."
        mkdir -p "$BACKUP_DIR"
        log_success "Répertoire créé: $BACKUP_DIR"
    fi
}

# Sauvegarder la base de données SQLite
backup_database() {
    local backup_file="${BACKUP_DIR}/db_${TODAY}.sqlite3"
    local compressed_file="${backup_file}.gz"

    if [[ ! -f "$DB_FILE" ]]; then
        log_warn "Base de données non trouvée: $DB_FILE"
        return 1
    fi

    log "Sauvegarde de la base de données..."

    # Copier la base de données (utilise sqlite3 .backup pour une copie cohérente si disponible)
    if command -v sqlite3 &>/dev/null; then
        sqlite3 "$DB_FILE" ".backup '${backup_file}'"
    else
        cp "$DB_FILE" "$backup_file"
    fi

    # Compresser
    gzip -f "$backup_file"

    local size=$(du -h "$compressed_file" | cut -f1)
    log_success "Base de données sauvegardée: $compressed_file ($size)"
}

# Sauvegarder les uploads
backup_uploads() {
    local backup_file="${BACKUP_DIR}/uploads_${TODAY}.tar.gz"

    if [[ ! -d "$UPLOADS_DIR" ]] || [[ -z "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]]; then
        log_warn "Aucun fichier upload à sauvegarder"
        return 0
    fi

    log "Sauvegarde des uploads..."

    tar -czf "$backup_file" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"

    local size=$(du -h "$backup_file" | cut -f1)
    local count=$(find "$UPLOADS_DIR" -type f | wc -l)
    log_success "Uploads sauvegardés: $backup_file ($count fichiers, $size)"
}

# Créer une sauvegarde complète
backup_full() {
    local backup_file="${BACKUP_DIR}/full_backup_${TODAY}.tar.gz"

    log "Création d'une sauvegarde complète..."

    # Créer un répertoire temporaire
    local temp_dir=$(mktemp -d)
    local backup_name="cycliste_backup_${TODAY}"

    mkdir -p "${temp_dir}/${backup_name}"

    # Copier la base de données
    if [[ -f "$DB_FILE" ]]; then
        if command -v sqlite3 &>/dev/null; then
            sqlite3 "$DB_FILE" ".backup '${temp_dir}/${backup_name}/db.sqlite3'"
        else
            cp "$DB_FILE" "${temp_dir}/${backup_name}/db.sqlite3"
        fi
    fi

    # Copier les uploads
    if [[ -d "$UPLOADS_DIR" ]] && [[ -n "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]]; then
        cp -r "$UPLOADS_DIR" "${temp_dir}/${backup_name}/uploads"
    fi

    # Ajouter des métadonnées
    cat > "${temp_dir}/${backup_name}/backup_info.json" << EOF
{
    "version": "1.0.0",
    "date": "$(date -Iseconds)",
    "type": "full_backup",
    "hostname": "$(hostname)",
    "db_size": "$(du -h "$DB_FILE" 2>/dev/null | cut -f1 || echo 'N/A')",
    "uploads_count": $(find "$UPLOADS_DIR" -type f 2>/dev/null | wc -l || echo 0)
}
EOF

    # Créer l'archive
    tar -czf "$backup_file" -C "$temp_dir" "$backup_name"

    # Nettoyer
    rm -rf "$temp_dir"

    local size=$(du -h "$backup_file" | cut -f1)
    log_success "Sauvegarde complète créée: $backup_file ($size)"
}

# Rotation des sauvegardes (supprimer les anciennes)
rotate_backups() {
    log "Rotation des sauvegardes (conservation des $MAX_BACKUPS dernières)..."

    # Rotation des bases de données
    local db_backups=($(ls -t "${BACKUP_DIR}"/db_*.sqlite3.gz 2>/dev/null || true))
    if [[ ${#db_backups[@]} -gt $MAX_BACKUPS ]]; then
        for file in "${db_backups[@]:$MAX_BACKUPS}"; do
            rm -f "$file"
            log "Supprimé: $(basename "$file")"
        done
    fi

    # Rotation des uploads
    local upload_backups=($(ls -t "${BACKUP_DIR}"/uploads_*.tar.gz 2>/dev/null || true))
    if [[ ${#upload_backups[@]} -gt $MAX_BACKUPS ]]; then
        for file in "${upload_backups[@]:$MAX_BACKUPS}"; do
            rm -f "$file"
            log "Supprimé: $(basename "$file")"
        done
    fi

    # Rotation des sauvegardes complètes
    local full_backups=($(ls -t "${BACKUP_DIR}"/full_backup_*.tar.gz 2>/dev/null || true))
    if [[ ${#full_backups[@]} -gt $MAX_BACKUPS ]]; then
        for file in "${full_backups[@]:$MAX_BACKUPS}"; do
            rm -f "$file"
            log "Supprimé: $(basename "$file")"
        done
    fi

    log_success "Rotation terminée"
}

# Lister les sauvegardes disponibles
list_backups() {
    echo ""
    echo "╔═════════════════════════════════════════════════════╗"
    echo "║  Sauvegardes disponibles                            ║"
    echo "╚═════════════════════════════════════════════════════╝"
    echo ""

    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        echo "Aucune sauvegarde trouvée dans $BACKUP_DIR"
        return
    fi

    echo "┌─────────────────────────────────────────────────────┐"
    echo "│  Sauvegardes complètes                              │"
    echo "├─────────────────────────────────────────────────────┤"
    ls -lh "${BACKUP_DIR}"/full_backup_*.tar.gz 2>/dev/null | awk '{print "│  " $9 " (" $5 ")"}' | sed "s|${BACKUP_DIR}/||" || echo "│  Aucune"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Bases de données                                   │"
    echo "├─────────────────────────────────────────────────────┤"
    ls -lh "${BACKUP_DIR}"/db_*.sqlite3.gz 2>/dev/null | awk '{print "│  " $9 " (" $5 ")"}' | sed "s|${BACKUP_DIR}/||" || echo "│  Aucune"
    echo "├─────────────────────────────────────────────────────┤"
    echo "│  Uploads                                            │"
    echo "├─────────────────────────────────────────────────────┤"
    ls -lh "${BACKUP_DIR}"/uploads_*.tar.gz 2>/dev/null | awk '{print "│  " $9 " (" $5 ")"}' | sed "s|${BACKUP_DIR}/||" || echo "│  Aucune"
    echo "└─────────────────────────────────────────────────────┘"

    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    echo ""
    echo "Espace total utilisé: $total_size"
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [commande]"
    echo ""
    echo "Commandes:"
    echo "  db          Sauvegarder uniquement la base de données"
    echo "  uploads     Sauvegarder uniquement les uploads"
    echo "  full        Créer une sauvegarde complète (défaut)"
    echo "  list        Lister les sauvegardes disponibles"
    echo "  rotate      Supprimer les anciennes sauvegardes"
    echo "  all         Sauvegarder tout (db + uploads séparément)"
    echo "  -h, --help  Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0              # Sauvegarde complète"
    echo "  $0 db           # Sauvegarde base de données uniquement"
    echo "  $0 list         # Voir les sauvegardes"
    echo ""
}

# Fonction principale
main() {
    local command="${1:-full}"

    case "$command" in
        db)
            ensure_backup_dir
            backup_database
            rotate_backups
            ;;
        uploads)
            ensure_backup_dir
            backup_uploads
            rotate_backups
            ;;
        full)
            echo ""
            echo "╔═════════════════════════════════════════════════════╗"
            echo "║  Sauvegarde - Centre d'Analyse Cycliste             ║"
            echo "╚═════════════════════════════════════════════════════╝"
            echo ""
            ensure_backup_dir
            backup_full
            rotate_backups
            echo ""
            log_success "Sauvegarde terminée!"
            echo "Répertoire: $BACKUP_DIR"
            ;;
        all)
            echo ""
            echo "╔═════════════════════════════════════════════════════╗"
            echo "║  Sauvegarde complète - Centre d'Analyse Cycliste    ║"
            echo "╚═════════════════════════════════════════════════════╝"
            echo ""
            ensure_backup_dir
            backup_database
            backup_uploads
            rotate_backups
            echo ""
            log_success "Sauvegarde terminée!"
            ;;
        list)
            list_backups
            ;;
        rotate)
            ensure_backup_dir
            rotate_backups
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
