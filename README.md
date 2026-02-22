# Kuizz

Kuizz is a real-time, interactive multiplayer quiz application (similar to Kahoot). It allows users to create, manage, and host live quizzes where players can join using a game PIN, answer questions in real-time, and compete on a live leaderboard.

This repository uses a **Monorepo** architecture managed by **PNPM Workspaces**. It is split into two main packages: `frontend` and `backend`.

## 🏗 Project Architecture

- **Frontend**: A Next.js 15 application utilizing React 19, Tailwind CSS v4, and Framer Motion for rich, interactive, and animated user interfaces during gameplay.
- **Backend**: A NestJS 11 application providing a robust REST API and handling real-time WebSocket communication via Socket.io with a Redis adapter. It uses Prisma ORM with PostgreSQL for data persistence.

## 🚀 Key Features

- **Real-Time Gameplay**: Seamless, low-latency live quiz sessions synchronized over WebSockets.
- **Advanced Question Types**: Supports multiple-choice questions with single or multiple correct answers.
- **Interactive Capabilities**: Dynamic game timers, animated scoreboards, and swipe-effect leaderboards.
- **Guest Play & Avatars**: Players can join quickly as guests, with their selected avatars saved in LocalStorage.
- **Creator Dashboard**: Authenticated users can create, edit, and manage their own quizzes. Filtered to only show user-specific quizzes.
- **Authentication**: JWT, Google OAuth, and GitHub OAuth support via Passport.js.

## 📁 Repository Structure

```text
kuizz/
├── backend/          # NestJS Server & WebSocket Gateway
├── frontend/         # Next.js Application
├── pnpm-workspace.yaml
└── package.json
```

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [PNPM](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) (for backend database)
- [Redis](https://redis.io/) (for Socket.io adapter / caching)

## 🏁 Getting Started

1. **Install Dependencies** (from project root):

   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Setup the environment variables by copying the examples inside both `frontend` and `backend` directories.

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start the Database** (Optional, using Docker):

   ```bash
   docker-compose -f docker-compose-backend.yml up -d
   ```

4. **Run Development Servers**:
   You can run both apps individually in different terminal tabs.

   **Frontend:**

   ```bash
   cd frontend
   pnpm run dev
   ```

   **Backend:**

   ```bash
   cd backend
   pnpm run start:dev
   ```

---

For more specific details, please refer to the [Frontend README](./frontend/README.md) and [Backend README](./backend/README.md).
