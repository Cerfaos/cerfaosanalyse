# Scripts - Centre d'Analyse Cycliste

## Commandes principales

```bash
# Démarrer l'application
./scripts/start.sh

# Arrêter l'application
./scripts/stop.sh

# Reconstruire après modifications du code
./scripts/rebuild-containers.sh
```

## Scripts

| Script | Description |
|--------|-------------|
| `start.sh` | Démarre les conteneurs backend et frontend |
| `stop.sh` | Arrête les conteneurs |
| `rebuild-containers.sh` | Reconstruit les images et redémarre |
| `check_users.js` | Debug: liste les utilisateurs en base |

## URLs

- **Application** : http://192.168.0.11:8080
- **API Backend** : http://localhost:3333

## Logs

```bash
podman logs cycliste-backend --tail 50
podman logs cycliste-frontend --tail 50
podman logs -f cycliste-backend  # temps réel
```
