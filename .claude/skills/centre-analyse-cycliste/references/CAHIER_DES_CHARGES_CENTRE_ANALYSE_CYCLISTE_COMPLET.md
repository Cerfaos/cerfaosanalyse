# 🧭 Cahier des Charges – Centre d’Analyse Cycliste (Version Web Moderne Fullstack)

## 📌 1. Présentation du projet

### Identité
- **Nom du projet** : Centre d’Analyse Cycliste
- **Type d’application** : Web App locale-first, auto-hébergée
- **Environnement** : Serveur Fedora 43 (hébergement local)
- **Accessibilité** : depuis le Mac, le PC Linux, et d’autres appareils du réseau local
- **Objectif** : analyser les performances cyclistes à partir de fichiers FIT/GPX/CSV, avec métriques cardiaques, TRIMP, CTL/ATL/TSB, et gestion du suivi physiologique.

---

## 🎯 2. Objectifs généraux

1. **Autonomie complète**
   - Application 100 % locale, sans dépendance cloud.
   - Données stockées dans SQLite (extensible vers PostgreSQL).
2. **Interface moderne et réactive**
   - React + TailwindCSS + ShadCN/UI.
   - Graphiques interactifs (Plotly/Recharts).
3. **Architecture modulaire et portable**
   - Séparation front/back + conteneurisation Docker.
4. **Accès réseau local et extensible**
   - Serveur Fedora, accessible sur IP locale.
5. **Confidentialité et sécurité**
   - Données personnelles locales + Authentification JWT.

---

## 🏗️ 3. Architecture technique

| Composant | Technologie |
|------------|--------------|
| **Frontend** | React 18 + Vite + TypeScript |
| **UI Design** | ShadCN/UI + TailwindCSS |
| **Graphiques** | Recharts / Plotly.js |
| **Cartographie** | React Leaflet |
| **State Management** | Zustand |
| **Backend** | AdonisJS 6 (TypeScript) |
| **Base de données** | SQLite 3 (Lucid ORM) |
| **Orchestration** | Docker + Docker Compose |
| **Hébergement** | Fedora 43 |
| **Proxy (optionnel)** | Caddy 2 (HTTPS local) |

---

## 💾 4. Fonctionnalités principales

| Module | Description |
|---------|--------------|
| **Importation** | Lecture et parsing FIT / GPX / CSV |
| **Analyse cardiaque** | Zones FC, dérive, efficience, seuils, TRIMP |
| **Suivi entraînement** | CTL / ATL / TSB avec graphiques |
| **Visualisation** | Graphiques interactifs et cartes GPS |
| **Profil utilisateur** | FC max, FC repos, poids, thème clair/sombre |
| **Gestion équipement** | Vélos, distances, maintenance |
| **Exportation** | CSV / HTML / PDF |
| **Sauvegarde** | Backups automatiques (DB + fichiers) |
| **Accès LAN** | Interface via IP locale |
| **Administration** | Authentification JWT |

---

## 🧩 5. Architecture du projet

```
centre-analyse-cycliste/
├── backend/
│   ├── app/
│   │   ├── Controllers/Http/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Validators/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── start/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🧠 10. Compétences nécessaires

### 🧱 Développement Web
- JavaScript ES6+, TypeScript  
- HTML5 / CSS3  
- Git / GitHub  
- Terminal Linux, npm, pnpm

### ⚙️ Backend (AdonisJS)
- Node.js  
- AdonisJS (Controllers, Middleware, IoC)  
- Lucid ORM (migrations, seeders, relations)  
- REST API (CRUD, pagination)  
- Authentification JWT  
- Validation des entrées  
- Tests unitaires (Japa)

### 💾 Base de données
- SQL (SQLite / PostgreSQL)  
- Conception relationnelle  
- Indexation et optimisation  
- Sauvegarde / restauration  

### 💻 Frontend (React)
- React 18 (Hooks, Components)  
- React Router, Zustand  
- Axios pour API calls  
- TailwindCSS + ShadCN/UI  
- Recharts / Plotly.js pour graphiques  
- React Leaflet pour cartes  
- Responsive design

### 🧮 Data et analyses
- TRIMP, CTL, ATL, TSB  
- Zones de fréquence cardiaque (Karvonen)  
- Parsing FIT / GPX / CSV  
- Corrélations météo / performance

### 🐳 Docker & DevOps
- Dockerfiles + Compose  
- Réseaux / volumes / images  
- Logs, déploiement, nettoyage  
- Reverse proxy (Caddy / Nginx)  
- Sauvegardes automatisées

### 🔒 Sécurité et système
- Firewall Fedora (`firewall-cmd`)  
- HTTPS (Caddy / Certbot)  
- Protection des clés API (.env)  
- Sauvegardes cryptées

---

**Auteur :** Didier (Cerfaos)  
**Date :** 2025-11-08  
**Version :** 1.0  
**Plateforme :** Fedora 43
