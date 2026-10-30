#!/bin/sh
set -e

# Extraction de l'hôte et du port depuis DATABASE_URL (ou fallback vers 'postgres:5432')
if [ -n "$DATABASE_URL" ]; then
  # On extrait l'hôte et le port depuis l'URL postgresql://
  DB_HOST=$(echo "$DATABASE_URL" | sed -e 's/.*@//' -e 's/\/.*//' -e 's/:.*//')
  DB_PORT=$(echo "$DATABASE_URL" | sed -e 's/.*://' -e 's/\/.*//')
  
  # Si le port n'est pas explicite dans l'URL, on utilise 5432
  case $DB_PORT in
    ''|*[!0-9]*) DB_PORT=5432 ;;
  esac
else
  DB_HOST="postgres"
  DB_PORT=5432
fi

echo "Waiting for database at $DB_HOST:$DB_PORT..."

until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 2
done

echo "Database is ready 🚀"

echo "Applying migrations..."
pnpm exec prisma migrate deploy

echo "Starting application..."
exec node dist/src/main.js