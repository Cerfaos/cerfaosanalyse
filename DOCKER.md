# Guide Docker/Podman - Centre d'Analyse Cycliste

Ce guide explique comment utiliser l'application conteneurisée avec Podman.

## Prérequis

- Podman et podman-compose installés
- Les images Docker construites (voir section "Premier lancement")

## Premier lancement (une seule fois)

```bash
cd /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env si nécessaire (APP_KEY, CORS_ORIGIN, etc.)

# Construire les images
podman-compose build

# Démarrer les conteneurs
podman-compose up -d
```

## Utilisation quotidienne

### Démarrer l'application

```bash
cd /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse
podman-compose up -d
```

### Accéder à l'application

- **Depuis le PC Fedora** : http://localhost:8080
- **Depuis un autre appareil (Mac, téléphone...)** : http://192.168.0.11:8080

### Arrêter l'application

```bash
podman-compose down
```

## Commandes utiles

| Action | Commande |
|--------|----------|
| Démarrer | `podman-compose up -d` |
| Arrêter | `podman-compose down` |
| Redémarrer | `podman-compose restart` |
| Voir les logs (tous) | `podman-compose logs -f` |
| Logs backend | `podman logs cycliste-backend -f` |
| Logs frontend | `podman logs cycliste-frontend -f` |
| Statut des conteneurs | `podman ps` |
| Reconstruire les images | `podman-compose build` |
| Reconstruire et démarrer | `podman-compose build && podman-compose up -d` |
| Supprimer tout | `podman-compose down -v --rmi all` |

## Démarrage automatique au boot

Le démarrage automatique est configuré via systemd. Les services démarrent automatiquement quand tu te connectes.

### Commandes systemd

```bash
# Voir le statut des services
systemctl --user status container-cycliste-backend
systemctl --user status container-cycliste-frontend

# Démarrer manuellement
systemctl --user start container-cycliste-backend
systemctl --user start container-cycliste-frontend

# Arrêter
systemctl --user stop container-cycliste-backend
systemctl --user stop container-cycliste-frontend

# Désactiver le démarrage automatique
systemctl --user disable container-cycliste-backend container-cycliste-frontend

# Réactiver le démarrage automatique
systemctl --user enable container-cycliste-backend container-cycliste-frontend
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Navigateur                          │
│                  http://localhost:8080                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              cycliste-frontend (Nginx)                   │
│                    Port 8080:80                          │
│              Sert les fichiers React                     │
└─────────────────────┬───────────────────────────────────┘
                      │ API calls
┌─────────────────────▼───────────────────────────────────┐
│              cycliste-backend (Node.js)                  │
│                    Port 3333:3333                        │
│                   AdonisJS API                           │
│                                                          │
│  Volumes:                                                │
│  - ./backend/tmp:/app/build/tmp (SQLite DB)             │
│  - ./backend/uploads:/app/uploads (Fichiers)            │
└─────────────────────────────────────────────────────────┘
```

## Ports utilisés

| Service | Port hôte | Port conteneur |
|---------|-----------|----------------|
| Frontend (Nginx) | 8080 | 80 |
| Backend (Node.js) | 3333 | 3333 |

## Données persistantes

Les données sont stockées sur l'hôte dans :

- **Base de données SQLite** : `./backend/tmp/db.sqlite3`
- **Fichiers uploadés** : `./backend/uploads/`

Ces dossiers sont montés comme volumes, les données persistent même si les conteneurs sont supprimés.

## Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
podman-compose logs

# Vérifier si les ports sont libres
ss -tlnp | grep -E '3333|8080'

# Reconstruire les images
podman-compose build --no-cache
```

### Erreur de permission sur les volumes

```bash
# Vérifier les permissions
ls -la backend/tmp/
ls -la backend/uploads/

# Corriger si nécessaire
chmod 755 backend/tmp backend/uploads
```

### Erreur CORS

Vérifier que `CORS_ORIGIN` dans `.env` correspond à l'URL du frontend :

```env
CORS_ORIGIN=http://localhost:8080
```

Puis redémarrer :

```bash
podman-compose down && podman-compose up -d
```

### Base de données corrompue

```bash
# Sauvegarder l'ancienne base
mv backend/tmp/db.sqlite3 backend/tmp/db.sqlite3.bak

# Redémarrer (une nouvelle DB sera créée)
podman-compose restart cycliste-backend
```

### Nettoyer complètement

```bash
# Arrêter et supprimer tout
podman-compose down -v --rmi all

# Supprimer les images orphelines
podman image prune -a

# Reconstruire de zéro
podman-compose build --no-cache
podman-compose up -d
```

## Variables d'environnement

Fichier `.env` à la racine du projet :

```env
# Backend
APP_KEY=votre-clé-secrète-32-caractères
OPENWEATHERMAP_API_KEY=votre-clé-api

# CORS - URL du frontend
CORS_ORIGIN=http://localhost:8080

# Frontend - URL de l'API
VITE_API_URL=http://localhost:3333
```

## Mise à jour de l'application

### Après modification du code

| Modification | Commande |
|--------------|----------|
| **Frontend** (React, CSS, composants) | `podman-compose build frontend && podman-compose up -d` |
| **Backend** (API, routes, controllers) | `podman-compose build backend && podman-compose up -d` |
| **Les deux** | `podman-compose build && podman-compose up -d` |
| **Seulement `.env`** | `podman-compose down && podman-compose up -d` |
| **`.env` avec `VITE_API_URL`** | `podman-compose build frontend && podman-compose up -d` |

### Workflow typique après `git pull`

```bash
cd /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse

# Récupérer les modifications
git pull

# Reconstruire et redémarrer
podman-compose build && podman-compose up -d
```

### Pourquoi rebuild le frontend pour `VITE_API_URL` ?

Les variables `VITE_*` sont intégrées au code JavaScript au moment du build (pas au runtime). Si tu changes `VITE_API_URL`, tu dois reconstruire le frontend pour que le changement soit pris en compte.

## Sauvegardes

### Où sont stockées les données ?

Toutes les données (activités, utilisateurs, etc.) sont dans un seul fichier SQLite :

```
/home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse/backend/tmp/db.sqlite3
```

**Important** : Que tu utilises l'app depuis le PC Fedora ou depuis le Mac, les données sont toujours enregistrées dans ce fichier sur le serveur Fedora.

### Sauvegarder la base de données

```bash
cp backend/tmp/db.sqlite3 ~/backup/db-$(date +%Y%m%d).sqlite3
```

### Sauvegarder les fichiers uploadés

```bash
tar -czvf ~/backup/uploads-$(date +%Y%m%d).tar.gz backend/uploads/
```

### Script de sauvegarde automatique

Créer `~/backup-cycliste.sh` :

```bash
#!/bin/bash
BACKUP_DIR=~/backups/cycliste
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

cp /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse/backend/tmp/db.sqlite3 \
   $BACKUP_DIR/db-$DATE.sqlite3

tar -czvf $BACKUP_DIR/uploads-$DATE.tar.gz \
   -C /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse/backend uploads/

# Garder seulement les 7 dernières sauvegardes
ls -t $BACKUP_DIR/db-*.sqlite3 | tail -n +8 | xargs -r rm
ls -t $BACKUP_DIR/uploads-*.tar.gz | tail -n +8 | xargs -r rm

echo "Sauvegarde terminée : $DATE"
```

Rendre exécutable et programmer avec cron :

```bash
chmod +x ~/backup-cycliste.sh
crontab -e
# Ajouter : 0 2 * * * ~/backup-cycliste.sh
```

## Accès réseau (depuis un autre appareil)

Pour accéder à l'application depuis un autre appareil sur le même réseau (Mac, téléphone, tablette...).

### IP actuelle du serveur

```
192.168.0.11
```

### URLs d'accès

| Appareil | URL |
|----------|-----|
| PC Fedora (local) | http://localhost:8080 |
| Mac / autre appareil | http://192.168.0.11:8080 |

### Configuration requise

Le fichier `.env` doit contenir l'IP du serveur pour que l'API fonctionne depuis d'autres appareils :

```env
# CORS - Accepter localhost ET l'IP locale
CORS_ORIGIN=http://localhost:8080,http://192.168.0.11:8080

# Frontend - URL de l'API (utiliser l'IP pour accès réseau)
VITE_API_URL=http://192.168.0.11:3333
```

### Si l'IP change

L'IP peut changer après un redémarrage du routeur ou du PC. Pour mettre à jour :

1. **Trouver la nouvelle IP** :
   ```bash
   hostname -I | awk '{print $1}'
   ```

2. **Modifier `.env`** avec la nouvelle IP :
   ```bash
   nano /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse/.env
   ```

3. **Reconstruire le frontend** (car `VITE_API_URL` est intégré au build) :
   ```bash
   cd /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse
   podman-compose build frontend
   podman-compose up -d
   ```

### IP fixe (optionnel)

Pour éviter que l'IP change, tu peux configurer une IP fixe :

1. **Via NetworkManager** (Fedora) :
   ```bash
   nmcli con mod "Connexion filaire 1" ipv4.addresses 192.168.0.11/24
   nmcli con mod "Connexion filaire 1" ipv4.gateway 192.168.0.1
   nmcli con mod "Connexion filaire 1" ipv4.dns "8.8.8.8,8.8.4.4"
   nmcli con mod "Connexion filaire 1" ipv4.method manual
   nmcli con up "Connexion filaire 1"
   ```

2. **Ou via la box/routeur** : Réserver l'IP dans les paramètres DHCP de ta box.

### Ouvrir le pare-feu (Fedora)

Si tu ne peux pas accéder depuis un autre appareil, le pare-feu bloque probablement les connexions :

```bash
# Ouvrir les ports 8080 et 3333
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --add-port=3333/tcp --permanent
sudo firewall-cmd --reload

# Vérifier que les ports sont ouverts
sudo firewall-cmd --list-ports
```
