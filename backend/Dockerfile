# ---------- Base ----------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps

# Copy root workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy backend package.json only
COPY backend/package.json ./backend/

# Install only backend deps
RUN pnpm install --frozen-lockfile --filter kuizz-backend

# ---------- Builder ----------
FROM base AS builder

COPY --from=deps /app /app
COPY . .

WORKDIR /app/backend

RUN pnpm prisma:generate

RUN pnpm build

# ---------- Production ----------
FROM node:22-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# Copy workspace metadata and backend package
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

# also copy prisma directory so migrations can run at container startup
COPY backend/prisma ./backend/prisma

# Install backend dependencies (including dev tools for migration/seed)
# we include dev dependencies so that `prisma` CLI and `ts-node` are available at runtime
RUN pnpm install --frozen-lockfile --filter kuizz-backend \
    # ensure the nestjs user can write into node_modules during migrations
    && chown -R nestjs:nodejs /app/node_modules /app/backend

# Copy built files
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

# copy entrypoint script that will run migrations and seed on start
# path is relative to build context; script lives under backend/
COPY --chown=nestjs:nodejs backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nestjs

EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]