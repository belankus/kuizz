#!/bin/sh
set -e

echo "Waiting for database..."

until nc -z postgres 5432; do
  sleep 2
done

echo "Database is ready 🚀"

echo "Applying migrations..."
pnpx prisma migrate deploy

echo "Starting application..."
exec node dist/src/main.js