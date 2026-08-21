#!/usr/bin/env bash
# Staged/production observation runner: repeated full canary sweeps against a
# deployment (protected) or public origin for a given number of minutes.
# Usage: observe-deployment.sh (--deployment URL | --url ORIGIN) MINUTES LOGFILE
set -u
MODE_FLAG="$1"
TARGET="$2"
MINUTES="${3:?minutes}"
LOG="${4:?logfile}"
END=$(( $(date +%s) + MINUTES * 60 ))
SWEEP=0
PASS=0
FAIL=0
while [ "$(date +%s)" -lt "$END" ]; do
  SWEEP=$((SWEEP + 1))
  if node "$(dirname "$0")/deploy-canary.mjs" "$MODE_FLAG" "$TARGET" --label "observe-sweep-$SWEEP" >>"$LOG" 2>&1; then
    PASS=$((PASS + 1))
    echo "$(date -u +%FT%TZ) sweep $SWEEP: PASS (total pass=$PASS fail=$FAIL)"
  else
    FAIL=$((FAIL + 1))
    echo "$(date -u +%FT%TZ) sweep $SWEEP: FAIL (total pass=$PASS fail=$FAIL)"
  fi
  sleep 45
done
echo "observation complete: sweeps=$SWEEP pass=$PASS fail=$FAIL"
[ "$FAIL" -eq 0 ]
