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

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN pnpm prisma:generate
RUN pnpm build

# ---------- Production ----------
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nestjs
WORKDIR /app

RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# copy only needed files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.sh ./

RUN chmod +x ./docker-entrypoint.sh
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["sh", "./docker-entrypoint.sh"]