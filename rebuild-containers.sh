#!/bin/bash
# Script pour reconstruire et redémarrer les conteneurs après modifications

echo "=== Arrêt des conteneurs ==="
podman stop cycliste-backend cycliste-frontend

echo ""
echo "=== Reconstruction de l'image backend ==="
cd /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse
podman build -t cerfaosanalyse_backend:latest -f backend/Dockerfile ./backend

echo ""
echo "=== Reconstruction de l'image frontend ==="
podman build -t cerfaosanalyse_frontend:latest -f frontend/Dockerfile ./frontend

echo ""
echo "=== Démarrage des conteneurs ==="
podman start cycliste-backend
sleep 3
podman start cycliste-frontend

echo ""
echo "=== Vérification de l'état ==="
podman ps | grep cycliste

echo ""
echo "=== Test de santé backend ==="
sleep 2
curl -s http://localhost:3333/health | jq .

echo ""
echo "=== Test de santé frontend ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080

echo ""
echo "✅ Reconstruction terminée !"
echo "Accédez à l'application sur : http://192.168.0.11:8080"
