# 🚀 Guide de démarrage - Centre d'Analyse Cycliste

## ✅ Phase 1 complétée !

Félicitations ! L'infrastructure de base de votre application est maintenant en place.

## 📦 Ce qui a été créé

### Backend (AdonisJS 6)
- ✅ API REST avec authentification JWT
- ✅ Base de données SQLite avec 4 tables :
  - `users` (avec FC max, FC repos, poids, thème)
  - `activities` (sorties cyclistes avec GPS, FC, TRIMP)
  - `weight_histories` (historique du poids)
  - `equipment` (vélos et équipement)
- ✅ Modèles Lucid avec relations
- ✅ AuthController (register, login, logout, me)
- ✅ Routes API configurées

### Frontend (React + Vite)
- ✅ Interface moderne avec TailwindCSS
- ✅ Design system professionnel (bleu cycliste #3B82F6)
- ✅ Navigation complète (Navbar)
- ✅ Pages : Home, Login, Dashboard
- ✅ Store Zustand pour l'authentification
- ✅ Service API avec interceptors
- ✅ Routing React Router avec routes protégées

### Docker
- ✅ Dockerfile backend
- ✅ Dockerfile frontend (avec nginx)
- ✅ docker-compose.yml pour déploiement Fedora 43

## 🎯 Prochaines étapes (à implémenter)

### 1. Tester l'application en mode développement

**Terminal 1 - Backend**
```bash
cd backend
npm install   # Si pas encore fait
node ace migration:run
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm install   # Si pas encore fait
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

### 2. Créer votre premier compte

1. Cliquez sur "Inscription"
2. Entrez votre email et mot de passe
3. Vous serez automatiquement connecté au dashboard

### 3. Phase 2 - Profil utilisateur (prochaine étape recommandée)

**À implémenter** :
- Page de profil avec formulaire
- Modification FC max, FC repos, poids actuel
- Calcul automatique des 5 zones FC (Karvonen)
- Changement de thème clair/sombre

**Fichiers à créer** :
- `frontend/src/pages/Profile.tsx`
- `backend/app/controllers/users_controller.ts`
- Route PATCH `/api/users/profile`

### 4. Phase 3 - Suivi du poids

**À implémenter** :
- Formulaire d'ajout de pesée (date, poids, notes)
- Liste avec tri/filtres
- Graphique d'évolution (LineChart avec Recharts)
- Statistiques (min, max, moyenne, tendance)

**Fichiers à créer** :
- `frontend/src/pages/Weight.tsx`
- `backend/app/controllers/weight_histories_controller.ts`
- Routes CRUD `/api/weight-histories`

### 5. Phase 4 - Import d'activités (prioritaire)

**À implémenter** :
- Upload de fichiers FIT/GPX/CSV
- Parsing avec `fit-file-parser`, `xml2js`
- Calcul automatique TRIMP, zones FC
- Stockage GPS data en JSON

**Fichiers à créer** :
- `backend/app/services/activity_parser_service.ts`
- `backend/app/services/metrics_calculator_service.ts`
- `backend/app/controllers/activities_controller.ts`
- `frontend/src/pages/Activities.tsx`
- `frontend/src/components/ActivityUpload.tsx`

## 🔧 Commandes utiles

### Backend
```bash
# Créer une migration
node ace make:migration <nom>

# Créer un controller
node ace make:controller <nom>

# Créer un modèle
node ace make:model <nom>

# Rollback migration
node ace migration:rollback

# Routes disponibles
node ace list:routes
```

### Frontend
```bash
# Build de production
npm run build

# Preview du build
npm run preview

# Vérifier TypeScript
npm run type-check   # Si configuré
```

### Docker
```bash
# Démarrer en production
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Reconstruire les images
docker-compose build
```

## 📊 Priorités de développement

### Priorité HAUTE (fonctionnalités essentielles)
1. ⚡ **Page Profil** - Configurer FC max/repos pour calculs
2. ⚡ **Import FIT/GPX** - Parser et analyser les activités
3. ⚡ **Calculs TRIMP** - Implémenter les métriques cyclistes
4. ⚡ **Graphiques activités** - Visualisation FC/vitesse/altitude

### Priorité MOYENNE
5. 📊 **CTL/ATL/TSB** - Suivi de la charge d'entraînement
6. 🗺️ **Cartes GPS** - React Leaflet avec traces colorées
7. ⚖️ **Suivi poids** - Graphiques et statistiques

### Priorité BASSE
8. 🚴 **Gestion équipement** - CRUD vélos
9. 📤 **Exports** - CSV/PDF
10. 💾 **Backups** - Automatisation

## 🎨 Design Guide - Rappel des tokens

### Couleurs principales
```css
Accent: #3B82F6 (bleu cycliste)
Text: #374151
Background: #F9FAFB
Border: #E5E7EB
```

### Spacing (8px grid)
```
8px, 16px, 24px, 32px, 48px, 64px
```

### Composants à utiliser
- Buttons : px-6 py-3, rounded-md
- Cards : border border-border-base shadow-card
- Inputs : border-border-medium focus:ring-accent-500

## 📚 Ressources utiles

- [AdonisJS Docs](https://docs.adonisjs.com/guides/introduction)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [React Leaflet](https://react-leaflet.js.org/)
- [fit-file-parser](https://www.npmjs.com/package/fit-file-parser)

## 🐛 Résolution de problèmes

### Le backend ne démarre pas
- Vérifier que `.env` existe dans `backend/`
- Vérifier que les migrations ont été exécutées
- Vérifier que SQLite est bien installé

### Le frontend ne se connecte pas au backend
- Vérifier que `VITE_API_URL` dans `frontend/.env` pointe vers `http://localhost:3333`
- Vérifier que le backend est bien démarré
- Vérifier les CORS dans `backend/config/cors.ts`

### Erreur de build Docker
- S'assurer que tous les fichiers sont bien commités
- Vérifier les chemins dans les Dockerfiles
- Reconstruire avec `docker-compose build --no-cache`

## 💡 Conseils

1. **Commencez par le profil** - Les zones FC dépendent de FC max/repos
2. **Testez avec de vraies données** - Importez un fichier FIT de test
3. **Développez incrémentalement** - Une fonctionnalité à la fois
4. **Suivez le design guide** - Cohérence visuelle importante
5. **Documentez vos calculs** - TRIMP et CTL/ATL/TSB sont complexes

Bon développement ! 🚴‍♂️💪
