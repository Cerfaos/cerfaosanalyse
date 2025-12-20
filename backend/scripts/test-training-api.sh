#!/bin/bash

# =============================================================================
# Script de test pour l'API Training Module
# =============================================================================
# Usage: ./scripts/test-training-api.sh [email] [password]
#
# Si email/password non fournis, utilise les valeurs par défaut
# =============================================================================

set -e

# Configuration
BASE_URL="${API_URL:-http://localhost:3333}"
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-password123}"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les en-têtes de section
section() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}📌 $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Fonction pour afficher le résultat
result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ Succès${NC}"
  else
    echo -e "${RED}❌ Échec (code: $1)${NC}"
  fi
}

# Fonction pour faire une requête et afficher le résultat
api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -e "\n${YELLOW}▶ $description${NC}"
  echo -e "  ${method} ${endpoint}"

  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${BASE_URL}${endpoint}")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "${BASE_URL}${endpoint}")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  ${GREEN}HTTP $http_code${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "  ${RED}HTTP $http_code${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  fi

  echo "$body"
}

# =============================================================================
# ÉTAPE 0: Authentification
# =============================================================================
section "Authentification"

echo -e "Connexion avec: ${EMAIL}"

AUTH_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" \
  "${BASE_URL}/api/auth/login")

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.data.token.token // .token.token // .token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Échec de l'authentification${NC}"
  echo "Réponse: $AUTH_RESPONSE"
  echo ""
  echo -e "${YELLOW}💡 Créez d'abord un compte:${NC}"
  echo "curl -X POST -H 'Content-Type: application/json' \\"
  echo "  -d '{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"fullName\": \"Test User\"}' \\"
  echo "  ${BASE_URL}/api/auth/register"
  exit 1
fi

echo -e "${GREEN}✅ Authentification réussie${NC}"
echo -e "Token: ${TOKEN:0:50}..."

# =============================================================================
# ÉTAPE 1: Lister les templates
# =============================================================================
section "1. Lister les templates d'entraînement"

TEMPLATES_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/training/templates")

echo "$TEMPLATES_RESPONSE" | jq '.'

# Récupérer l'ID du premier template cycling
TEMPLATE_ID=$(echo "$TEMPLATES_RESPONSE" | jq -r '.data[0].id // empty')

if [ -z "$TEMPLATE_ID" ]; then
  echo -e "${YELLOW}⚠️ Aucun template trouvé. Exécutez d'abord le seeder:${NC}"
  echo "node ace db:seed --files=database/seeders/training_template_seeder.ts"
  exit 1
fi

echo -e "\n${GREEN}Template ID sélectionné: $TEMPLATE_ID${NC}"

# =============================================================================
# ÉTAPE 2: Créer une séance depuis un template
# =============================================================================
section "2. Créer une séance d'entraînement"

SESSION_DATA='{
  "name": "Ma séance Sweet Spot",
  "category": "cycling",
  "level": "intermediate",
  "location": "indoor",
  "intensityRef": "ftp",
  "duration": 60,
  "tss": 75,
  "description": "Séance Sweet Spot personnalisée",
  "templateId": '$TEMPLATE_ID',
  "blocks": [
    {"type": "warmup", "duration": "10:00", "percentFtp": 55, "reps": 1, "notes": "Échauffement"},
    {"type": "effort", "duration": "15:00", "percentFtp": 90, "reps": 2, "notes": "2x15min Sweet Spot"},
    {"type": "recovery", "duration": "05:00", "percentFtp": 45, "reps": 1, "notes": "Récup entre blocs"},
    {"type": "cooldown", "duration": "05:00", "percentFtp": 40, "reps": 1, "notes": "Retour au calme"}
  ]
}'

SESSION_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SESSION_DATA" \
  "${BASE_URL}/api/training/sessions")

echo "$SESSION_RESPONSE" | jq '.'

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.id // empty')

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}❌ Échec de la création de séance${NC}"
  exit 1
fi

echo -e "\n${GREEN}Séance créée avec ID: $SESSION_ID${NC}"

# =============================================================================
# ÉTAPE 3: Lister mes séances
# =============================================================================
section "3. Lister mes séances"

curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/training/sessions" | jq '.'

# Filtrer par catégorie
echo -e "\n${YELLOW}▶ Filtrer par catégorie (cycling)${NC}"
curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/training/sessions?category=cycling" | jq '.data | length' | xargs -I {} echo "  {} séance(s) cycling"

# =============================================================================
# ÉTAPE 4: Ajouter une séance au planning
# =============================================================================
section "4. Ajouter une séance au planning"

# Date d'aujourd'hui + 1 jour
PLAN_DATE=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)

PLANNING_DATA='{
  "sessionId": '$SESSION_ID',
  "date": "'$PLAN_DATE'"
}'

echo "Date planifiée: $PLAN_DATE"

PLANNING_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PLANNING_DATA" \
  "${BASE_URL}/api/training/planning")

echo "$PLANNING_RESPONSE" | jq '.'

PLANNED_ID=$(echo "$PLANNING_RESPONSE" | jq -r '.data.id // empty')

if [ -z "$PLANNED_ID" ]; then
  echo -e "${RED}❌ Échec de l'ajout au planning${NC}"
else
  echo -e "\n${GREEN}Séance planifiée avec ID: $PLANNED_ID${NC}"
fi

# =============================================================================
# ÉTAPE 5: Récupérer le planning du mois
# =============================================================================
section "5. Récupérer le planning du mois"

CURRENT_MONTH=$(date +%m)
CURRENT_YEAR=$(date +%Y)

echo "Mois: $CURRENT_MONTH/$CURRENT_YEAR"

curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/training/planning?month=${CURRENT_MONTH}&year=${CURRENT_YEAR}" | jq '.'

# =============================================================================
# ÉTAPE 6: Stats de la semaine
# =============================================================================
section "6. Statistiques de la semaine"

curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/training/stats/week" | jq '.'

# =============================================================================
# ÉTAPE 7: Marquer la séance comme complétée
# =============================================================================
section "7. Marquer la séance comme complétée"

if [ -n "$PLANNED_ID" ]; then
  COMPLETE_DATA='{
    "notes": "Séance réalisée avec succès, bonnes sensations!"
  }'

  curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$COMPLETE_DATA" \
    "${BASE_URL}/api/training/planning/${PLANNED_ID}/complete" | jq '.'
fi

# =============================================================================
# ÉTAPE 8: Dupliquer un template
# =============================================================================
section "8. Dupliquer un template"

curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/training/templates/${TEMPLATE_ID}/duplicate" | jq '.'

# =============================================================================
# Résumé
# =============================================================================
section "Résumé des tests"

echo -e "${GREEN}✅ Tous les tests ont été exécutés${NC}"
echo ""
echo "Endpoints testés:"
echo "  • GET  /api/training/templates"
echo "  • POST /api/training/sessions"
echo "  • GET  /api/training/sessions"
echo "  • POST /api/training/planning"
echo "  • GET  /api/training/planning?month=&year="
echo "  • GET  /api/training/stats/week"
echo "  • POST /api/training/planning/:id/complete"
echo "  • POST /api/training/templates/:id/duplicate"
echo ""
echo -e "${YELLOW}Token JWT pour tests manuels:${NC}"
echo "$TOKEN"
