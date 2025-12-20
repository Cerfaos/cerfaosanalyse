#!/bin/bash
# Tue le processus sur le port 5173 s'il existe
pid=$(lsof -ti :5173 2>/dev/null || true)
if [[ -n "$pid" ]]; then
  kill -9 "$pid" 2>/dev/null || true
fi
