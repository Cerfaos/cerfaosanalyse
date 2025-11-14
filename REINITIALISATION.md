# Guide de Réinitialisation Complète de l'Application

Ce guide vous permet de repartir complètement de zéro avec l'application.

---

## ✅ Ce qui a déjà été fait

La base de données a été **complètement supprimée et recréée** avec un schéma vide.

**9 migrations exécutées avec succès** :
- ✅ Users table
- ✅ Access tokens table
- ✅ Equipment table
- ✅ Activities table
- ✅ Weight histories table
- ✅ + 4 migrations de mise à jour

---

## 🧹 Étape Finale : Nettoyer le localStorage du Navigateur

Le localStorage contient vos données de session (token JWT, thème, etc.). Il faut le vider pour repartir de zéro.

### Méthode 1 : Via les DevTools (Recommandé)

1. **Ouvrez votre navigateur** (Chrome, Firefox, Edge, etc.)
2. **Allez sur** `http://localhost:5173` (ou l'URL de votre app)
3. **Ouvrez les DevTools** :
   - Windows/Linux : `F12` ou `Ctrl + Shift + I`
   - Mac : `Cmd + Option + I`
4. **Cliquez sur l'onglet "Application"** (Chrome) ou "Stockage" (Firefox)
5. **Dans le menu de gauche** :
   - Chrome : `Local Storage` → `http://localhost:5173`
   - Firefox : `Stockage local` → `http://localhost:5173`
6. **Sélectionnez toutes les entrées** et supprimez-les :
   - Chrome : Clic droit → "Clear" ou icône 🗑️
   - Firefox : Clic droit → "Supprimer tout"

### Méthode 2 : Via la Console JavaScript

1. Ouvrez les DevTools (`F12`)
2. Allez dans l'onglet **Console**
3. Tapez cette commande et appuyez sur Entrée :
   ```javascript
   localStorage.clear()
   ```
4. Rechargez la page (`F5`)

### Méthode 3 : Effacer les données du site (Plus radical)

**Chrome** :
1. Cliquez sur l'icône 🔒 (ou ⓘ) à gauche de l'URL
2. Cliquez sur "Paramètres du site"
3. Cliquez sur "Effacer les données"
4. Cochez "Cookies et données de sites"
5. Cliquez sur "Effacer"

**Firefox** :
1. Cliquez sur l'icône 🔒 à gauche de l'URL
2. Cliquez sur "Effacer les cookies et les données de site"
3. Confirmez

---

## 🚀 Démarrer l'Application

Maintenant que tout est nettoyé, vous pouvez relancer l'application :

```bash
# À la racine du projet
npm run dev
```

Ou séparément :

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📝 Créer votre Premier Compte

1. **Ouvrez votre navigateur** sur `http://localhost:5173`
2. Vous devriez voir la **page d'accueil** (Home)
3. Cliquez sur **"Inscription"** ou **"Commencer maintenant"**
4. Remplissez le formulaire :
   - Nom complet
   - Email
   - Mot de passe (min. 8 caractères)
   - FC Max (ex: 190)
   - FC Repos (ex: 60)
   - Poids actuel (ex: 75)
5. Cliquez sur **"S'inscrire"**
6. Vous serez automatiquement connecté et redirigé vers le **Dashboard** !

---

## 🧪 Tester les Fonctionnalités

### 1. Importer une Activité

**Page** : `Activités`

**Options** :
- **Import fichier** : Glissez un fichier FIT/GPX/CSV
- **Création manuelle** : Remplissez le formulaire

**Test** :
1. Allez sur la page Activités
2. Cliquez sur "Importer une activité"
3. Soit :
   - Importez un fichier FIT (Garmin/Wahoo)
   - Ou créez manuellement une activité
4. ✅ Vous devriez voir un **toast vert** "Activité importée avec succès !"
5. L'activité apparaît dans la liste

### 2. Voir les Statistiques

**Page** : `Dashboard`

Vous verrez :
- **Stats globales** : Total sorties, distance, temps, etc.
- **Stats par période** : 7, 30, 90, 365 jours
- **Graphiques** : Évolution distance/activités par mois
- **Répartition par type** : Cyclisme, Course, etc.

### 3. Calculer TRIMP et CTL/ATL/TSB

**Page** : `Charge d'entraînement`

Vous verrez :
- **TRIMP** de chaque activité
- **CTL** (Chronic Training Load) - Forme sur 42 jours
- **ATL** (Acute Training Load) - Fatigue sur 7 jours
- **TSB** (Training Stress Balance) - CTL - ATL
- Recommandations automatiques

### 4. Tester le Dark Mode 🌙

1. Cliquez sur l'**icône lune** dans la navbar
2. Le thème devient sombre
3. Rechargez la page → le thème est **sauvegardé** !

### 5. Tester les Toast Notifications 💬

Les toasts apparaissent automatiquement pour :
- ✅ **Succès** : Import activité, création compte, etc. (toast vert)
- ❌ **Erreur** : Fichier invalide, champs manquants, etc. (toast rouge)
- ℹ️ **Info** : Messages informatifs (toast bleu)

---

## 🔄 Pour Réinitialiser à Nouveau

Si vous voulez repartir de zéro dans le futur, utilisez le **script automatique** :

```bash
# À la racine du projet
./reset-app.sh
```

Ce script :
1. ✅ Arrête les processus backend/frontend
2. ✅ Supprime la base de données
3. ✅ Nettoie les fichiers uploadés
4. ✅ Recrée la base avec les migrations
5. ✅ Vous donne les instructions pour nettoyer le localStorage

---

## 🐛 Problèmes Courants

### "Impossible de se connecter au serveur"
**Solution** : Vérifiez que le backend tourne sur le port 3333
```bash
lsof -i :3333
```

### "Token invalide" après réinitialisation
**Solution** : Vous n'avez pas nettoyé le localStorage
→ Suivez les instructions ci-dessus

### "Port 3333 déjà utilisé"
**Solution** : Tuez le processus
```bash
lsof -ti :3333 | xargs kill -9
```

### Le thème ne revient pas à "light" après reset
**Solution** : Le thème est dans le localStorage
→ Nettoyez-le ou changez-le via l'icône 🌙

---

## 📊 Données de Test Recommandées

### Compte de test
- **Email** : `didier@test.fr`
- **Mot de passe** : `test1234`
- **FC Max** : 190
- **FC Repos** : 60
- **Poids** : 75 kg

### Activité manuelle de test
- **Type** : Cyclisme
- **Date** : Aujourd'hui
- **Durée** : 1h 30min (01:30:00)
- **Distance** : 45 km
- **FC Moyenne** : 150 bpm
- **FC Max** : 175 bpm
- **Vitesse Moyenne** : 30 km/h
- **Dénivelé** : 500 m
- **Calories** : 1200 kcal

---

## ✨ Félicitations !

Votre application est maintenant **complètement réinitialisée** et prête à être testée de zéro !

**Fonctionnalités à découvrir** :
- 🎨 Dark Mode moderne
- 💬 Toast notifications élégantes
- ♿ Accessibilité améliorée
- 📊 Métriques avancées (TRIMP, CTL/ATL/TSB)
- 🗺️ Cartes GPS interactives
- ⚙️ Gestion équipement
- 📈 Suivi du poids
- 📤 Exports CSV

**Bon test !** 🚀
