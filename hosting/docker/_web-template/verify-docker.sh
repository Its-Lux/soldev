#!/usr/bin/env bash
# Builds a frontend's production image from the repo root, runs it, and checks
# the things that have gone wrong before. Needs Docker and curl.
#
#   bash hosting/docker/<app>/verify-docker.sh
#
# The template itself is never deployed, so pass its location in:
#
#   APP_DIR=packages/templates/web APP_NAME=@templates/web \
#     bash hosting/docker/_web-template/verify-docker.sh
#
# Optional settings: APP_DIR, APP_NAME, IMAGE, NAME, PORT (defaults below).
# Works from any folder inside the repo.

set -u

# Git Bash on Windows rewrites paths like /usr/share/... when it passes them to
# docker. This stops that, which is also why every host path below is relative.
export MSYS_NO_PATHCONV=1

# Find the repo root and this folder's Dockerfile as repo-relative paths.
# (git rev-parse avoids mixing C:/... and /c/... path styles on Windows.)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1
SCRIPT_REL="$(git rev-parse --show-prefix 2>/dev/null)" || {
  echo "FAIL  this script must live inside the git repo"
  exit 1
}
cd "./$(git rev-parse --show-cdup)" || exit 1
DOCKERFILE="${SCRIPT_REL}Dockerfile"

APP_DIR="${APP_DIR:-packages/web/__APP__}"
APP_NAME="${APP_NAME:-@web/__APP__}"
SHORT_NAME="${APP_NAME##*/}"
IMAGE="${IMAGE:-soldev-$SHORT_NAME-verify}"
NAME="${NAME:-soldev-$SHORT_NAME-verify}"
PORT="${PORT:-8089}"
WEB_ROOT="/usr/share/nginx/html"
MARKER="verify-marker.example/api"

if [ ! -f "$DOCKERFILE" ]; then
  echo "FAIL  no Dockerfile at $DOCKERFILE"
  exit 1
fi
if [ ! -f "$APP_DIR/package.json" ]; then
  echo "FAIL  no app at $APP_DIR. Set APP_DIR and APP_NAME (see the top of this script)"
  exit 1
fi

pass=0
fail=0
warn=0
ok() { echo "PASS  $1"; pass=$((pass + 1)); }
bad() { echo "FAIL  $1"; fail=$((fail + 1)); }
note() { echo "WARN  $1"; warn=$((warn + 1)); }

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1; }
trap cleanup EXIT
cleanup

finish() {
  echo
  echo "$pass passed, $fail failed, $warn warnings"
  [ "$fail" -eq 0 ]
  exit $?
}

echo "INFO  app: $APP_NAME ($APP_DIR), Dockerfile: $DOCKERFILE, image: $IMAGE"

# 1. Does it build? If the Dockerfile takes the API address as a build argument,
# bake in a marker value, so we can check later that it reached the bundle.
build_args=(--build-arg "APP_DIR=$APP_DIR" --build-arg "APP_NAME=$APP_NAME")
baked=no
if grep -qE '^ARG VITE_API_BASE_URL' "$DOCKERFILE"; then
  build_args+=(--build-arg "VITE_API_BASE_URL=https://$MARKER")
  baked=yes
fi
if docker build -f "$DOCKERFILE" "${build_args[@]}" -t "$IMAGE" .; then
  ok "the image builds from the repo root"
else
  bad "the image builds from the repo root"
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
  bad "mockServiceWorker.js is removed when mocks are off"
else
  ok "mockServiceWorker.js is removed when mocks are off"
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