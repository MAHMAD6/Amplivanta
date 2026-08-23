#!/bin/sh
set -e

PRISMA="node node_modules/prisma/build/index.js"

# Apply schema: use committed migrations when present, otherwise push the schema
# directly (first deploy before a migration history exists).
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "[entrypoint] Applying migrations…"
  $PRISMA migrate deploy
else
  echo "[entrypoint] No migrations found — pushing schema…"
  $PRISMA db push --skip-generate --accept-data-loss
fi

echo "[entrypoint] Starting server…"
exec node server.js
