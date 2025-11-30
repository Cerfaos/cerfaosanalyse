# Scripts utilitaires - Centre d'Analyse Cycliste

Ce répertoire contient tous les scripts utilitaires pour gérer l'application.

## 🚀 Déploiement et gestion Docker/Podman

### `start-cerfaosanalyse.sh`
Lance l'application dans des terminaux Alacritty séparés (mode développement).
```bash
./scripts/start-cerfaosanalyse.sh
```

### `stop-cerfaosanalyse.sh`
Arrête l'application (ferme les processus sur les ports 3333, 5173 et 8080).
```bash
./scripts/stop-cerfaosanalyse.sh
```

### `rebuild-containers.sh`
Reconstruit et redémarre les conteneurs Docker/Podman backend et frontend.
Utilise les images locales et teste les endpoints de santé.
```bash
./scripts/rebuild-containers.sh
```

## 🔧 Développement

### `start-dev.sh`
Lance le serveur backend en mode développement avec hot-reload.
```bash
cd backend && ../scripts/start-dev.sh
```

### `kill-port-backend.sh`
Tue le processus qui utilise le port 3333 (backend).
```bash
./scripts/kill-port-backend.sh
```

### `kill-port-frontend.sh`
Tue le processus qui utilise le port 5173 (frontend Vite dev server).
```bash
./scripts/kill-port-frontend.sh
```

## 🧪 Tests et vérification

### `check-setup.sh`
Vérifie que l'environnement est correctement configuré :
- Présence de Node.js, npm
- Présence de Docker/Podman
- Variables d'environnement
- Fichiers de configuration

```bash
./scripts/check-setup.sh
```

### `check_users.js`
Script Node.js pour lister les utilisateurs de la base de données SQLite.
```bash
cd backend && node ../scripts/check_users.js
# ou
node scripts/check_users.js
```

### `test_date_logic.js`
Script de test pour vérifier la logique de gestion des dates et fuseaux horaires.
```bash
node scripts/test_date_logic.js
```

## 🗑️ Maintenance

### `reset-app.sh`
Réinitialise complètement l'application :
- Supprime node_modules
- Nettoie le cache npm
- Réinstalle les dépendances
- Reconstruit les images Docker

⚠️ **Attention** : Cette opération est destructive et prend du temps.

```bash
./scripts/reset-app.sh
```

## 📝 Notes

- La plupart des scripts doivent être exécutés depuis la racine du projet
- Les scripts shell (.sh) sont exécutables : `chmod +x scripts/*.sh`
- Les scripts JavaScript (.js) nécessitent Node.js installé
- Pour Docker, assurez-vous que les conteneurs sont arrêtés avant de rebuild
