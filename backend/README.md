# Kuizz - Backend

This is the robust backend service for the Kuizz platform, constructed using the [NestJS](https://nestjs.com/) framework. It acts as both a traditional REST API and a real-time WebSocket server.

## 🛠 Tech Stack

- **Framework**: NestJS 11
- **Database ORM**: Prisma Client (`@prisma/client`, `@prisma/adapter-pg`)
- **Database**: PostgreSQL
- **WebSockets**: `@nestjs/websockets`, `socket.io`
- **Distributed State**: Redis (`ioredis`, `@socket.io/redis-adapter`) for scaling WebSocket instances.
- **Authentication**: Passport.js (Local, JWT, Google OAuth20, Github OAuth2).
- **Other Utilities**: `exceljs` for importing/exporting quizzes, `multer` for file uploads, `bcrypt` for hashing.

## ⚙️ Core Backend Architecture

### 1. Real-Time Game Gateway (`game.gateway.ts`)

This is the heart of the live quiz sessions. It manages:

- **Session State**: Tracking which users are in which "room" via a Game PIN.
- **Phases & Timers**: Careful management of `setTimeout` intervals for question durations. Ensures timers skip properly when hosts skip questions without interfering with subsequent game phases.
- **Score Calculation**: Computes scores based on speed and accuracy. Includes complex logic to evaluate questions with **multiple correct answers**.
- **Broadcasting**: Emits synchronized events to all clients in a specific room (e.g., `show_leaderboard`, `question_start`).

### 2. Database & Prisma

- Manages User accounts, Quiz definitions, Questions, Options, and Game session history.
- Utilizes migrations to keep the schema aligned with application requirements.

### 3. Authentication & Authorization

- Secures dashboard routes ensuring users only have access to perform CRUD operations on their _own_ quizzes.
- Validates game join requests and player sessions.

## 🚀 Running the Backend

Ensure you have installed dependencies from the repository root via `pnpm install`, and you have PostgreSQL and Redis instances running.

1. **Environment Setup**:
   Create a `.env` file in the `backend` directory based on `.env.example`.
   Requires DB Connection Strings, Redis URL, JWT Secrets, and OAuth credentials.

2. **Database Migration**:
   Before running the app, apply Prisma migrations to ensure your DB schema is up-to-date.

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Start Development Server**:

   ```bash
   pnpm run start:dev
   ```

   The API will typically run on `http://localhost:3001` (or your defined port).

4. **Production Build**:
   ```bash
   pnpm run build
   pnpm run start:prod
   ```

## 🔍 Development Guidelines

- Always avoid hardcoding URLs; use the NestJS `ConfigService` to read from the environment.
- When working on the `game.gateway.ts`, heavily scrutinize timer logic to prevent async race conditions or memory leaks from orphaned timeouts.
