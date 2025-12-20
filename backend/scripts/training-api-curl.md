# API Training - Commandes curl

## Prérequis

### 1. Démarrer le serveur backend
```bash
cd backend
node ace serve --watch
```

### 2. Obtenir un token JWT

**Option A: Créer un compte**
```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Option B: Se connecter**
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Récupérer le token de la réponse:**
```bash
# Stocker le token dans une variable
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | jq -r '.data.token.token')

echo $TOKEN
```

---

## Templates d'entraînement

### Lister tous les templates
```bash
curl -X GET http://localhost:3333/api/training/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Lister les templates cycling
```bash
curl -X GET "http://localhost:3333/api/training/templates?category=cycling" \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les templates semaine 1
```bash
curl -X GET "http://localhost:3333/api/training/templates?week=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Détails d'un template
```bash
curl -X GET http://localhost:3333/api/training/templates/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un template personnel
```bash
curl -X POST http://localhost:3333/api/training/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon interval training",
    "category": "cycling",
    "level": "intermediate",
    "location": "indoor",
    "duration": 45,
    "tss": 65,
    "description": "Séance VO2max personnalisée",
    "blocks": [
      {"type": "warmup", "duration": "10:00", "percentFtp": 55, "reps": 1, "notes": "Progressif"},
      {"type": "interval", "duration": "03:00", "percentFtp": 120, "reps": 5, "notes": "5x3min à 120% avec 3min récup"},
      {"type": "cooldown", "duration": "10:00", "percentFtp": 40, "reps": 1, "notes": ""}
    ]
  }'
```

### Dupliquer un template
```bash
curl -X POST http://localhost:3333/api/training/templates/1/duplicate \
  -H "Authorization: Bearer $TOKEN"
```

### Modifier un template personnel
```bash
curl -X PUT http://localhost:3333/api/training/templates/6 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon interval training v2",
    "tss": 70
  }'
```

### Supprimer un template personnel
```bash
curl -X DELETE http://localhost:3333/api/training/templates/6 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Séances d'entraînement

### Créer une séance
```bash
curl -X POST http://localhost:3333/api/training/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sweet Spot du mardi",
    "category": "cycling",
    "level": "intermediate",
    "location": "indoor",
    "duration": 60,
    "tss": 75,
    "templateId": 4,
    "blocks": [
      {"type": "warmup", "duration": "10:00", "percentFtp": 55, "reps": 1, "notes": "Échauffement"},
      {"type": "effort", "duration": "10:00", "percentFtp": 90, "reps": 3, "notes": "3x10min SS"},
      {"type": "recovery", "duration": "05:00", "percentFtp": 45, "reps": 1, "notes": "Récup"},
      {"type": "cooldown", "duration": "05:00", "percentFtp": 40, "reps": 1, "notes": ""}
    ]
  }'
```

### Créer une séance PPG
```bash
curl -X POST http://localhost:3333/api/training/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gainage express",
    "category": "ppg",
    "level": "beginner",
    "location": "indoor",
    "duration": 20,
    "tss": 25,
    "exercises": [
      {"name": "Planche", "duration": "00:45", "reps": null, "sets": 3, "rest": "00:30", "hrTarget": "100-120", "notes": ""},
      {"name": "Gainage latéral", "duration": "00:30", "reps": null, "sets": 2, "rest": "00:30", "hrTarget": "100-120", "notes": "Chaque côté"},
      {"name": "Superman", "duration": "00:30", "reps": 15, "sets": 3, "rest": "00:30", "hrTarget": "100-120", "notes": ""}
    ]
  }'
```

### Lister mes séances
```bash
curl -X GET http://localhost:3333/api/training/sessions \
  -H "Authorization: Bearer $TOKEN"
```

### Filtrer par catégorie
```bash
curl -X GET "http://localhost:3333/api/training/sessions?category=cycling" \
  -H "Authorization: Bearer $TOKEN"
```

### Détails d'une séance
```bash
curl -X GET http://localhost:3333/api/training/sessions/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Modifier une séance
```bash
curl -X PUT http://localhost:3333/api/training/sessions/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sweet Spot du mardi (modifié)",
    "tss": 80
  }'
```

### Supprimer une séance
```bash
curl -X DELETE http://localhost:3333/api/training/sessions/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Planning

### Ajouter une séance au planning
```bash
curl -X POST http://localhost:3333/api/training/planning \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 1,
    "date": "2025-12-15"
  }'
```

### Récupérer le planning du mois
```bash
curl -X GET "http://localhost:3333/api/training/planning?month=12&year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

### Récupérer le planning par période
```bash
curl -X GET "http://localhost:3333/api/training/planning?start=2025-12-01&end=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Marquer une séance comme complétée
```bash
curl -X POST http://localhost:3333/api/training/planning/1/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Bonnes sensations, RPE 7/10",
    "activityId": 123
  }'
```

### Annuler la complétion
```bash
curl -X POST http://localhost:3333/api/training/planning/1/uncomplete \
  -H "Authorization: Bearer $TOKEN"
```

### Déplacer une séance
```bash
curl -X POST http://localhost:3333/api/training/planning/1/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newDate": "2025-12-20"
  }'
```

### Retirer du planning
```bash
curl -X DELETE http://localhost:3333/api/training/planning/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Statistiques

### Stats de la semaine courante
```bash
curl -X GET http://localhost:3333/api/training/stats/week \
  -H "Authorization: Bearer $TOKEN"
```

### Stats d'une semaine spécifique
```bash
curl -X GET "http://localhost:3333/api/training/stats/week?date=2025-12-15" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Script rapide

```bash
#!/bin/bash

# Connexion et stockage du token
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | jq -r '.data.token.token')

# Vérifier les templates
echo "=== Templates ==="
curl -s http://localhost:3333/api/training/templates \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

# Créer une séance
echo "=== Créer séance ==="
SESSION=$(curl -s -X POST http://localhost:3333/api/training/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "category": "cycling", "duration": 30, "blocks": []}')
echo $SESSION | jq '.data.id'
```
