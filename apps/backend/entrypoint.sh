#!/bin/sh

# Apply migrations
echo "Applying migrations..."
node dist/db/db_script.js up

if [ $? -ne 0 ]; then
  echo "Migration failed"
  exit 1
fi

# Start server in background
echo "Starting server..."
node dist/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Health check parameters matching Dockerfile
HEALTHCHECK_RETRIES=3
HEALTHCHECK_INTERVAL=30
HEALTHCHECK_TIMEOUT=5

for i in 1 2 3; do
  echo "Health check attempt $i"
  response=$(curl -s --max-time $HEALTHCHECK_TIMEOUT http://localhost:3000/api/health)
  if echo "$response" | grep -q '"status":"ok"'; then
    echo "Health check passed"
    # Keep the server running
    wait $SERVER_PID
    exit $?
  else
    echo "Health check failed"
    if [ $i -lt $HEALTHCHECK_RETRIES ]; then
      sleep $HEALTHCHECK_INTERVAL
    fi
  fi
done

# If all health checks failed, rollback migration
echo "All health checks failed, rolling back migration"
node dist/db/db_script.js down

# Kill server
kill $SERVER_PID 2>/dev/null

exit 1