# ---------- Base ----------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY frontend/package.json ./frontend/

# Install only frontend deps
RUN pnpm install --frozen-lockfile --filter kuizz-frontend

# ---------- Builder ----------
FROM base AS builder
COPY --from=deps /app /app
COPY . .

WORKDIR /app/frontend

RUN pnpm build

# ---------- Production ----------
FROM node:22-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY frontend/package.json ./frontend/

COPY frontend/.env.production frontend/.env

# Install ONLY production frontend deps
# RUN pnpm install --frozen-lockfile --filter kuizz-frontend --prod --ignore-scripts

# Copy standalone output (Next 13+)
COPY --from=builder /app/frontend/.next/standalone frontend/.next/standalone
COPY --from=builder /app/frontend/public frontend/.next/standalone/frontend/public
COPY --from=builder /app/frontend/.next/static frontend/.next/standalone/frontend/.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "frontend/.next/standalone/frontend/server.js"]