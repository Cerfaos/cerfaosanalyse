#!/bin/bash
# Script pour libérer le port 3333 avant de lancer le serveur

PORT=3333

# Trouver le PID du processus utilisant le port
PID=$(lsof -ti :$PORT 2>/dev/null)

if [ -n "$PID" ]; then
  echo "🔄 Port $PORT occupé par le processus $PID, nettoyage en cours..."
  kill -9 $PID 2>/dev/null
  sleep 1
  echo "✅ Port $PORT libéré"
else
  echo "✅ Port $PORT disponible"
fi
