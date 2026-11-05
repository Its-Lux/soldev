# 0004. Multi-Stage Docker Build (Node → nginx)

Status: Accepted
Date: 2026-08-24

## Context

`yarn build` + `yarn preview` validate a production build on the
developer's own machine, but that machine has already-installed
dependencies, a specific OS (frequently case-insensitive, e.g.
macOS/Windows), and other local state that a real deploy target won't have.
A container build was needed to catch dependency-resolution or
environment-specific issues before they reach a real deployment.

## Decision

A multi-stage `Dockerfile`: a `node:24-alpine` stage installs dependencies
(`--frozen-lockfile`) and runs `yarn build`; a separate `nginx:alpine` stage
copies only the resulting `dist/` output and serves it, with an
SPA-fallback nginx config (`try_files ... /index.html`). The final image
contains no Node runtime, no source code, and no dependency manifests.
`.dockerignore` excludes `node_modules`, `.env`, and other local artifacts
from the build context.

## Alternatives Considered

**Single-stage image (Node serving the built output directly, or via a
static-file npm package):** rejected — ships the entire Node toolchain and
`node_modules` in the final image for no runtime benefit, since a built
Vite app is static files. Also unnecessarily larger (several hundred MB vs.
~30MB) and exposes more surface area (source code, lockfiles) in a
production artifact.

**Serving directly from a cloud provider's static hosting (no Docker at
all):** viable for the frontend alone, but a Docker image was specifically
requested to simulate a real containerized deploy target and catch
environment-parity issues (e.g. Linux case-sensitivity, clean-dependency
resolution) that static-hosting build pipelines might also catch, but not
identically.

## Consequences

**Easier:** the image is small, fast to pull/deploy, and structurally
incapable of leaking source or dependency data since that stage is
discarded. Confirmed in practice: this build surfaced that MSW is correctly
excluded from production output, and clearly demonstrated (via a clean
connection-refused failure) that the frontend has no real backend yet, as
expected at this stage of the project.

**Harder:** `VITE_*` environment variables are baked in at build time, not
read at container runtime — pointing the same image at a different
`VITE_API_BASE_URL` per environment (e.g. staging vs. production) requires
rebuilding the image, not just changing a runtime variable. If this becomes
a real need, revisit with a runtime-config-injection pattern (e.g. a
generated `config.js` fetched at startup) rather than reversing this ADR.
