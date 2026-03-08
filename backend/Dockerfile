# ---------- Base ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Pruner ----------
FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
# Prune limits the project to ONLY the backend and its dependencies
RUN turbo prune kuizz-backend --docker

# ---------- Builder ----------
FROM base AS builder

RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy only the pruned lockfile and packages to install deps
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies (ignoring scripts & side effects cache initially can speed things up, but typical pnpm install is fine)
RUN pnpm install --frozen-lockfile

# Copy the actual pruned source code
COPY --from=pruner /app/out/full/ ./

# Pass DATABASE_URL for prisma generate if needed (defaults to local for build)
ARG DATABASE_URL=postgresql://postgres:secret@postgres:5432/kuizz?schema=public
ENV DATABASE_URL=$DATABASE_URL

# Build the project (Turbo will build just this workspace)
RUN pnpm run build --filter=kuizz-backend

# ---------- Production Dependencies ----------
FROM base AS prod-deps
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile

# ---------- Production ----------
FROM base AS runner
ENV NODE_ENV=production

RUN mkdir -p /home/nestjs && addgroup --system nodejs && adduser --system --ingroup nodejs --home /home/nestjs nestjs && chown -R nestjs:nodejs /home/nestjs
ENV HOME=/home/nestjs
WORKDIR /app

RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# copy only needed files
COPY --from=pruner /app/out/json/package.json ./package.json
COPY --from=pruner /app/out/json/backend/package.json ./backend/package.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=builder /app/backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh

RUN chmod +x ./backend/docker-entrypoint.sh && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

WORKDIR /app/backend
CMD ["sh", "./docker-entrypoint.sh"]