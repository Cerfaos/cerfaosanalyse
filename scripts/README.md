# Scripts utilitaires - Centre d'Analyse Cycliste

Ce répertoire contient les scripts essentiels pour gérer l'application en production avec Docker/Podman.

## 🐳 Scripts Docker/Podman

### `rebuild-containers.sh`
Reconstruit et redémarre les conteneurs Docker/Podman backend et frontend.
Utilise les images locales, rebuild les images, et teste les endpoints de santé.

**Usage :**
```bash
./scripts/rebuild-containers.sh
```

**Ce que fait ce script :**
1. Arrête les conteneurs backend et frontend
2. Reconstruit l'image backend avec les dernières modifications
3. Reconstruit l'image frontend avec la bonne URL API
4. Démarre les nouveaux conteneurs
5. Vérifie que les endpoints de santé répondent

### `stop-cerfaosanalyse.sh`
Arrête l'application en tuant tous les processus qui utilisent les ports de l'application (backend, frontend dev, frontend Docker).

**Usage :**
```bash
./scripts/stop-cerfaosanalyse.sh
```

**Ports nettoyés :**
- Port 3333 (Backend API)
- Port 5173 (Frontend Vite dev server)
- Port 8080 (Frontend Docker/Nginx)

**Processus arrêtés :**
- `node ace serve` (Backend AdonisJS)
- `vite` (Frontend Vite)

## 🔧 Scripts utilitaires

### `check_users.js`
Script Node.js pour lister les utilisateurs de la base de données SQLite.
Utile pour débugger les problèmes de connexion.

**Usage :**
```bash
node scripts/check_users.js
```

**Sortie :**
```
Users found: 2
ID: 1, Email: cerfaos@gmail.com, Password Hash: $scrypt$n=16384,r=8...
ID: 2, Email: test@example.com, Password Hash: $scrypt$n=16384,r=8...
```

## 📝 Commandes Docker/Podman courantes

### Démarrer l'application
```bash
podman start cycliste-backend cycliste-frontend
```

### Arrêter l'application
```bash
podman stop cycliste-backend cycliste-frontend
# ou
./scripts/stop-cerfaosanalyse.sh
```

### Voir les logs
```bash
# Logs du backend
podman logs cycliste-backend --tail 50

# Logs du frontend
podman logs cycliste-frontend --tail 50

# Logs en temps réel
podman logs -f cycliste-backend
```

### Rebuild après modifications du code
```bash
./scripts/rebuild-containers.sh
```

### Vérifier l'état des conteneurs
```bash
podman ps
```

### Accéder à la base de données
```bash
# Via le conteneur
podman exec cycliste-backend sh -c "cd /app/build && node -e \"
const Database = require('better-sqlite3');
const db = new Database('tmp/db.sqlite3');
const users = db.prepare('SELECT * FROM users').all();
console.log(users);
\""

# Ou via le script utilitaire
node scripts/check_users.js
```

## 🗑️ Scripts supprimés

Les scripts suivants ont été supprimés car obsolètes (remplacés par Docker/Podman) :
- ~~`check-setup.sh`~~ - Vérification de l'environnement (obsolète pour Docker)
- ~~`kill-port-backend.sh`~~ - Intégré dans `stop-cerfaosanalyse.sh`
- ~~`kill-port-frontend.sh`~~ - Intégré dans `stop-cerfaosanalyse.sh`
- ~~`reset-app.sh`~~ - Réinitialisation mode dev local (non applicable à Docker)
- ~~`start-cerfaosanalyse.sh`~~ - Lance en mode dev Alacritty (remplacé par `podman start`)
- ~~`start-dev.sh`~~ - Lance backend en mode dev (remplacé par Docker)
- ~~`test_date_logic.js`~~ - Fichier vide inutile

## 📚 Documentation supplémentaire

Pour plus d'informations sur le déploiement Docker/Podman, consultez **DOCKER.md** à la racine du projet.
