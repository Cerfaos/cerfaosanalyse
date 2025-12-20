#!/bin/bash
# Script pour reconstruire et redémarrer les conteneurs après modifications

echo "=== Arrêt et suppression des conteneurs ==="
podman stop cycliste-backend cycliste-frontend 2>/dev/null
podman rm cycliste-backend cycliste-frontend 2>/dev/null

echo ""
echo "=== Reconstruction de l'image backend ==="
cd /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse
# --no-cache force une reconstruction complète
podman build --no-cache -t cerfaosanalyse_backend:latest -f backend/Dockerfile ./backend

echo ""
echo "=== Reconstruction de l'image frontend ==="
# --no-cache force une reconstruction complète
podman build --no-cache -t cerfaosanalyse_frontend:latest \
  --build-arg VITE_API_URL=http://192.168.0.11:3333 \
  -f frontend/Dockerfile ./frontend

echo ""
echo "=== Création et démarrage des conteneurs ==="
# Backend
podman run -d --name cycliste-backend \
  -p 3333:3333 \
  -v /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse/backend/tmp:/app/build/tmp:Z \
  -v /home/gaibeul/Documents/Projet-Cursor/cerfaosanalyse/backend/public/uploads:/app/build/public/uploads:Z \
  -e NODE_ENV=production \
  -e PORT=3333 \
  -e HOST=0.0.0.0 \
  -e TZ=Europe/Paris \
  -e APP_KEY=your-secret-app-key-change-in-production \
  -e LOG_LEVEL=info \
  -e DB_CONNECTION=sqlite \
  -e CORS_ORIGIN=http://192.168.0.11:8080 \
  -e OPENWEATHERMAP_API_KEY=7cd957de506d224af7028e8d405cdf97 \
  cerfaosanalyse_backend:latest

sleep 3

# Frontend
podman run -d --name cycliste-frontend \
  -p 8080:80 \
  cerfaosanalyse_frontend:latest

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
