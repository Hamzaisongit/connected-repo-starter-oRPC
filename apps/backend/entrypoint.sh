#!/bin/sh

# Persistence: Set environment variables for this session
export TZ=Etc/UTC

# 2. Idempotent Migrations
echo "Applying migrations..."
node dist/db/db_script.js up force
if [ $? -ne 0 ]; then
  echo "Migration failed. Stopping startup."
  exit 1
fi

# 3. Start Server with Health Monitoring
echo "Starting server..."
node dist/server.js &
SERVER_PID=$!

# Function to handle rollback on crash/termination
rollback() {
  echo "Process terminated. Attempting migration rollback..."
  node dist/db/db_script.js down
  exit 1
}

# Initial Warm-up check (wait for port to open)
echo "Waiting for server to respond..."
MAX_RETRIES=10
COUNT=0
HEALTHCHECK_TIMEOUT=5
while ! curl -s --max-time $HEALTHCHECK_TIMEOUT http://localhost:3000/api/health | grep -q '"status":"ok"'; do
  sleep 2
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Server failed to stabilize. Rolling back..."
    rollback
  fi
done

echo "Server is healthy. Monitoring process $SERVER_PID..."

# Bring the server to foreground to keep container alive 
# and trap signals for clean rollbacks
trap rollback SIGTERM SIGINT
wait $SERVER_PID