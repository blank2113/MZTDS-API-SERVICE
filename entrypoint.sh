#!/bin/sh
set -e


DB_URL=${DATABASE_URL:?DATABASE_URL is not set}

echo "Database is up — applying migrations..."

echo "Database is up — applying migrations (deploy)..."
# применяем миграции (без интерактива)
npx prisma migrate deploy 

# если нужен seed
# npx prisma db seed

echo "Start server"
node dist/server.js 