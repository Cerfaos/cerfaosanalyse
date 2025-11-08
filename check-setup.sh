#!/bin/bash

echo "🔍 Vérification de l'installation du Centre d'Analyse Cycliste"
echo "================================================================"
echo ""

# Vérifier Node.js
echo "✓ Node.js version:"
node --version

# Vérifier npm
echo "✓ npm version:"
npm --version

# Vérifier la structure du projet
echo ""
echo "📁 Structure du projet:"
echo "✓ Backend: $([ -d backend ] && echo "OK" || echo "MANQUANT")"
echo "✓ Frontend: $([ -d frontend ] && echo "OK" || echo "MANQUANT")"
echo "✓ docker-compose.yml: $([ -f docker-compose.yml ] && echo "OK" || echo "MANQUANT")"

# Vérifier les fichiers backend
echo ""
echo "📦 Backend (AdonisJS):"
echo "✓ package.json: $([ -f backend/package.json ] && echo "OK" || echo "MANQUANT")"
echo "✓ .env: $([ -f backend/.env ] && echo "OK" || echo "MANQUANT")"
echo "✓ Migrations: $(ls -1 backend/database/migrations/*.ts 2>/dev/null | wc -l) fichiers"
echo "✓ Models: $(ls -1 backend/app/models/*.ts 2>/dev/null | wc -l) fichiers"
echo "✓ Controllers: $(ls -1 backend/app/controllers/*.ts 2>/dev/null | wc -l) fichiers"

# Vérifier les fichiers frontend
echo ""
echo "🎨 Frontend (React + Vite):"
echo "✓ package.json: $([ -f frontend/package.json ] && echo "OK" || echo "MANQUANT")"
echo "✓ .env: $([ -f frontend/.env ] && echo "OK" || echo "MANQUANT")"
echo "✓ tailwind.config.js: $([ -f frontend/tailwind.config.js ] && echo "OK" || echo "MANQUANT")"
echo "✓ Components: $(ls -1 frontend/src/components/*.tsx 2>/dev/null | wc -l) fichiers"
echo "✓ Pages: $(ls -1 frontend/src/pages/*.tsx 2>/dev/null | wc -l) fichiers"

# Vérifier Docker
echo ""
echo "🐳 Docker:"
if command -v docker &> /dev/null; then
    echo "✓ Docker installé: $(docker --version)"
else
    echo "✗ Docker non installé"
fi

if command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose installé: $(docker-compose --version)"
else
    echo "✗ Docker Compose non installé"
fi

echo ""
echo "================================================================"
echo "🎉 Installation vérifiée !"
echo ""
echo "📝 Prochaines étapes :"
echo "1. cd backend && npm install && node ace migration:run"
echo "2. cd frontend && npm install"
echo "3. npm run dev (depuis la racine) pour démarrer en mode dev"
echo ""
