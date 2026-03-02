#!/bin/sh
set -e

# working directory for backend
cd /app/backend || exit 1

# debug: show schema presence
echo "contents of /app/backend/prisma:" && ls -R prisma || true

# perform database migrations then seed superadmin
# note: requires prisma CLI and ts-node to be available (install dev deps)

if [ -n "$DATABASE_URL" ]; then
  echo "Running migrations..."
  pnpm prisma migrate deploy

  echo "Seeding database..."
  # if seed script fails (e.g. already seeded) continue
  pnpm ts-node --transpile-only prisma/seed.ts || true
else
  echo "DATABASE_URL not set, skipping migrations/seeds"
fi

# finally exec the given command (app start)
exec "$@"
