# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Manobalam is a mental-health teletherapy platform: users book sessions with psychologists, pay via Razorpay, and attend video/chat sessions. Monorepo with two independent packages (no root package.json — run commands inside `client/` or `server/`).

## Commands

### client/ (React 19 + Vite + TypeScript)
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint

### server/ (Express 5 + TypeScript)
- `npm run dev` — ts-node-dev with respawn (uses `tsconfig-paths` for `@/` aliases)
- `npm run build` / `npm start` — compile to `dist/`, run
- `npm run lint` — ESLint
- `npm test` — Jest; single test: `npx jest path/to/file.test.ts` or `npx jest -t "name"`. Tests live next to source (e.g. `auth.validation.test.ts`).

Server requires MongoDB, Redis, and many env vars validated by Zod in `server/src/config/env.ts` (startup fails fast if missing) — see that file for the full list (Razorpay, Cloudinary, Resend, TURN server, JWT secrets, etc.).

## Architecture

### Server (`server/src`)
- **Module pattern**: `modules/<name>/` each contain `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.model.ts` (Mongoose), `*.validation.ts` (Zod), `*.types.ts`. All routers are mounted under `/api` in `routes/index.ts`. Modules: auth, user, psychologist, availability, appointment, payment, session, chat, feedback, assessment, crisis, admin, contact, notification.
- **Entry**: `server.ts` connects DB, creates the Express app (`app.ts`), initializes Socket.io (`sockets/index.ts`), and starts BullMQ workers.
- **Auth**: JWT access token (Bearer header) + httpOnly refresh cookie; payload carries `userId`, `role`, `authVersion`. Roles in `constants/roles.constant.ts`; middleware in `middlewares/auth.middleware.ts`. Same auth is applied to sockets via `sockets/middleware/socketAuth.middleware.ts`.
- **Razorpay webhook** (`/api/payments/webhook/razorpay`) is mounted in `app.ts` with `express.raw()` BEFORE global `express.json()` — signature verification needs the raw byte body. Do not move this route or reorder body parsers.
- **Real-time** (`sockets/handlers/`): presence, session presence, chat, WebRTC signaling (video calls use TURN config from env), emergency. Each connected user joins room `user:<userId>`. `sessionLifecycle.service.ts` holds the Socket.io server for session state transitions.
- **Background jobs** (BullMQ + Redis, `jobs/`): slot generation (scheduled at startup), notifications, reminders. Queue and worker per job type.
- **Errors**: throw `utils/ApiError` with codes from `constants/errorCodes.constant.ts`; handled centrally in `middlewares/error.middleware.ts`. The client relies on the `code` field (e.g. `TOKEN_EXPIRED` drives token refresh).
- Path alias `@/*` → `src/*` in both packages.

### Client (`client/src`)
- **Feature folders** (`features/<name>/`) mirroring server modules, each with `api/`, `components/`, `hooks/`, `pages/`, `store/`, `types/` as needed.
- **Routing**: `app/router.tsx` (react-router v7 `createBrowserRouter`); route guards in `routes/` — `ProtectedRoute`, `GuestRoute`, `RoleRoute`, `ApprovedPsychologistRoute`.
- **State**: Zustand global stores in `stores/` (`userStore` holds the access token, `uiStore`); feature-local stores under each feature's `store/`.
- **API layer**: `lib/axios.ts` — axios instance with `withCredentials`, attaches Bearer token from `userStore`, and auto-refreshes on `TOKEN_EXPIRED` error code with a request queue. Base URL from `VITE_API_BASE_URL`.
- **Sockets**: `lib/socket.ts` (socket.io-client) for chat, presence, and WebRTC signaling.
- Styling: Tailwind CSS v4 + shadcn/radix components; theming via `next-themes`.
