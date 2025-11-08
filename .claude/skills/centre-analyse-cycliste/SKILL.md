---
name: centre-analyse-cycliste
description: Spécifications complètes et architecture technique pour développer un Centre d'Analyse Cycliste. Utiliser cette compétence lorsque l'utilisateur travaille sur ce projet spécifique, demande de l'aide pour développer l'application web de suivi cycliste, pose des questions sur l'architecture (React + AdonisJS + SQLite), les fonctionnalités (analyse cardiaque, TRIMP, CTL/ATL/TSB), l'hébergement sur Fedora, ou toute tâche liée au développement de cette application fullstack.
---

# Centre d'Analyse Cycliste - Skill

## Vue d'ensemble

Cette skill fournit les spécifications complètes et l'architecture technique du projet Centre d'Analyse Cycliste, une application web fullstack auto-hébergée pour l'analyse des performances cyclistes.

## Documentation de référence

Le cahier des charges complet est disponible dans :
- **references/CAHIER_DES_CHARGES_CENTRE_ANALYSE_CYCLISTE_COMPLET.md**

Lire ce document pour obtenir :
- Architecture technique complète (React + Vite + TypeScript, AdonisJS 6, SQLite)
- Stack technologique détaillée (ShadCN/UI, TailwindCSS, Docker, etc.)
- Fonctionnalités principales (importation FIT/GPX/CSV, zones FC, TRIMP, CTL/ATL/TSB)
- Structure du projet et organisation des dossiers
- Compétences techniques nécessaires pour chaque composant
- Spécifications de déploiement (Fedora 43, accès LAN)

## Quand utiliser cette skill

Utiliser le cahier des charges de référence lorsque l'utilisateur :
- Demande de l'aide pour structurer ou organiser le projet
- A besoin de clarifications sur l'architecture ou les choix techniques
- Pose des questions sur les fonctionnalités à implémenter
- Cherche à comprendre les dépendances et intégrations
- Veut des conseils sur les migrations de base de données ou les modèles
- Demande des exemples de code conformes à l'architecture choisie
- A besoin d'aide pour le déploiement Docker ou la configuration Fedora
- Souhaite connaître les compétences nécessaires pour développer chaque module

## Principes de développement

Lors de l'aide au développement de ce projet :

1. **Respecter l'architecture** : React frontend + AdonisJS backend + SQLite
2. **Utiliser les technologies spécifiées** : TailwindCSS, ShadCN/UI, Recharts/Plotly, React Leaflet
3. **Suivre la structure des dossiers** définie dans le cahier des charges
4. **Privilégier la modularité** pour faciliter la maintenance
5. **Assurer l'auto-hébergement** : pas de dépendances cloud
6. **Garantir la confidentialité** : données locales uniquement

## Structure du projet

```
centre-analyse-cycliste/
├── backend/         # AdonisJS 6 (TypeScript)
│   ├── app/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Validators/
│   └── database/
│       ├── migrations/
│       └── seeders/
├── frontend/        # React 18 + Vite + TypeScript
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
└── docker-compose.yml
```

## Fonctionnalités clés

- Importation et parsing de fichiers FIT/GPX/CSV
- Analyse cardiaque (zones FC, TRIMP, dérive, efficience)
- Suivi d'entraînement (CTL/ATL/TSB)
- Visualisations interactives (graphiques + cartes GPS)
- Gestion d'équipement et profil utilisateur
- Exportation de données et sauvegardes automatiques
- Authentification JWT et accès réseau local

## Notes importantes

- **Environnement cible** : Fedora 43
- **Base de données** : SQLite 3 (extensible vers PostgreSQL)
- **Orchestration** : Docker + Docker Compose
- **Accès** : Réseau local (IP locale)
- **Confidentialité** : 100% locale, zéro cloud
