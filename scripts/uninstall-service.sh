#!/usr/bin/env bash
# Script de désinstallation du service systemd
exec "$(dirname "${BASH_SOURCE[0]}")/install-service.sh" uninstall
