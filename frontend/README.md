# Kuizz - Frontend

This is the frontend application for the Kuizz platform, built with [Next.js](https://nextjs.org/) and [React](https://react.dev/). It is designed to deliver a highly interactive, animated, and real-time experience for both quiz creators and players.

## 🛠 Tech Stack

- **Framework**: Next.js 15.2
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, PostCSS, Radix UI (for accessible UI primitives)
- **Animations**: Framer Motion (used extensively for leaderboard transitions, score scaling, and game phase changes)
- **Real-Time Communication**: `socket.io-client`
- **Additional Tools**:
  - `@dnd-kit`: For drag-and-drop interactions (e.g., reordering questions).
  - `react-hook-form` / `zod`: (Expected usage for robust form validations).
  - `zustand` / Context API: For client-side state management.
  - `FullCalendar` & `ApexCharts`: For dashboard metrics and timeline views.

## 🎮 Core Frontend Functionalities

### 1. Game Lobby & Gameplay

- **Player Onboarding**: Players can join a session via Game PIN and select an avatar. Guest player avatars are persisted locally using `LocalStorage`.
- **Real-Time Sync**: Subscribes to backend Socket.io events (`next_question`, `timer_update`, `game_ended`) to progress through the quiz in real-time.
- **Multiple Answers**: Supports rendering and selecting multiple options for complex questions.

### 2. Animations & UI Polish

- **Leaderboard**: Utilizes Framer Motion to smoothly animate rank changes (swipe effects) and counter animations when a user's score increases.
- **Timer Visuals**: Smooth countdown bars to indicate remaining time per question.

### 3. Dashboard (Creator Mode)

- **Quiz Management**: Users only see and manage quizzes they created.
- **Interactive Forms**: Robust interfaces for adding questions, settings correct options, etc.

## 🚀 Running the Frontend

Ensure you have installed dependencies from the repository root via `pnpm install`.

1. **Environment Setup**:
   Create a `.env` file in the `frontend` directory (refer to `.env.example`).
   Ensure connection variables point to the backend's API and WebSocket URIs (avoid hardcoded URIs).

2. **Start Development Server**:

   ```bash
   pnpm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

3. **Production Build**:
   ```bash
   pnpm run build
   pnpm run start
   ```

## 📁 Directory Structure Overview (Typical)

- `/src/components`: Reusable UI elements and Game components.
- `/src/hooks`: Custom hooks for WebSocket context and state management.
- `/src/app` (or `/src/pages`): Next.js routing.
- `/public`: Static assets (images, badges, etc.).
