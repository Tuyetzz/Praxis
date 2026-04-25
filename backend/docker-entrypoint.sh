#!/bin/sh
set -e  

echo "🛠 Syncing database..."
npm run sync

echo "🌱 Seeding data..."
npm run seed:system

echo "🚀 Starting server..."
exec npm run start