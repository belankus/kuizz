# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 1: Pruner Stage
FROM base AS pruner
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo
COPY . .
# Prune limits the project to ONLY the docs and its dependencies
RUN turbo prune kuizz-docs --docker

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy the lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/docs/node_modules ./docs/node_modules

# Copy isolated source code
COPY --from=pruner /app/out/full/ ./

# Build the Next.js app
RUN pnpm run build --filter=kuizz-docs

# Stage 4: Production runner (minimal image)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the standalone output and static assets
COPY --from=builder /app/docs/public ./docs/public
RUN mkdir -p docs/.next
RUN chown nextjs:nodejs docs/.next

COPY --from=builder --chown=nextjs:nodejs /app/docs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/docs/.next/static ./docs/.next/static

USER nextjs

EXPOSE 3000

WORKDIR /app/docs
CMD ["node", "server.js"]
