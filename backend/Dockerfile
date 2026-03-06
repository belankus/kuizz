# ---------- Base ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Builder ----------
FROM base AS builder

RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# copy lockfile + package dulu (cache layer optimal)
COPY package.json pnpm-lock.yaml ./

# install SEMUA deps (jangan --prod di builder)
RUN pnpm install --frozen-lockfile

COPY . .

# Pass DATABASE_URL for prisma generate if needed (defaults to local for build)
ARG DATABASE_URL=postgresql://postgres:secret@postgres:5432/kuizz?schema=public
ENV DATABASE_URL=$DATABASE_URL

RUN pnpm prisma:generate && pnpm build

# ---------- Production Dependencies ----------
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
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
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.sh ./

RUN chmod +x ./docker-entrypoint.sh && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["sh", "./docker-entrypoint.sh"]