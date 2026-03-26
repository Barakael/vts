w#!/usr/bin/env bash
# Persistent reverse SSH tunnel: VPS:9000 → local Mac:9000
# Devices connect to 147.79.101.245:9000 and are forwarded here.

VPS_USER="teratech"
VPS_HOST="147.79.101.245"
REMOTE_PORT=9000
LOCAL_PORT=9000

echo "=== Teltonika SSH tunnel ==="
echo "Forwarding ${VPS_HOST}:${REMOTE_PORT} → localhost:${LOCAL_PORT}"
echo "Press Ctrl+C to stop."
echo ""

while true; do
  ssh \
    -o ServerAliveInterval=15 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -o StrictHostKeyChecking=accept-new \
    -N \
    -R "0.0.0.0:${REMOTE_PORT}:127.0.0.1:${LOCAL_PORT}" \
    "${VPS_USER}@${VPS_HOST}"

  EXIT=$?
  if [ $EXIT -eq 130 ] || [ $EXIT -eq 0 ]; then
    # SIGINT or clean exit – user wants to stop
    echo "Tunnel closed."
    break
  fi

  echo "[$(date)] Tunnel dropped (exit $EXIT), reconnecting in 5s…"
  sleep 5
done
