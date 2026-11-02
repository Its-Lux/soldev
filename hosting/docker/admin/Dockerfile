# Build from the repo root, so the image can see the root lockfile, the
# vendored Yarn and the shared tsconfig:
#
#   docker build -f hosting/docker/<app>/Dockerfile -t <image> .
#
# The template itself is never deployed; build it by passing its location:
#
#   docker build -f hosting/docker/_web-template/Dockerfile \
#     --build-arg APP_DIR=packages/templates/web \
#     --build-arg APP_NAME=@templates/web -t soldev-web-template .

# ---- Stage 1: build ----
FROM node:24-alpine AS build

ARG APP_DIR=packages/web/admin
ARG APP_NAME=@web/admin

# Git hooks have no meaning inside an image.
ENV HUSKY=0

WORKDIR /repo

# 1. Manifests only, so this layer stays cached until dependencies change.
#    The image's bundled Yarn 1 hands over to the vendored Yarn 4 via yarnPath.
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
COPY ${APP_DIR}/package.json ./${APP_DIR}/
RUN yarn workspaces focus ${APP_NAME}

# 2. Shared config the app extends, then the app source.
COPY tsconfig.base.json ./
COPY ${APP_DIR} ./${APP_DIR}

# VITE_* values are baked into the bundle at build time (ADR 0004).
ARG VITE_API_BASE_URL
ARG VITE_ENABLE_MOCKS=false
ARG VITE_GOOGLE_MAPS_API_KEY=
ARG VITE_GOOGLE_MAPS_MAP_ID=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
    VITE_GOOGLE_MAPS_MAP_ID=$VITE_GOOGLE_MAPS_MAP_ID

# Production does not need the mock worker unless this is a demo build.
RUN yarn workspace ${APP_NAME} build \
 && if [ "$VITE_ENABLE_MOCKS" != "true" ]; then rm -f ${APP_DIR}/dist/mockServiceWorker.js; fi

# ---- Stage 2: serve ----
FROM nginx:1-alpine-slim

ARG APP_DIR=packages/web/admin

COPY --from=build /repo/${APP_DIR}/dist /usr/share/nginx/html
COPY ${APP_DIR}/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]