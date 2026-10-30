#!/usr/bin/env bash
# Builds the production image, runs it, and checks the things that have gone
# wrong before. Needs Docker and curl.
#
#   bash scripts/verify-docker.sh
#
# Optional settings: IMAGE, NAME, PORT (defaults below).

set -u

# Git Bash on Windows rewrites paths like /usr/share/... when it passes them to
# docker. This stops that.
export MSYS_NO_PATHCONV=1

IMAGE="${IMAGE:-soldev-ui-verify}"
NAME="${NAME:-soldev-ui-verify}"
PORT="${PORT:-8089}"
WEB_ROOT="/usr/share/nginx/html"
MARKER="verify-marker.example/api"

pass=0
fail=0
warn=0
ok() { echo "PASS  $1"; pass=$((pass + 1)); }
bad() { echo "FAIL  $1"; fail=$((fail + 1)); }
note() { echo "WARN  $1"; warn=$((warn + 1)); }
skip() { echo "SKIP  $1"; }

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1; }
trap cleanup EXIT
cleanup

finish() {
  echo
  echo "$pass passed, $fail failed, $warn warnings"
  [ "$fail" -eq 0 ]
  exit $?
}

# 1. Does it build? If the Dockerfile takes the API address as a build argument,
# bake in a marker value, so we can check later that it reached the bundle.
build_args=()
baked=no
if grep -qE '^ARG VITE_API_BASE_URL' Dockerfile 2>/dev/null; then
  build_args=(--build-arg "VITE_API_BASE_URL=https://$MARKER")
  baked=yes
fi
if docker build ${build_args[@]+"${build_args[@]}"} -t "$IMAGE" .; then
  ok "the image builds"
else
  bad "the image builds"
  finish
fi

# 2. Does it start and answer?
if ! docker run -d --name "$NAME" -p "$PORT:80" "$IMAGE" >/dev/null; then
  bad "the container starts"
  finish
fi
ok "the container starts"
for _ in 1 2 3 4 5 6 7 8 9 10; do
  curl -fsS "http://localhost:$PORT/" >/dev/null 2>&1 && break
  sleep 1
done

page() { curl -fsS "http://localhost:$PORT$1" 2>/dev/null; }

if page / | grep -q 'id="root"'; then ok "serves the app at /"; else bad "serves the app at /"; fi

# A deep link must return the app shell, or refreshing any page but / will 404.
if page /todos | grep -q 'id="root"'; then
  ok "a deep link returns the app shell (single page app fallback)"
else
  bad "a deep link returns the app shell (single page app fallback)"
fi

asset="$(page / | grep -oE '/assets/[^"]+\.js' | head -1)"
if [ -n "$asset" ] && curl -fsI "http://localhost:$PORT$asset" >/dev/null 2>&1; then
  ok "the built JavaScript is served ($asset)"
else
  bad "the built JavaScript is served"
fi

if docker exec "$NAME" nginx -t >/dev/null 2>&1; then ok "the nginx configuration is valid"; else bad "the nginx configuration is valid"; fi

# 3. What should and should not be inside the image.
if docker exec "$NAME" sh -c 'command -v node' >/dev/null 2>&1; then
  bad "the final image has no Node in it"
else
  ok "the final image has no Node in it"
fi

if docker exec "$NAME" sh -c "grep -rl 'setupWorker' $WEB_ROOT" >/dev/null 2>&1; then
  bad "the mock layer (MSW) is not in the production bundle"
else
  ok "the mock layer (MSW) is not in the production bundle"
fi

if docker exec "$NAME" sh -c "[ -e $WEB_ROOT/mockServiceWorker.js ]" >/dev/null 2>&1; then
  note "mockServiceWorker.js is served from public/. Harmless, but production does not need it"
fi

# 4. The API address is baked in at build time (see ADR 0004).
if [ "$baked" = yes ]; then
  if docker exec "$NAME" sh -c "grep -rl '$MARKER' $WEB_ROOT" >/dev/null 2>&1; then
    ok "VITE_API_BASE_URL given as a build argument reaches the bundle"
  else
    bad "VITE_API_BASE_URL given as a build argument reaches the bundle"
  fi
else
  note "the Dockerfile has no ARG VITE_API_BASE_URL, so the image uses whatever .env held when it was built"
fi

# 5. Size, for information.
size="$(docker image inspect -f '{{.Size}}' "$IMAGE" 2>/dev/null || echo 0)"
mb=$((size / 1024 / 1024))
echo "INFO  image size: ${mb} MB"
if [ "$mb" -gt 100 ]; then note "the image is over 100 MB, which is unusually large for static files behind nginx"; fi

finish
