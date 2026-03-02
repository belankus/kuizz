# ---------- Base ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Builder ----------
FROM base AS builder

# optional: build tools untuk bcrypt/prisma native deps
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --filter kuizz-backend...

COPY . .
WORKDIR /app/backend

# dummy env supaya prisma generate tidak error
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN pnpm prisma:generate && pnpm build

# ---------- Production ----------
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nestjs

ENV HOME=/home/nestjs
RUN mkdir -p $HOME && chown -R nestjs:nodejs $HOME

RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --prod --filter kuizz-backend... --ignore-scripts

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts

COPY backend/docker-entrypoint.sh ./backend/
RUN chmod +x ./backend/docker-entrypoint.sh

RUN chown -R nestjs:nodejs /app

WORKDIR /app/backend
USER nestjs

EXPOSE 3001

CMD ["sh", "./docker-entrypoint.sh"]