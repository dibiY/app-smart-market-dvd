# ─────────────────────────────────────────────────────────────────────────────
# Smart Market DVD — Multi-stage Dockerfile
#
# Build targets:
#   deps     — shared base: installs production + dev dependencies (cached layer)
#   dev      — local development with Vite hot-reload (volume-mounted source)
#   builder  — compiles the app for a specific Vite mode (local/test/recette/prod)
#   runner   — final lean image: nginx:alpine + pre-built static files only
#
# Common usage:
#   docker build --target runner \
#     --build-arg VITE_MODE=production \
#     --build-arg VITE_API_URL=https://api.example.com \
#     -t smart-market-dvd:prod .
#
# Image sizes (expected):
#   deps    ~300 MB  (node:22-alpine + node_modules)
#   dev     ~300 MB  (same layer, used at runtime with bind mount)
#   builder ~300 MB  (discarded after build — never pushed)
#   runner   ~25 MB  (nginx:alpine + ~2 MB of static JS/CSS)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps

# libc6-compat is needed for some native bindings on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the manifest files first so this layer is cache-friendly.
# It is only invalidated when package.json or package-lock.json changes.
COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile


# ── Stage 2: development server (hot-reload) ─────────────────────────────────
FROM deps AS dev

# Source is NOT copied here — it is bind-mounted by docker-compose at runtime.
# This keeps the image lean and ensures edits are reflected instantly.
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# ── Stage 3: production/env build ────────────────────────────────────────────
FROM deps AS builder

# Vite mode controls which .env.<mode> file is loaded at build time.
# All VITE_* vars are baked into the JS bundle — they are NOT runtime secrets.
ARG VITE_MODE=production
ARG VITE_API_URL
ARG VITE_USE_MOCK=false
ARG VITE_PRICES_IN_CENTS=false

# Expose build args as environment variables so Vite can read them
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK
ENV VITE_PRICES_IN_CENTS=$VITE_PRICES_IN_CENTS

# Copy the full source (respects .dockerignore — no node_modules, no .env.local)
COPY . .

# tsc type-check + vite build for the requested mode
RUN npm run build -- --mode $VITE_MODE


# ── Stage 4: lean runtime image ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Drop to a non-root user for security
RUN addgroup -g 101 -S nginx-app && \
    adduser  -u 101 -S nginx-app -G nginx-app 2>/dev/null || true

# Copy the nginx configuration (SPA routing + cache headers + gzip)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the compiled static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix ownership so nginx can read the files
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
