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

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

# Install ONLY production backend deps
RUN pnpm install --frozen-lockfile --filter kuizz-backend --prod --ignore-scripts

# Copy built files
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

USER nestjs

EXPOSE 3001
CMD ["node", "dist/src/main.js"]