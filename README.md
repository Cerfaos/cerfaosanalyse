# 🚴 Centre d'Analyse Cycliste

Application web fullstack auto-hébergée pour analyser vos performances cyclistes et suivre votre poids.

## 📋 Caractéristiques

- **100% Local** : Données stockées localement, zéro cloud
- **Analyse avancée** : TRIMP, CTL/ATL/TSB, zones FC (Karvonen)
- **Import de fichiers** : FIT, GPX, CSV
- **Visualisations** : Graphiques interactifs (Recharts, Plotly.js)
- **Cartes GPS** : Traces colorées selon la fréquence cardiaque
- **Suivi physiologique** : Poids, FC max/repos
- **Gestion d'équipement** : Vélos, distances, maintenance

## 🏗️ Architecture

### Stack technique

- **Frontend** : React 18 + Vite + TypeScript + TailwindCSS
- **Backend** : AdonisJS 6 (API REST)
- **Base de données** : SQLite 3
- **Authentification** : JWT (Access Tokens)
- **Déploiement** : Docker + Docker Compose

### Structure

```
cerfaosanalyse/
├── backend/              # API AdonisJS
│   ├── app/
│   │   ├── controllers/ # Controllers HTTP
│   │   ├── models/      # Modèles Lucid ORM
│   │   └── services/    # Logique métier
│   ├── database/
│   │   └── migrations/  # Migrations SQL
│   └── start/
│       └── routes.ts    # Définition des routes
│
├── frontend/            # Application React
│   └── src/
│       ├── components/  # Composants réutilisables
│       ├── pages/       # Pages principales
│       ├── services/    # API calls
│       └── store/       # State management (Zustand)
│
└── docker-compose.yml   # Configuration Docker
```

## 🚀 Installation et démarrage

### Prérequis

- Node.js 20+
- Docker & Docker Compose (pour le déploiement)

### Mode développement

**Backend (AdonisJS)**

```bash
cd backend
npm install
cp .env.example .env
node ace migration:run
npm run dev
```

L'API démarre sur `http://localhost:3333`

**Frontend (React + Vite)**

```bash
cd frontend
npm install
npm run dev
```

L'interface démarre sur `http://localhost:5173`

### Mode production (Docker)

```bash
# Depuis la racine du projet
docker-compose up -d
```

- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:3333`

## 🗄️ Base de données

### Tables principales

- **users** : Utilisateurs avec paramètres physiologiques (FC max, FC repos, poids)
- **activities** : Activités cyclistes (date, durée, distance, FC, GPS, TRIMP)
- **weight_histories** : Historique du poids
- **equipment** : Équipement cycliste (vélos, distances, maintenance)

## 🔐 Authentification

L'API utilise JWT via Access Tokens. Routes disponibles :

**Publiques**
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

**Protégées** (nécessitent token Bearer)
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion

## 🧮 Métriques cyclistes

### Zones de fréquence cardiaque (Karvonen)

```
FC_reserve = FC_max - FC_repos

Zone 1 (Récupération) : FC_repos + (0.50 à 0.60) × FC_reserve
Zone 2 (Endurance)    : FC_repos + (0.60 à 0.70) × FC_reserve
Zone 3 (Tempo)        : FC_repos + (0.70 à 0.80) × FC_reserve
Zone 4 (Seuil)        : FC_repos + (0.80 à 0.90) × FC_reserve
Zone 5 (VO2 max)      : FC_repos + (0.90 à 1.00) × FC_reserve
```

### TRIMP (Training Impulse - Edwards)

```
TRIMP = durée (minutes) × FC_moyenne × coefficient_zone

Coefficients :
Zone 1 : 1.0
Zone 2 : 1.5
Zone 3 : 2.0
Zone 4 : 2.5
Zone 5 : 3.0
```

### CTL / ATL / TSB

```
CTL (Chronic Training Load) = charge chronique sur 42 jours
ATL (Acute Training Load)   = charge aiguë sur 7 jours
TSB (Training Stress Balance) = CTL - ATL

Interprétation TSB :
< -30    : Fatigue importante
-10/-30  : Fatigue optimale (pré-compétition)
-10/+5   : Zone neutre
> +25    : Désentraînement
```

## 🎨 Design System

Le projet utilise un design guide moderne et professionnel :

- **Couleur principale** : Bleu cycliste (#3B82F6)
- **Système d'espacement** : 8px grid (8, 16, 24, 32, 48, 64)
- **Typography** : 16px minimum, hiérarchie claire
- **Components** : Cards, Buttons, Forms selon les standards du design guide

## 📝 TODO - Prochaines étapes

### Phase 2 - Profil utilisateur
- [ ] Page de profil avec modification FC max/repos
- [ ] Calcul automatique des 5 zones FC
- [ ] Changement de thème (clair/sombre)

### Phase 3 - Suivi du poids
- [ ] Formulaire d'ajout de pesée
- [ ] Graphique d'évolution
- [ ] Statistiques (min, max, moyenne, évolution)

### Phase 4 - Import et analyse d'activités
- [ ] Upload FIT/GPX/CSV
- [ ] Parsing automatique
- [ ] Calcul TRIMP, zones FC, dérive cardiaque
- [ ] Liste paginée avec filtres

### Phase 5 - Visualisation activités
- [ ] Page détail avec graphiques (FC, vitesse, altitude)
- [ ] Carte GPS interactive (React Leaflet)
- [ ] Répartition zones FC

### Phase 6 - CTL/ATL/TSB
- [ ] Calcul quotidien
- [ ] Dashboard avec graphique multi-lignes
- [ ] Interprétation automatique

### Phase 7 - Gestion équipement
- [ ] CRUD vélos
- [ ] Association activités
- [ ] Alertes maintenance

### Phase 8 - Export et sauvegardes
- [ ] Export CSV/PDF
- [ ] Backups automatiques

## 🛠️ Développement

### Commandes utiles

**Backend**
```bash
node ace make:controller <name>    # Créer un controller
node ace make:model <name>         # Créer un modèle
node ace make:migration <name>     # Créer une migration
node ace migration:run             # Exécuter les migrations
node ace migration:rollback        # Rollback dernière migration
```

**Frontend**
```bash
npm run dev        # Démarrage dev avec HMR
npm run build      # Build de production
npm run preview    # Preview du build
```

## 📄 Licence

Projet personnel - Tous droits réservés

---

**Auteur** : Didier (Cerfaos)
**Date** : 2025-11-08
**Plateforme** : Fedora 43
