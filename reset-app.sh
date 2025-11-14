#!/bin/bash
# Script de réinitialisation complète de l'application
# Supprime toutes les données et repart de zéro

set -e

echo "🔄 Réinitialisation complète de l'application..."
echo ""

# Arrêter les processus si ils tournent
echo "1️⃣  Arrêt des processus..."
pkill -f "node ace serve" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
echo "✅ Processus arrêtés"
echo ""

# Supprimer la base de données
echo "2️⃣  Suppression de la base de données..."
if [ -f backend/tmp/db.sqlite3 ]; then
    rm backend/tmp/db.sqlite3
    echo "✅ Base de données supprimée"
else
    echo "ℹ️  Aucune base de données à supprimer"
fi
echo ""

# Supprimer les fichiers uploadés (si le dossier existe)
echo "3️⃣  Nettoyage des fichiers uploadés..."
if [ -d backend/tmp/uploads ]; then
    rm -rf backend/tmp/uploads/*
    echo "✅ Fichiers uploadés supprimés"
else
    echo "ℹ️  Aucun fichier uploadé à supprimer"
fi
echo ""

# Recréer la base de données
echo "4️⃣  Recréation de la base de données..."
cd backend
node ace migration:run
cd ..
echo "✅ Base de données recréée"
echo ""

echo "✨ Réinitialisation terminée !"
echo ""
echo "📝 Prochaines étapes :"
echo "  1. Ouvrez votre navigateur"
echo "  2. Ouvrez les DevTools (F12)"
echo "  3. Allez dans 'Application' > 'Local Storage'"
echo "  4. Supprimez toutes les entrées pour localhost:5173"
echo "  5. Rechargez la page (F5)"
echo "  6. Lancez l'application : npm run dev"
echo ""
echo "🚀 Vous pouvez maintenant créer un nouveau compte !"
