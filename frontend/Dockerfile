# ============================================
# Stage 1: Pruner Stage
# ============================================

ARG NODE_VERSION=24.13.0-slim
FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo
COPY . .
# Prune limits the project to ONLY the frontend and its dependencies
RUN turbo prune kuizz-frontend --docker

# ============================================
# Stage 2: Dependencies Installation Stage
# ============================================

FROM base AS dependencies
WORKDIR /app

# Copy the lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Stage 3: Build Next.js application in standalone mode
# ============================================

FROM base AS builder
WORKDIR /app

# Copy isolated dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/frontend/node_modules ./frontend/node_modules

# Copy application source code
COPY --from=pruner /app/out/full/ ./

ARG NEXT_PUBLIC_API_URL=APP_API_URL_PLACEHOLDER
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL=APP_APP_URL_PLACEHOLDER
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SOCKET_URL=APP_SOCKET_URL_PLACEHOLDER
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ARG API_URL
ENV API_URL=$API_URL

ENV NODE_ENV=production

# Build Next.js application using pnpm
RUN pnpm run build --filter=kuizz-frontend

# ============================================
# Stage 4: Run Next.js application
# ============================================

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENV NEXT_TELEMETRY_DISABLED=1

# Copy production assets
COPY --from=builder --chown=node:node /app/frontend/public ./frontend/public

# Set the correct permission for prerender cache
RUN mkdir -p frontend/.next
RUN chown node:node frontend/.next

# Copy standalone output and static
COPY --from=builder --chown=node:node /app/frontend/.next/standalone ./
COPY --from=builder --chown=node:node /app/frontend/.next/static ./frontend/.next/static

USER node

# Copy entrypoint script
COPY --from=builder /app/frontend/entrypoint.sh ./frontend/entrypoint.sh
USER root
RUN chmod +x ./frontend/entrypoint.sh
USER node

EXPOSE 3000

WORKDIR /app/frontend
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]